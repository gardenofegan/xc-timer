<script lang="ts">
  import { session } from '../stores/session';
  import type { Team } from '../types';
  
  let name = '';
  let grade: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' = 'Freshman';
  let selectedTeamId = '';
  
  // Team creation
  let teamName = '';
  let teamColor = '#22c55e';
  let showTeamForm = false;

  // Confirmation dialog state
  let showRemoveConfirmation = false;
  let runnerToRemove: { id: string; name: string; teamName: string } | null = null;

  const teamColors = [
    '#22c55e', '#3b82f6', '#f97316', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'
  ];

  function addTeam() {
    if (!teamName.trim()) return;
    
    session.addTeam({
      name: teamName.trim(),
      color: teamColor
    });

    // Reset form
    teamName = '';
    teamColor = '#22c55e';
    showTeamForm = false;
  }

  function removeTeam(teamId: string) {
    session.removeTeam(teamId);
    if (selectedTeamId === teamId) {
      selectedTeamId = '';
    }
  }

  function addRunner() {
    if (!name.trim() || !selectedTeamId) return;
    
    session.addRunner({
      name: name.trim(),
      grade,
      teamId: selectedTeamId
    });

    // Reset form
    name = '';
    grade = 'Freshman';
  }

  function confirmRemoveRunner(runnerId: string) {
    const runner = $session.runners.find(r => r.id === runnerId);
    const team = runner ? getTeamById(runner.teamId) : null;
    
    if (runner && team) {
      runnerToRemove = {
        id: runner.id,
        name: runner.name,
        teamName: team.name
      };
      showRemoveConfirmation = true;
    }
  }

  function executeRemoveRunner() {
    if (runnerToRemove) {
      session.removeRunner(runnerToRemove.id);
      cancelRemoveRunner();
    }
  }

  function cancelRemoveRunner() {
    runnerToRemove = null;
    showRemoveConfirmation = false;
  }

  function getTeamById(teamId: string): Team | undefined {
    return $session.teams.find(t => t.id === teamId);
  }

  function getRunnersByTeam(teamId: string) {
    return $session.runners.filter(r => r.teamId === teamId);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (showTeamForm && teamName.trim()) {
        addTeam();
      } else if (!showTeamForm && name.trim() && selectedTeamId) {
        addRunner();
      }
    }
    
    if (event.key === 'Escape' && showRemoveConfirmation) {
      cancelRemoveRunner();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="setup-container">
  <div class="header">
    <h2>Runner Setup</h2>
    <div class="unit-toggle">
      <button 
        class="unit-btn" 
        class:active={$session.unit === 'km'}
        on:click={() => session.setUnit('km')}
      >
        Kilometers
      </button>
      <button 
        class="unit-btn" 
        class:active={$session.unit === 'miles'}
        on:click={() => session.setUnit('miles')}
      >
        Miles
      </button>
    </div>
  </div>

  <!-- Team Management -->
  <div class="teams-section">
    <div class="section-header">
      <h3>Teams ({$session.teams.length})</h3>
      <button 
        class="add-team-btn" 
        on:click={() => showTeamForm = !showTeamForm}
        class:active={showTeamForm}
      >
        {showTeamForm ? 'Cancel' : '+ Add Team'}
      </button>
    </div>

    {#if showTeamForm}
      <form on:submit|preventDefault={addTeam} class="team-form">
        <div class="form-row">
          <div class="form-group">
            <label for="team-name">Team Name</label>
            <input 
              id="team-name"
              type="text" 
              bind:value={teamName} 
              placeholder="e.g., Girls Team, Boys Team"
              on:keydown={handleKeydown}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="team-color">Team Color</label>
            <div class="color-picker">
              <input 
                id="team-color"
                type="color" 
                bind:value={teamColor}
                class="color-input"
              />
              <div class="color-options">
                {#each teamColors as color}
                  <button 
                    type="button"
                    class="color-option" 
                    style="background-color: {color}"
                    class:selected={teamColor === color}
                    on:click={() => teamColor = color}
                  ></button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="add-btn" disabled={!teamName.trim()}>
          Create Team
        </button>
      </form>
    {/if}

    <div class="teams-list">
      {#each $session.teams as team (team.id)}
        <div class="team-card" style="border-left: 4px solid {team.color}">
          <div class="team-info">
            <div class="team-name">{team.name}</div>
            <div class="team-stats">
              {getRunnersByTeam(team.id).length} runners
            </div>
          </div>
          <button 
            class="remove-btn"
            on:click={() => removeTeam(team.id)}
            title="Remove team"
          >
            ✕
          </button>
        </div>
      {/each}
      
      {#if $session.teams.length === 0}
        <div class="empty-state">
          No teams created yet. Create a team to start adding runners!
        </div>
      {/if}
    </div>
  </div>

  <!-- Runner Management -->
  <div class="runners-section">
    <h3>Add Runner</h3>
    
    {#if $session.teams.length === 0}
      <div class="no-teams-message">
        Please create at least one team before adding runners.
      </div>
    {:else}
      <form on:submit|preventDefault={addRunner} class="add-runner-form">
        <div class="form-group">
          <label for="team-select">Team</label>
          <select id="team-select" bind:value={selectedTeamId} required>
            <option value="">Select a team</option>
            {#each $session.teams as team}
              <option value={team.id}>{team.name}</option>
            {/each}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="name">Runner Name</label>
            <input 
              id="name"
              type="text" 
              bind:value={name} 
              placeholder="Enter runner name"
              on:keydown={handleKeydown}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="grade">Grade</label>
            <select id="grade" bind:value={grade} required>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>

        <button type="submit" class="add-btn" disabled={!name.trim() || !selectedTeamId}>
          Add Runner
        </button>
      </form>
    {/if}
  </div>

  <!-- Runners by Team -->
  <div class="runners-by-team">
    {#each $session.teams as team (team.id)}
      {@const teamRunners = getRunnersByTeam(team.id)}
      {#if teamRunners.length > 0}
        <div class="team-runners-section">
          <h4 style="color: {team.color}">{team.name} ({teamRunners.length})</h4>
          <div class="runners-grid">
            {#each teamRunners as runner (runner.id)}
              <div class="runner-card" style="border-left: 4px solid {team.color}">
                <div class="runner-info">
                  <div class="runner-name">{runner.name}</div>
                  <div class="runner-details">
                    {runner.grade}
                  </div>
                </div>
                <button 
                  class="remove-btn"
                  on:click={() => confirmRemoveRunner(runner.id)}
                  title="Remove runner"
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
    
    {#if $session.runners.length === 0 && $session.teams.length > 0}
      <div class="empty-state">
        No runners added yet. Add some runners to get started!
      </div>
    {/if}
  </div>
</div>

<!-- Confirmation Dialog -->
{#if showRemoveConfirmation && runnerToRemove}
  <div class="modal-overlay" on:click={cancelRemoveRunner}>
    <div class="confirmation-dialog" on:click|stopPropagation>
      <div class="dialog-header">
        <h3>Remove Runner</h3>
      </div>
      
      <div class="dialog-content">
        <p>Are you sure you'd like to remove <strong>{runnerToRemove.name}</strong> from <strong>{runnerToRemove.teamName}</strong>?</p>
        <p class="warning-text">This will also remove all recorded times for this runner.</p>
      </div>
      
      <div class="dialog-actions">
        <button class="dialog-btn cancel-btn" on:click={cancelRemoveRunner}>
          Cancel
        </button>
        <button class="dialog-btn confirm-btn" on:click={executeRemoveRunner}>
          Remove Runner
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .setup-container {
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

  .unit-toggle {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .unit-btn {
    padding: 0.5rem 1rem;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .unit-btn:hover {
    background: var(--bg-hover);
  }

  .unit-btn.active {
    background: var(--primary);
    color: white;
  }

  .teams-section, .runners-section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h3 {
    margin: 0;
    color: var(--text-primary);
  }

  .add-team-btn {
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-team-btn:hover {
    background: var(--primary-hover);
  }

  .add-team-btn.active {
    background: var(--danger);
  }

  .team-form, .add-runner-form {
    background: var(--bg-primary);
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  input:focus, select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
  }

  .color-picker {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .color-input {
    width: 60px;
    height: 40px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .color-options {
    display: flex;
    gap: 0.5rem;
  }

  .color-option {
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .color-option:hover {
    transform: scale(1.1);
  }

  .color-option.selected {
    border-color: var(--text-primary);
    transform: scale(1.2);
  }

  .add-btn {
    width: 100%;
    padding: 0.875rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-btn:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  .add-btn:disabled {
    background: var(--text-disabled);
    cursor: not-allowed;
  }

  .teams-list {
    display: grid;
    gap: 0.5rem;
  }

  .team-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }

  .team-info {
    flex: 1;
  }

  .team-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .team-stats {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .runners-section h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .no-teams-message {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
    background: var(--bg-primary);
    border-radius: 0.5rem;
  }

  .runners-by-team {
    margin-top: 2rem;
  }

  .team-runners-section {
    margin-bottom: 2rem;
  }

  .team-runners-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
  }

  .runners-grid {
    display: grid;
    gap: 0.5rem;
  }

  .runner-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
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

  .remove-btn {
    background: var(--danger);
    color: white;
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .remove-btn:hover {
    background: var(--danger-hover);
    transform: scale(1.1);
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  /* Modal and Confirmation Dialog Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .confirmation-dialog {
    background: var(--bg-primary);
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 400px;
    width: 100%;
    border: 1px solid var(--border);
  }

  .dialog-header {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }

  .dialog-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.25rem;
  }

  .dialog-content {
    padding: 1rem 1.5rem;
  }

  .dialog-content p {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    line-height: 1.5;
  }

  .warning-text {
    color: var(--warning) !important;
    font-size: 0.875rem;
    font-style: italic;
  }

  .dialog-actions {
    display: flex;
    gap: 0.75rem;
    padding: 0 1.5rem 1.5rem 1.5rem;
    justify-content: flex-end;
  }

  .dialog-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .cancel-btn:hover {
    background: var(--bg-hover);
  }

  .confirm-btn {
    background: var(--danger);
    color: white;
  }

  .confirm-btn:hover {
    background: var(--danger-hover);
  }

  @media (max-width: 480px) {
    .header {
      flex-direction: column;
      align-items: stretch;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .color-picker {
      flex-direction: column;
      align-items: flex-start;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .modal-overlay {
      padding: 0.5rem;
    }
  }
</style>