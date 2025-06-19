<script lang="ts">
  import { session, checkpoints } from '../stores/session';
  import { isValidTimeFormat } from '../utils/time';
  
  let selectedRunner = '';
  let selectedCheckpoint = '';
  let timeInput = '';

  $: if ($session.runners.length === 1 && !selectedRunner) {
    selectedRunner = $session.runners[0].id;
  }

  function addTime() {
    if (!selectedRunner || !selectedCheckpoint || !timeInput) return;
    if (!isValidTimeFormat(timeInput)) return;

    session.addTime({
      runnerId: selectedRunner,
      checkpoint: selectedCheckpoint,
      time: timeInput
    });

    timeInput = '';
  }

  function getRunnerTimes(runnerId: string) {
    return $session.times.filter(t => t.runnerId === runnerId);
  }

  function getTimeForCheckpoint(runnerId: string, checkpoint: string) {
    const time = $session.times.find(t => t.runnerId === runnerId && t.checkpoint === checkpoint);
    return time?.time || '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      addTime();
    }
  }
</script>

<div class="timing-container">
  <div class="header">
    <h2>Race Timing</h2>
    <div class="stats">
      {$session.runners.length} runners • {$checkpoints.length} checkpoints
    </div>
  </div>

  {#if $session.runners.length === 0}
    <div class="empty-state">
      <p>No runners added yet!</p>
      <p>Go to Setup to add runners first.</p>
    </div>
  {:else}
    <div class="quick-time-entry">
      <h3>Quick Time Entry</h3>
      <div class="entry-form">
        <select bind:value={selectedRunner} class="runner-select">
          <option value="">Select Runner</option>
          {#each $session.runners as runner}
            <option value={runner.id}>
              {runner.name} {runner.bibNumber ? `(#${runner.bibNumber})` : ''}
            </option>
          {/each}
        </select>

        <select bind:value={selectedCheckpoint} class="checkpoint-select">
          <option value="">Select Checkpoint</option>
          {#each $checkpoints as checkpoint}
            <option value={checkpoint}>{checkpoint}</option>
          {/each}
        </select>

        <input 
          type="text" 
          bind:value={timeInput}
          placeholder="MM:SS"
          pattern="[0-9]{1,2}:[0-9]{2}"
          class="time-input"
          on:keydown={handleKeydown}
        />

        <button 
          on:click={addTime}
          disabled={!selectedRunner || !selectedCheckpoint || !timeInput || !isValidTimeFormat(timeInput)}
          class="add-time-btn"
        >
          Add Time
        </button>
      </div>
    </div>

    <div class="runners-grid">
      {#each $session.runners as runner (runner.id)}
        <div class="runner-card">
          <div class="runner-header">
            <h4>{runner.name}</h4>
            <div class="runner-meta">
              Age: {runner.age}
              {#if runner.bibNumber}• Bib: {runner.bibNumber}{/if}
            </div>
          </div>

          <div class="checkpoints">
            {#each $checkpoints as checkpoint}
              {@const time = getTimeForCheckpoint(runner.id, checkpoint)}
              <div class="checkpoint">
                <div class="checkpoint-label">{checkpoint}</div>
                <div class="checkpoint-time" class:has-time={time}>
                  {time || '--:--'}
                </div>
              </div>
            {/each}
          </div>

          {#each [getRunnerTimes(runner.id)] as runnerTimes}
            {@const completedCheckpoints = runnerTimes.length}
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                style="width: {(completedCheckpoints / $checkpoints.length) * 100}%"
              ></div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .timing-container {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header h2 {
    margin: 0;
    color: var(--text-primary);
  }

  .stats {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
  }

  .quick-time-entry {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .quick-time-entry h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .entry-form {
    display: grid;
    grid-template-columns: 1fr 1fr 120px auto;
    gap: 0.75rem;
    align-items: end;
  }

  .runner-select,
  .checkpoint-select,
  .time-input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .runner-select:focus,
  .checkpoint-select:focus,
  .time-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .add-time-btn {
    padding: 0.75rem 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .add-time-btn:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .add-time-btn:disabled {
    background: var(--text-disabled);
    cursor: not-allowed;
  }

  .runners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .runner-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .runner-header {
    margin-bottom: 1rem;
  }

  .runner-header h4 {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary);
    font-size: 1.125rem;
  }

  .runner-meta {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .checkpoints {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .checkpoint {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: var(--bg-primary);
    border-radius: 0.5rem;
  }

  .checkpoint-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .checkpoint-time {
    font-family: 'Monaco', 'Menlo', monospace;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .checkpoint-time.has-time {
    color: var(--primary);
  }

  .progress-bar {
    height: 4px;
    background: var(--bg-primary);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.3s ease;
  }

  @media (max-width: 768px) {
    .entry-form {
      grid-template-columns: 1fr;
    }

    .runners-grid {
      grid-template-columns: 1fr;
    }
  }
</style>