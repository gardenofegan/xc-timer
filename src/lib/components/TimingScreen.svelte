<script lang="ts">
  import { session, checkpoints } from '../stores/session';
  import type { Team, Runner } from '../types';
  import { onDestroy } from 'svelte';
  
  // Timer state
  let isTimerRunning = false;
  let startTime = 0;
  let currentTime = 0;
  let timerInterval: number | null = null;
  
  // Selection state
  let selectedTeamIds: string[] = [];
  let selectedCheckpoint = '';
  let raceName = '';
  
  // Runner state for timing
  let availableRunners: Runner[] = [];
  let completedRunners: Array<Runner & { recordedTime: string }> = [];

  // Initialize race name from session
  $: if ($session.currentRace && !raceName) {
    raceName = $session.currentRace;
  }

  // Update available runners when teams, checkpoint selection, or session times change
  $: if (selectedTeamIds.length > 0 && selectedCheckpoint && $session) {
    updateAvailableRunners();
  } else {
    availableRunners = [];
    completedRunners = [];
  }

  function updateAvailableRunners() {
    const teamRunners = $session.runners.filter(runner => 
      selectedTeamIds.includes(runner.teamId)
    );
    
    // Split runners into available (no time for this checkpoint) and completed (has time)
    const newAvailableRunners: Runner[] = [];
    const newCompletedRunners: Array<Runner & { recordedTime: string }> = [];
    
    teamRunners.forEach(runner => {
      const existingTime = $session.times.find(t => 
        t.runnerId === runner.id && t.checkpoint === selectedCheckpoint
      );
      
      if (existingTime) {
        newCompletedRunners.push({
          ...runner,
          recordedTime: existingTime.time
        });
      } else {
        newAvailableRunners.push(runner);
      }
    });

    availableRunners = newAvailableRunners;
    completedRunners = newCompletedRunners;
  }

  function startTimer() {
    if (selectedTeamIds.length === 0 || !selectedCheckpoint || !raceName.trim()) return;
    
    // Update session with current race name
    session.setCurrentRace(raceName.trim());
    
    startTime = Date.now();
    currentTime = 0;
    isTimerRunning = true;
    
    timerInterval = setInterval(() => {
      currentTime = Date.now() - startTime;
    }, 10); // Update every 10ms for smooth display
  }

  function stopTimer() {
    isTimerRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetCheckpointTimes() {
    // Remove times for selected teams and checkpoint
    session.update(currentSession => ({
      ...currentSession,
      times: currentSession.times.filter(time => {
        // Keep times that don't match the current selection
        if (time.checkpoint !== selectedCheckpoint) return true;
        
        // Check if this time belongs to a runner from selected teams
        const runner = currentSession.runners.find(r => r.id === time.runnerId);
        if (!runner || !selectedTeamIds.includes(runner.teamId)) return true;
        
        // Remove this time (it matches selected teams and checkpoint)
        return false;
      }),
      updated: Date.now()
    }));
  }

  function formatTimerDisplay(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  function formatTimeForStorage(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function recordRunnerTime(runner: Runner) {
    if (!isTimerRunning) return;
    
    const timeString = formatTimeForStorage(currentTime);
    
    // Add time to session with current race name
    session.addTime({
      runnerId: runner.id,
      checkpoint: selectedCheckpoint,
      time: timeString
    }, raceName.trim());
  }

  function getTeamById(teamId: string): Team | undefined {
    return $session.teams.find(t => t.id === teamId);
  }

  function getSelectedTeamNames(): string {
    return selectedTeamIds
      .map(id => getTeamById(id)?.name)
      .filter(Boolean)
      .join(', ');
  }

  function toggleTeamSelection(teamId: string) {
    if (selectedTeamIds.includes(teamId)) {
      selectedTeamIds = selectedTeamIds.filter(id => id !== teamId);
    } else {
      selectedTeamIds = [...selectedTeamIds, teamId];
    }
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });
</script>

<div class="timing-container">
  <div class="header">
    <h2>Race Timer</h2>
    <div class="timer-display" class:running={isTimerRunning}>
      {formatTimerDisplay(currentTime)}
    </div>
  </div>

  <div class="controls-section">
    <div class="race-input-section">
      <div class="form-group">
        <label for="race-name">Race Name</label>
        <input 
          id="race-name"
          type="text" 
          bind:value={raceName} 
          placeholder="e.g., State Championship, League Meet"
          disabled={isTimerRunning}
          class="race-input"
        />
        {#if !raceName.trim()}
          <div class="input-hint">Enter a race name to begin timing</div>
        {/if}
      </div>
    </div>

    <div class="timer-controls">
      {#if !isTimerRunning}
        <button 
          class="timer-btn start-btn" 
          on:click={startTimer}
          disabled={selectedTeamIds.length === 0 || !selectedCheckpoint || !raceName.trim()}
        >
          ▶️ Start Timer
        </button>
      {:else}
        <button class="timer-btn stop-btn" on:click={stopTimer}>
          ⏸️ Stop Timer
        </button>
      {/if}
    </div>

    <div class="selection-controls">
      <div class="team-selection">
        <label>Select Team(s):</label>
        <div class="team-checkboxes">
          {#each $session.teams as team (team.id)}
            <label class="team-checkbox">
              <input 
                type="checkbox" 
                value={team.id}
                checked={selectedTeamIds.includes(team.id)}
                on:change={() => toggleTeamSelection(team.id)}
                disabled={isTimerRunning}
              />
              <span class="checkbox-label" style="color: {team.color}">
                {team.name}
              </span>
            </label>
          {/each}
        </div>
        {#if selectedTeamIds.length === 0}
          <div class="selection-hint">Select at least one team</div>
        {/if}
      </div>

      <div class="checkpoint-selection">
        <label for="checkpoint-select">Checkpoint:</label>
        <select 
          id="checkpoint-select" 
          bind:value={selectedCheckpoint}
          disabled={isTimerRunning}
        >
          <option value="">Select Checkpoint</option>
          {#each $checkpoints as checkpoint}
            <option value={checkpoint}>{checkpoint}</option>
          {/each}
        </select>
        {#if !selectedCheckpoint}
          <div class="selection-hint">Select a checkpoint</div>
        {/if}
      </div>
    </div>
  </div>

  {#if selectedTeamIds.length > 0 && selectedCheckpoint && raceName.trim()}
    <div class="timing-info">
      <div class="timing-summary">
        <strong>Race:</strong> {raceName} • <strong>Timing:</strong> {getSelectedTeamNames()} at {selectedCheckpoint}
        <span class="runner-count">
          ({availableRunners.length} pending, {completedRunners.length} completed)
        </span>
      </div>
    </div>

    {#if isTimerRunning && availableRunners.length > 0}
      <div class="runners-timing-list">
        <h3>Tap to Record Time</h3>
        <div class="available-runners">
          {#each availableRunners as runner (runner.id)}
            {@const team = getTeamById(runner.teamId)}
            <div class="runner-timing-row" style="border-left: 4px solid {team?.color || '#6b7280'}">
              <div class="runner-info">
                <div class="runner-name">{runner.name}</div>
                <div class="runner-details">{runner.grade} • {team?.name}</div>
              </div>
              <button 
                class="time-btn"
                on:click={() => recordRunnerTime(runner)}
              >
                {formatTimerDisplay(currentTime)}
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if completedRunners.length > 0}
      <div class="completed-runners">
        <div class="completed-header">
          <h3>Recorded Times</h3>
          <button 
            class="reset-checkpoint-btn"
            on:click={resetCheckpointTimes}
            title="Clear all times for {getSelectedTeamNames()} at {selectedCheckpoint}"
          >
            🗑️ Reset Times
          </button>
        </div>
        <div class="completed-list">
          {#each completedRunners as runner (runner.id)}
            {@const team = getTeamById(runner.teamId)}
            <div class="completed-runner-row" style="border-left: 4px solid {team?.color || '#6b7280'}">
              <div class="runner-info">
                <div class="runner-name">{runner.name}</div>
                <div class="runner-details">{runner.grade} • {team?.name}</div>
              </div>
              <div class="recorded-time">
                {runner.recordedTime}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if !isTimerRunning && availableRunners.length === 0 && completedRunners.length === 0}
      <div class="no-runners-message">
        All runners from selected team(s) already have times recorded for {selectedCheckpoint}.
      </div>
    {/if}
  {:else}
    <div class="setup-message">
      <h3>Setup Required</h3>
      <p>Please enter a race name, select team(s), and choose a checkpoint to begin timing.</p>
      
      {#if $session.teams.length === 0}
        <p class="warning">⚠️ No teams created yet. Go to Setup to create teams and add runners.</p>
      {:else if $session.runners.length === 0}
        <p class="warning">⚠️ No runners added yet. Go to Setup to add runners to your teams.</p>
      {/if}
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

  .timer-display {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    border: 2px solid var(--border);
    min-width: 200px;
    text-align: center;
  }

  .timer-display.running {
    color: var(--primary);
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .controls-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .race-input-section {
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .race-input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .race-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .race-input:disabled {
    background: var(--bg-hover);
    color: var(--text-disabled);
    cursor: not-allowed;
  }

  .input-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-style: italic;
  }

  .timer-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
  }

  .timer-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  }

  .start-btn {
    background: var(--success);
    color: white;
  }

  .start-btn:hover:not(:disabled) {
    background: var(--success-hover);
    transform: translateY(-2px);
  }

  .start-btn:disabled {
    background: var(--text-disabled);
    cursor: not-allowed;
  }

  .stop-btn {
    background: var(--warning);
    color: white;
  }

  .stop-btn:hover {
    background: var(--warning-hover);
    transform: translateY(-2px);
  }

  .selection-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .team-selection label,
  .checkpoint-selection label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .team-checkboxes {
    display: grid;
    gap: 0.5rem;
  }

  .team-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
  }

  .team-checkbox:hover {
    background: var(--bg-hover);
  }

  .team-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .checkbox-label {
    font-weight: 500;
  }

  .selection-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-style: italic;
  }

  #checkpoint-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  #checkpoint-select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .timing-info {
    background: var(--primary-alpha);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    border: 1px solid var(--primary);
  }

  .timing-summary {
    color: var(--text-primary);
    font-size: 1rem;
  }

  .runner-count {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .runners-timing-list {
    margin-bottom: 2rem;
  }

  .runners-timing-list h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    text-align: center;
  }

  .available-runners {
    display: grid;
    gap: 0.5rem;
  }

  .runner-timing-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 0.75rem;
    border: 1px solid var(--border);
    transition: all 0.2s ease;
  }

  .runner-timing-row:hover {
    background: var(--bg-hover);
    transform: translateY(-1px);
  }

  .runner-info {
    flex: 1;
  }

  .runner-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .runner-details {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .time-btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }

  .time-btn:hover {
    background: var(--primary-hover);
    transform: scale(1.05);
  }

  .completed-runners {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .completed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .completed-header h3 {
    margin: 0;
    color: var(--text-primary);
  }

  .reset-checkpoint-btn {
    background: var(--danger);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-checkpoint-btn:hover {
    background: var(--danger-hover);
    transform: translateY(-1px);
  }

  .completed-list {
    display: grid;
    gap: 0.5rem;
  }

  .completed-runner-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }

  .recorded-time {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--success);
    background: var(--success-bg);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }

  .setup-message, .no-runners-message {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
  }

  .setup-message h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .warning {
    color: var(--warning);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      text-align: center;
    }

    .timer-display {
      font-size: 2rem;
      min-width: auto;
      width: 100%;
    }

    .timer-controls {
      flex-direction: column;
    }

    .selection-controls {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .timer-btn {
      min-width: auto;
    }

    .completed-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
  }
</style>