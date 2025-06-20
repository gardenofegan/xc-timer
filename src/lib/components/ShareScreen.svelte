<script lang="ts">
  import { session } from '../stores/session';
  import { shareData, generateQRCode, downloadJSON } from '../utils/sharing';
  import type { TimingSession, Team, Runner, TimeEntry } from '../types';
  
  let qrCodeUrl = '';
  let isGeneratingQR = false;
  let shareStatus = '';
  
  // Selection state
  let shareMode: 'all' | 'team' | 'checkpoint' | 'race' = 'all';
  let selectedTeamId = '';
  let selectedCheckpoint = '';
  let selectedRace = '';

  // Get unique races from times
  $: uniqueRaces = [...new Set($session.times.map(t => t.raceName).filter(Boolean))];
  
  // Get checkpoints based on unit
  $: checkpoints = $session.unit === 'km' 
    ? ['1K', '2K', '3K', '4K', '5K']
    : ['1M', '2M', '3M', '3.1M'];

  function createFilteredSession(): TimingSession {
    let filteredRunners: Runner[] = [];
    let filteredTimes: TimeEntry[] = [];
    let filteredTeams: Team[] = [];

    switch (shareMode) {
      case 'all':
        return $session;

      case 'team':
        if (!selectedTeamId) return { ...$session, runners: [], times: [], teams: [] };
        
        // Include selected team
        const selectedTeam = $session.teams.find(t => t.id === selectedTeamId);
        if (selectedTeam) filteredTeams = [selectedTeam];
        
        // Include runners from selected team
        filteredRunners = $session.runners.filter(r => r.teamId === selectedTeamId);
        
        // Include all times for runners from selected team
        const runnerIds = new Set(filteredRunners.map(r => r.id));
        filteredTimes = $session.times.filter(t => runnerIds.has(t.runnerId));
        break;

      case 'checkpoint':
        if (!selectedTeamId || !selectedCheckpoint || !selectedRace) {
          return { ...$session, runners: [], times: [], teams: [] };
        }
        
        // Include selected team
        const checkpointTeam = $session.teams.find(t => t.id === selectedTeamId);
        if (checkpointTeam) filteredTeams = [checkpointTeam];
        
        // Include runners from selected team
        filteredRunners = $session.runners.filter(r => r.teamId === selectedTeamId);
        
        // Include only times for selected checkpoint, team, and race
        const checkpointRunnerIds = new Set(filteredRunners.map(r => r.id));
        filteredTimes = $session.times.filter(t => 
          checkpointRunnerIds.has(t.runnerId) && 
          t.checkpoint === selectedCheckpoint &&
          t.raceName === selectedRace
        );
        break;

      case 'race':
        if (!selectedTeamId || !selectedRace) {
          return { ...$session, runners: [], times: [], teams: [] };
        }
        
        // Include selected team
        const raceTeam = $session.teams.find(t => t.id === selectedTeamId);
        if (raceTeam) filteredTeams = [raceTeam];
        
        // Include runners from selected team
        filteredRunners = $session.runners.filter(r => r.teamId === selectedTeamId);
        
        // Include all times for selected team and race
        const raceRunnerIds = new Set(filteredRunners.map(r => r.id));
        filteredTimes = $session.times.filter(t => 
          raceRunnerIds.has(t.runnerId) && 
          t.raceName === selectedRace
        );
        break;
    }

    return {
      ...$session,
      teams: filteredTeams,
      runners: filteredRunners,
      times: filteredTimes,
      name: getFilteredSessionName()
    };
  }

  function getFilteredSessionName(): string {
    const team = $session.teams.find(t => t.id === selectedTeamId);
    const teamName = team?.name || 'Unknown Team';

    switch (shareMode) {
      case 'all':
        return $session.name;
      case 'team':
        return `${teamName} - Team Data`;
      case 'checkpoint':
        return `${teamName} - ${selectedRace} - ${selectedCheckpoint}`;
      case 'race':
        return `${teamName} - ${selectedRace} - Full Race`;
      default:
        return $session.name;
    }
  }

  function getShareDescription(): string {
    const team = $session.teams.find(t => t.id === selectedTeamId);
    const teamName = team?.name || 'Unknown Team';

    switch (shareMode) {
      case 'all':
        return `Complete session with ${$session.teams.length} teams, ${$session.runners.length} runners, and ${$session.times.length} times`;
      case 'team':
        const teamRunners = $session.runners.filter(r => r.teamId === selectedTeamId);
        const teamTimes = $session.times.filter(t => teamRunners.some(r => r.id === t.runnerId));
        return `${teamName}: ${teamRunners.length} runners with ${teamTimes.length} recorded times`;
      case 'checkpoint':
        const checkpointTimes = createFilteredSession().times.length;
        return `${teamName} - ${selectedRace} at ${selectedCheckpoint}: ${checkpointTimes} times`;
      case 'race':
        const raceTimes = createFilteredSession().times.length;
        return `${teamName} - ${selectedRace}: ${raceTimes} times across all checkpoints`;
      default:
        return '';
    }
  }

  function isSelectionValid(): boolean {
    switch (shareMode) {
      case 'all':
        return true;
      case 'team':
        return !!selectedTeamId;
      case 'checkpoint':
        return !!(selectedTeamId && selectedCheckpoint && selectedRace);
      case 'race':
        return !!(selectedTeamId && selectedRace);
      default:
        return false;
    }
  }

  async function handleShare() {
    if (!isSelectionValid()) return;
    
    shareStatus = 'Sharing...';
    const filteredSession = createFilteredSession();
    const success = await shareData(filteredSession);
    shareStatus = success ? 'Shared successfully!' : 'Share failed, data copied to clipboard';
    setTimeout(() => shareStatus = '', 3000);
  }

  async function generateQR() {
    if (isGeneratingQR || !isSelectionValid()) return;
    
    isGeneratingQR = true;
    try {
      const filteredSession = createFilteredSession();
      qrCodeUrl = await generateQRCode(filteredSession);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      shareStatus = 'Failed to generate QR code';
      setTimeout(() => shareStatus = '', 3000);
    } finally {
      isGeneratingQR = false;
    }
  }

  function handleDownload() {
    if (!isSelectionValid()) return;
    
    const filteredSession = createFilteredSession();
    downloadJSON(filteredSession);
    shareStatus = 'File downloaded!';
    setTimeout(() => shareStatus = '', 3000);
  }

  // Reset selections when mode changes
  $: if (shareMode) {
    selectedTeamId = '';
    selectedCheckpoint = '';
    selectedRace = '';
    qrCodeUrl = '';
  }
