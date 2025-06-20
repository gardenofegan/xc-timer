<script lang="ts">
  import QrScanner from 'qr-scanner';
  import { session } from '../stores/session';
  import type { TimingSession, Team, Runner, TimeEntry } from '../types';
  
  let fileInput: HTMLInputElement;
  let videoElement: HTMLVideoElement;
  let qrScanner: QrScanner | null = null;
  let isScanning = false;
  let importStatus = '';
  let hasCamera = false;
  let cameraCheckComplete = false;
  let cameraError = '';

  // Import mode and preview
  let importMode: 'merge' | 'replace' | 'selective' = 'merge';
  let previewData: TimingSession | null = null;
  let showPreview = false;
  
  // Selective import options
  let importTeams = true;
  let importRunners = true;
  let importTimes = true;
  let selectedTeamIds: string[] = [];
  let selectedRaces: string[] = [];

  async function checkCameraSupport() {
    try {
      console.log('Checking camera support...');
      
      // First check if QrScanner has camera support
      const supported = await QrScanner.hasCamera();
      console.log('QrScanner.hasCamera():', supported);
      
      if (supported) {
        // Try to get user media to verify actual camera access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          console.log('Camera stream obtained successfully');
          
          // Stop the stream immediately since we just wanted to test access
          stream.getTracks().forEach(track => track.stop());
          
          hasCamera = true;
          cameraError = '';
        } catch (mediaError) {
          console.error('getUserMedia error:', mediaError);
          hasCamera = false;
          
          if (mediaError.name === 'NotAllowedError') {
            cameraError = 'Camera access denied. Please allow camera permissions and refresh the page.';
          } else if (mediaError.name === 'NotFoundError') {
            cameraError = 'No camera found on this device.';
          } else if (mediaError.name === 'NotSupportedError') {
            cameraError = 'Camera not supported in this browser.';
          } else {
            cameraError = `Camera error: ${mediaError.message}`;
          }
        }
      } else {
        hasCamera = false;
        cameraError = 'Camera not supported on this device or browser.';
      }
      
      cameraCheckComplete = true;
      console.log('Camera check complete. hasCamera:', hasCamera, 'error:', cameraError);
    } catch (error) {
      console.error('Error checking camera support:', error);
      hasCamera = false;
      cameraError = 'Failed to check camera support.';
      cameraCheckComplete = true;
    }
  }

  async function startScanning() {
    if (!videoElement || isScanning || !hasCamera) {
      console.log('Cannot start scanning:', { videoElement: !!videoElement, isScanning, hasCamera });
      return;
    }
    
    try {
      importStatus = 'Starting camera...';
      console.log('Creating QR scanner...');
      
      qrScanner = new QrScanner(
        videoElement,
        (result) => {
          console.log('QR code detected:', result.data);
          stopScanning();
          handleQRResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera if available
          maxScansPerSecond: 5,
        }
      );
      
      console.log('Starting QR scanner...');
      await qrScanner.start();
      
      isScanning = true;
      importStatus = 'Scanning for QR code... Point camera at QR code';
      console.log('QR scanner started successfully');
      
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      
      let errorMessage = 'Failed to start camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera access denied. Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints could not be satisfied.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      importStatus = errorMessage;
      isScanning = false;
      
      // Clear error after 10 seconds
      setTimeout(() => {
        if (importStatus === errorMessage) {
          importStatus = '';
        }
      }, 10000);
    }
  }

  function stopScanning() {
    console.log('Stopping QR scanner...');
    if (qrScanner) {
      qrScanner.destroy();
      qrScanner = null;
      console.log('QR scanner destroyed');
    }
    isScanning = false;
    if (!importStatus.includes('QR code detected') && !importStatus.includes('Data loaded')) {
      importStatus = '';
    }
  }

  function handleQRResult(data: string) {
    try {
      console.log('Processing QR result, data length:', data.length);
      const sessionData = JSON.parse(data) as TimingSession;
      console.log('QR data parsed successfully:', sessionData);
      processImportData(sessionData);
    } catch (error) {
      console.error('Error parsing QR code:', error);
      importStatus = 'Invalid QR code data - not a valid timing session';
      setTimeout(() => importStatus = '', 5000);
    }
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const sessionData = JSON.parse(data) as TimingSession;
        processImportData(sessionData);
      } catch (error) {
        console.error('Error parsing file:', error);
        importStatus = 'Invalid file format - not a valid JSON timing session';
        setTimeout(() => importStatus = '', 3000);
      }
    };
    reader.readAsText(file);
  }

  function handleManualImport(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const data = target.value.trim();
    
    if (!data) return;
    
    try {
      const sessionData = JSON.parse(data);
      processImportData(sessionData);
      target.value = '';
    } catch (error) {
      importStatus = 'Invalid JSON format';
      setTimeout(() => importStatus = '', 3000);
    }
  }

  function processImportData(importedSession: TimingSession) {
    previewData = importedSession;
    showPreview = true;
    
    // Initialize selective import selections
    selectedTeamIds = importedSession.teams?.map(t => t.id) || [];
    selectedRaces = [...new Set(importedSession.times?.map(t => t.raceName).filter(Boolean))] || [];
    
    importStatus = 'Data loaded! Review and confirm import below.';
    setTimeout(() => importStatus = '', 5000);
  }

  function executeImport() {
    if (!previewData) return;

    switch (importMode) {
      case 'replace':
        replaceSessionData(previewData);
        break;
      case 'selective':
        selectiveImport(previewData);
        break;
      case 'merge':
      default:
        mergeSessionData(previewData);
        break;
    }

    // Reset state
    previewData = null;
    showPreview = false;
    importStatus = 'Import completed successfully!';
    setTimeout(() => importStatus = '', 3000);
  }

  function replaceSessionData(importedSession: TimingSession) {
    session.set({
      ...importedSession,
      id: $session.id, // Keep current session ID
      updated: Date.now()
    });
  }

  function selectiveImport(importedSession: TimingSession) {
    let newTeams: Team[] = [];
    let newRunners: Runner[] = [];
    let newTimes: TimeEntry[] = [];

    // Import selected teams
    if (importTeams) {
      newTeams = importedSession.teams?.filter(t => selectedTeamIds.includes(t.id)) || [];
    }

    // Import selected runners (only if their team is selected)
    if (importRunners) {
      newRunners = importedSession.runners?.filter(r => selectedTeamIds.includes(r.teamId)) || [];
    }

    // Import selected times (only for selected races and runners)
    if (importTimes) {
      const selectedRunnerIds = new Set(newRunners.map(r => r.id));
      newTimes = importedSession.times?.filter(t => 
        selectedRunnerIds.has(t.runnerId) && 
        (!t.raceName || selectedRaces.includes(t.raceName))
      ) || [];
    }

    // Merge with existing data
    const existingTeamNames = new Set($session.teams.map(t => t.name.toLowerCase()));
    const existingRunnerNames = new Set($session.runners.map(r => r.name.toLowerCase()));

    // Handle team conflicts
    const teamsToAdd = newTeams.filter(team => !existingTeamNames.has(team.name.toLowerCase()));
    const teamIdMapping = new Map<string, string>();
    
    newTeams.forEach(importedTeam => {
      const existingTeam = $session.teams.find(t => t.name.toLowerCase() === importedTeam.name.toLowerCase());
      if (existingTeam) {
        teamIdMapping.set(importedTeam.id, existingTeam.id);
      } else {
        const newId = crypto.randomUUID();
        teamIdMapping.set(importedTeam.id, newId);
        teamsToAdd.push({ ...importedTeam, id: newId });
      }
    });

    // Handle runner conflicts and update team IDs
    const runnersToAdd = newRunners.filter(runner => !existingRunnerNames.has(runner.name.toLowerCase()));
    const runnerIdMapping = new Map<string, string>();
    
    newRunners.forEach(importedRunner => {
      const existingRunner = $session.runners.find(r => r.name.toLowerCase() === importedRunner.name.toLowerCase());
      if (existingRunner) {
        runnerIdMapping.set(importedRunner.id, existingRunner.id);
      } else {
        const newId = crypto.randomUUID();
        const newTeamId = teamIdMapping.get(importedRunner.teamId) || importedRunner.teamId;
        runnerIdMapping.set(importedRunner.id, newId);
        runnersToAdd.push({ ...importedRunner, id: newId, teamId: newTeamId });
      }
    });

    // Update time entries with new runner IDs
    const timesToAdd = newTimes.map(time => ({
      ...time,
      runnerId: runnerIdMapping.get(time.runnerId) || time.runnerId
    }));

    // Update session
    session.update(currentSession => ({
      ...currentSession,
      teams: [...currentSession.teams, ...teamsToAdd],
      runners: [...currentSession.runners, ...runnersToAdd],
      times: [...currentSession.times, ...timesToAdd],
      unit: importedSession.unit || currentSession.unit,
      updated: Date.now()
    }));
  }

  function mergeSessionData(importedSession: TimingSession) {
    // Simple merge strategy: combine runners and times
    const existingRunnerNames = new Set($session.runners.map(r => r.name.toLowerCase()));
    const existingTeamNames = new Set($session.teams.map(t => t.name.toLowerCase()));

    // Handle teams
    const newTeams = importedSession.teams?.filter(
      team => !existingTeamNames.has(team.name.toLowerCase())
    ) || [];

    const teamIdMapping = new Map<string, string>();
    (importedSession.teams || []).forEach(importedTeam => {
      const existingTeam = $session.teams.find(t => 
        t.name.toLowerCase() === importedTeam.name.toLowerCase()
      );
      if (existingTeam) {
        teamIdMapping.set(importedTeam.id, existingTeam.id);
      } else {
        const newId = crypto.randomUUID();
        teamIdMapping.set(importedTeam.id, newId);
        newTeams.push({ ...importedTeam, id: newId });
      }
    });

    // Handle runners
    const newRunners = (importedSession.runners || []).filter(
      runner => !existingRunnerNames.has(runner.name.toLowerCase())
    );

    const runnerIdMapping = new Map<string, string>();
    (importedSession.runners || []).forEach(importedRunner => {
      const existingRunner = $session.runners.find(r => 
        r.name.toLowerCase() === importedRunner.name.toLowerCase()
      );
      if (existingRunner) {
        runnerIdMapping.set(importedRunner.id, existingRunner.id);
      } else {
        const newId = crypto.randomUUID();
        const newTeamId = teamIdMapping.get(importedRunner.teamId) || importedRunner.teamId;
        runnerIdMapping.set(importedRunner.id, newId);
        newRunners.push({ ...importedRunner, id: newId, teamId: newTeamId });
      }
    });

    // Map imported times to correct runner IDs
    const newTimes = (importedSession.times || []).map(time => ({
      ...time,
      runnerId: runnerIdMapping.get(time.runnerId) || time.runnerId
    }));

    // Update session with merged data
    session.update(currentSession => ({
      ...currentSession,
      teams: [...currentSession.teams, ...newTeams],
      runners: [...currentSession.runners, ...newRunners],
      times: [...currentSession.times, ...newTimes],
      unit: importedSession.unit || currentSession.unit,
      updated: Date.now()
    }));
  }

  function cancelImport() {
    previewData = null;
    showPreview = false;
    importStatus = '';
  }

  function getImportSummary(): string {
    if (!previewData) return '';
    
    const teams = previewData.teams?.length || 0;
    const runners = previewData.runners?.length || 0;
    const times = previewData.times?.length || 0;
    const races = new Set(previewData.times?.map(t => t.raceName).filter(Boolean)).size;
    
    return `${teams} teams, ${runners} runners, ${times} times across ${races} races`;
  }

  // Check camera support on mount
  checkCameraSupport();

  // Cleanup on destroy
  function handleDestroy() {
    stopScanning();
  }
