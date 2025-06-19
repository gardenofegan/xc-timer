<script lang="ts">
  import { session } from '../stores/session';
  import { shareData, generateQRCode, downloadJSON } from '../utils/sharing';
  
  let qrCodeUrl = '';
  let isGeneratingQR = false;
  let shareStatus = '';

  async function handleShare() {
    shareStatus = 'Sharing...';
    const success = await shareData($session);
    shareStatus = success ? 'Shared successfully!' : 'Share failed, data copied to clipboard';
    setTimeout(() => shareStatus = '', 3000);
  }

  async function generateQR() {
    if (isGeneratingQR) return;
    
    isGeneratingQR = true;
    try {
      qrCodeUrl = await generateQRCode($session);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      shareStatus = 'Failed to generate QR code';
      setTimeout(() => shareStatus = '', 3000);
    } finally {
      isGeneratingQR = false;
    }
  }

  function handleDownload() {
    downloadJSON($session);
    shareStatus = 'File downloaded!';
    setTimeout(() => shareStatus = '', 3000);
  }

  function getSessionSummary() {
    const completedTimes = $session.times.length;
    const totalPossibleTimes = $session.runners.length * ($session.unit === 'km' ? 5 : 4);
    return {
      runners: $session.runners.length,
      completedTimes,
      totalPossibleTimes,
      completionPercentage: totalPossibleTimes > 0 ? Math.round((completedTimes / totalPossibleTimes) * 100) : 0
    };
  }

  $: summary = getSessionSummary();
</script>

<div class="share-container">
  <div class="header">
    <h2>Share & Export</h2>
    <div class="session-info">
      Session: {$session.name}
    </div>
  </div>

  <div class="summary-card">
    <h3>Session Summary</h3>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-number">{summary.runners}</div>
        <div class="summary-label">Runners</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">{summary.completedTimes}</div>
        <div class="summary-label">Times Recorded</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">{summary.completionPercentage}%</div>
        <div class="summary-label">Complete</div>
      </div>
    </div>
  </div>

  <div class="actions-grid">
    <div class="action-card">
      <h4>🔗 Web Share</h4>
      <p>Share session data via your device's native share menu</p>
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
      <p>Download session data as a JSON file for backup</p>
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
        Other devices can scan this QR code to import the session data
      </p>
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
    max-width: 600px;
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

  .summary-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .summary-card h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
  }

  .summary-item {
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 0.5rem;
  }

  .summary-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 0.25rem;
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
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
    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>