</script>

<div class="share-container">
  <div class="header">
    <h2>Share & Export</h2>
    <div class="session-info">
      Session: {$session.name}
    </div>
  </div>

  <div class="share-mode-section">
    <h3>What would you like to share?</h3>
    <div class="mode-button-group" role="radiogroup" aria-label="Share mode selection">
      <button
        type="button"
        class="mode-btn"
        class:active={shareMode === 'all'}
        on:click={() => shareMode = 'all'}
        role="radio"
        aria-checked={shareMode === 'all'}
      >
        <div class="mode-content">
          <div class="mode-title">📦 Complete Session</div>
          <div class="mode-description">All teams, runners, and timing data</div>
        </div>
      </button>

      <button
        type="button"
        class="mode-btn"
        class:active={shareMode === 'team'}
        on:click={() => shareMode = 'team'}
        role="radio"
        aria-checked={shareMode === 'team'}
      >
        <div class="mode-content">
          <div class="mode-title">👥 Team Data</div>
          <div class="mode-description">All runners and times for a specific team</div>
        </div>
      </button>

      <button
        type="button"
        class="mode-btn"
        class:active={shareMode === 'checkpoint'}
        on:click={() => shareMode = 'checkpoint'}
        role="radio"
        aria-checked={shareMode === 'checkpoint'}
      >
        <div class="mode-content">
          <div class="mode-title">📍 Single Checkpoint</div>
          <div class="mode-description">Times for one team at one checkpoint in a race</div>
        </div>
      </button>

      <button
        type="button"
        class="mode-btn"
        class:active={shareMode === 'race'}
        on:click={() => shareMode = 'race'}
        role="radio"
        aria-checked={shareMode === 'race'}
      >
        <div class="mode-content">
          <div class="mode-title">🏁 Full Race</div>
          <div class="mode-description">All checkpoints for one team in a specific race</div>
        </div>
      </button>
    </div>
  </div>

  {#if shareMode !== 'all'}
    <div class="selection-section">
      <h4>Selection Details</h4>
      
      <div class="selection-grid">
        {#if shareMode === 'team' || shareMode === 'checkpoint' || shareMode === 'race'}
          <div class="form-group">
            <label for="team-select">Team</label>
            <select id="team-select" bind:value={selectedTeamId}>
              <option value="">Select a team</option>
              {#each $session.teams as team}
                <option value={team.id}>{team.name}</option>
              {/each}
            </select>
          </div>
        {/if}

        {#if shareMode === 'checkpoint' || shareMode === 'race'}
          <div class="form-group">
            <label for="race-select">Race</label>
            <select id="race-select" bind:value={selectedRace}>
              <option value="">Select a race</option>
              {#each uniqueRaces as race}
                <option value={race}>{race}</option>
              {/each}
            </select>
          </div>
        {/if}

        {#if shareMode === 'checkpoint'}
          <div class="form-group">
            <label for="checkpoint-select">Checkpoint</label>
            <select id="checkpoint-select" bind:value={selectedCheckpoint}>
              <option value="">Select checkpoint</option>
              {#each checkpoints as checkpoint}
                <option value={checkpoint}>{checkpoint}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>

      {#if isSelectionValid()}
        <div class="selection-preview">
          <strong>Preview:</strong> {getShareDescription()}
        </div>
      {/if}
    </div>
  {/if}

  {#if isSelectionValid()}
    <div class="actions-grid">
      <div class="action-card">
        <h4>🔗 Web Share</h4>
        <p>Share selected data via your device's native share menu</p>
        <button class="action-btn primary" on:click={handleShare}>
          Share Data
        </button>
      </div>

      <div class="action-card">
        <h4>📱 QR Code</h4>
        <p>Generate a QR code for other devices to scan and import</p>
        <button class="action-btn secondary" on:click={generateQR} disabled={isGeneratingQR}>
          {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
        </button>
      </div>

      <div class="action-card">
        <h4>💾 Download JSON</h4>
        <p>Download selected data as a JSON file for backup</p>
        <button class="action-btn secondary" on:click={handleDownload}>
          Download File
        </button>
      </div>
    </div>

    {#if qrCodeUrl}
      <div class="qr-code-section">
        <h4>QR Code for Import</h4>
        <div class="qr-code-container">
          <img src={qrCodeUrl} alt="QR Code for session data" class="qr-code" />
        </div>
        <p class="qr-instructions">
          Other devices can scan this QR code to import: {getFilteredSessionName()}
        </p>
      </div>
    {/if}
  {:else}
    <div class="selection-required">
      <p>Please complete your selection above to enable sharing options.</p>
    </div>
  {/if}

  {#if shareStatus}
    <div class="status-message" class:success={shareStatus.includes('success')} class:error={shareStatus.includes('failed')}>
      {shareStatus}
    </div>
  {/if}

  {#if $session.runners.length === 0}
    <div class="empty-state">
      <p>No data to share yet!</p>
      <p>Add some runners and times first.</p>
    </div>
  {/if}
</div>

<style>
  .share-container {
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

  .session-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .share-mode-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .share-mode-section h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .mode-button-group {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .mode-btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-bottom: 1px solid var(--border);
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
  }

  .mode-btn:last-child {
    border-bottom: none;
  }

  .mode-btn:hover:not(.active) {
    background: var(--bg-hover);
  }

  .mode-btn.active {
    background: var(--primary);
    color: white;
  }

  .mode-btn.active::after {
    content: '●';
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
    font-weight: bold;
  }

  .mode-content {
    width: 100%;
  }

  .mode-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .mode-description {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .selection-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .selection-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .form-group select {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .form-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .selection-preview {
    background: var(--primary-alpha);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--primary);
    color: var(--text-primary);
  }

  .selection-required {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  .actions-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .action-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .action-card h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .action-card p {
    margin: 0 0 1rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .action-btn {
    width: 100%;
    padding: 0.875rem;
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

  .action-btn.primary:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .action-btn.secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .action-btn.secondary:hover:not(:disabled) {
    background: var(--bg-hover);
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .qr-code-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  .qr-code-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .qr-code-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .qr-code {
    max-width: 256px;
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }

  .qr-instructions {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .status-message {
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .status-message.success {
    background: var(--success-bg);
    color: var(--success);
  }

  .status-message.error {
    background: var(--danger-bg);
    color: var(--danger);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
  }

  @media (max-width: 480px) {
    .selection-grid {
      grid-template-columns: 1fr;
    }
  }
</style>