</script>

<svelte:window on:beforeunload={handleDestroy} />

<div class="import-container">
  <div class="header">
    <h2>Import Data</h2>
    <p>Import timing data from other devices or backup files</p>
  </div>

  {#if !showPreview}
    <div class="import-methods">
      <!-- QR Code Scanner Section -->
      <div class="method-card">
        <h3>📱 Scan QR Code</h3>
        <p>Scan a QR code generated by another timer device</p>
        
        {#if !cameraCheckComplete}
          <div class="camera-status">
            <div class="loading-spinner"></div>
            Checking camera availability...
          </div>
        {:else if !hasCamera}
          <div class="camera-status error">
            📷 {cameraError}
            <br><small>QR scanning requires camera access on your device.</small>
            <button class="retry-btn" on:click={checkCameraSupport}>
              🔄 Retry Camera Check
            </button>
          </div>
        {:else if !isScanning}
          <button class="method-btn primary" on:click={startScanning}>
            📷 Start Camera
          </button>
        {:else}
          <div class="scanner-container">
            <video bind:this={videoElement} class="scanner-video" autoplay playsinline muted></video>
            <button class="stop-btn" on:click={stopScanning}>
              ⏹️ Stop Scanning
            </button>
            <div class="scanner-instructions">
              Point your camera at a QR code to scan
            </div>
          </div>
        {/if}
      </div>

      <!-- File Upload Section -->
      <div class="method-card">
        <h3>📁 Upload File</h3>
        <p>Import timing data from a JSON backup file</p>
        
        <input 
          bind:this={fileInput}
          type="file" 
          accept=".json"
          on:change={handleFileUpload}
          class="file-input"
          id="file-upload"
        />
        <label for="file-upload" class="method-btn secondary">
          📂 Choose File
        </label>
      </div>

      <!-- Manual Import Section -->
      <div class="method-card">
        <h3>🔄 Manual Import</h3>
        <p>Paste JSON data directly</p>
        
        <textarea 
          placeholder="Paste JSON data here..."
          class="json-input"
          on:paste={(e) => {
            setTimeout(() => handleManualImport(e), 100);
          }}
        ></textarea>
      </div>
    </div>
  {:else}
    <div class="preview-section">
      <div class="preview-header">
        <h3>Import Preview</h3>
        <div class="preview-summary">
          <strong>{previewData?.name || 'Imported Session'}</strong><br>
          {getImportSummary()}
        </div>
      </div>

      <div class="import-mode-section">
        <h4>How would you like to import this data?</h4>
        <div class="mode-options">
          <label class="mode-option">
            <input type="radio" bind:group={importMode} value="merge" />
            <div class="option-content">
              <div class="option-title">🔄 Merge</div>
              <div class="option-description">Combine with existing data (recommended)</div>
            </div>
          </label>

          <label class="mode-option">
            <input type="radio" bind:group={importMode} value="selective" />
            <div class="option-content">
              <div class="option-title">🎯 Selective</div>
              <div class="option-description">Choose specific teams, races, or data types</div>
            </div>
          </label>

          <label class="mode-option">
            <input type="radio" bind:group={importMode} value="replace" />
            <div class="option-content">
              <div class="option-title">⚠️ Replace All</div>
              <div class="option-description">Replace all current data (destructive)</div>
            </div>
          </label>
        </div>
      </div>

      {#if importMode === 'selective'}
        <div class="selective-options">
          <h4>Select what to import:</h4>
          
          <div class="data-type-options">
            <label class="checkbox-option">
              <input type="checkbox" bind:checked={importTeams} />
              <span>Teams ({previewData?.teams?.length || 0})</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" bind:checked={importRunners} />
              <span>Runners ({previewData?.runners?.length || 0})</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" bind:checked={importTimes} />
              <span>Times ({previewData?.times?.length || 0})</span>
            </label>
          </div>

          {#if importTeams && previewData?.teams?.length}
            <div class="selection-group">
              <h5>Select Teams:</h5>
              <div class="team-checkboxes">
                {#each previewData.teams as team}
                  <label class="checkbox-option">
                    <input 
                      type="checkbox" 
                      bind:group={selectedTeamIds} 
                      value={team.id} 
                    />
                    <span style="color: {team.color}">{team.name}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/if}

          {#if importTimes && selectedRaces.length > 0}
            <div class="selection-group">
              <h5>Select Races:</h5>
              <div class="race-checkboxes">
                {#each [...new Set(previewData?.times?.map(t => t.raceName).filter(Boolean))] as race}
                  <label class="checkbox-option">
                    <input 
                      type="checkbox" 
                      bind:group={selectedRaces} 
                      value={race} 
                    />
                    <span>{race}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="preview-actions">
        <button class="action-btn secondary" on:click={cancelImport}>
          Cancel
        </button>
        <button class="action-btn primary" on:click={executeImport}>
          {importMode === 'replace' ? 'Replace Data' : 'Import Data'}
        </button>
      </div>
    </div>
  {/if}

  {#if importStatus}
    <div class="status-message" class:success={importStatus.includes('success')} class:error={importStatus.includes('Failed') || importStatus.includes('Invalid') || importStatus.includes('denied') || importStatus.includes('Error')}>
      {importStatus}
    </div>
  {/if}

  {#if !showPreview}
    <div class="info-section">
      <h4>Import Information</h4>
      <ul>
        <li><strong>Merge:</strong> Combines imported data with existing data</li>
        <li><strong>Selective:</strong> Choose specific teams, races, or data types to import</li>
        <li><strong>Replace:</strong> Completely replaces all current data (use with caution)</li>
        <li>Runners with the same name will be combined automatically</li>
        <li>Teams with the same name will be combined automatically</li>
      </ul>
    </div>
  {/if}
</div>

<style>
  .import-container {
    padding: 1rem;
    max-width: 700px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 2rem;
  }

  .header h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .header p {
    margin: 0;
    color: var(--text-secondary);
  }

  .import-methods {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .method-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .method-card h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .method-card p {
    margin: 0 0 1rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .camera-status {
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    font-weight: 500;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .camera-status.error {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: var(--danger);
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-top: 2px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-btn:hover {
    background: var(--primary-hover);
  }

  .method-btn {
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }

  .method-btn.primary {
    background: var(--primary);
    color: white;
  }

  .method-btn.primary:hover {
    background: var(--primary-hover);
  }

  .method-btn.secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .method-btn.secondary:hover {
    background: var(--bg-hover);
  }

  .file-input {
    display: none;
  }

  .scanner-container {
    position: relative;
    text-align: center;
  }

  .scanner-video {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    border: 2px solid var(--primary);
  }

  .scanner-instructions {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-style: italic;
  }

  .stop-btn {
    background: var(--danger);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .stop-btn:hover {
    background: var(--danger-hover);
  }

  .json-input {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-family: monospace;
    font-size: 0.875rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    resize: vertical;
  }

  .json-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .preview-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
    margin-bottom: 2rem;
  }

  .preview-header {
    margin-bottom: 2rem;
  }

  .preview-header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .preview-summary {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .import-mode-section {
    margin-bottom: 2rem;
  }

  .import-mode-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .mode-options {
    display: grid;
    gap: 0.75rem;
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-option:hover {
    border-color: var(--primary);
    background: var(--bg-hover);
  }

  .mode-option:has(input:checked) {
    border-color: var(--primary);
    background: var(--primary-alpha);
  }

  .mode-option input[type="radio"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .option-content {
    flex: 1;
  }

  .option-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .selective-options {
    background: var(--bg-primary);
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }

  .selective-options h4 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .data-type-options {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }

  .checkbox-option:hover {
    background: var(--bg-hover);
  }

  .checkbox-option input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .selection-group {
    margin-bottom: 1.5rem;
  }

  .selection-group h5 {
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .team-checkboxes, .race-checkboxes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
  }

  .preview-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .action-btn {
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.primary {
    background: var(--primary);
    color: white;
  }

  .action-btn.primary:hover {
    background: var(--primary-hover);
  }

  .action-btn.secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .action-btn.secondary:hover {
    background: var(--bg-hover);
  }

  .status-message {
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  .status-message.success {
    background: var(--success-bg);
    color: var(--success);
  }

  .status-message.error {
    background: var(--danger-bg);
    color: var(--danger);
  }

  .info-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .info-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .info-section ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--text-secondary);
  }

  .info-section li {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 480px) {
    .data-type-options {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .team-checkboxes, .race-checkboxes {
      grid-template-columns: 1fr;
    }
    
    .preview-actions {
      flex-direction: column;
    }
  }
</style>