<script lang="ts">
  import { session } from '../stores/session';
  
  let name = '';
  let age = '';
  let bibNumber = '';

  function addRunner() {
    if (!name.trim() || !age) return;
    
    session.addRunner({
      name: name.trim(),
      age: parseInt(age, 10),
      bibNumber: bibNumber ? parseInt(bibNumber, 10) : undefined
    });

    // Reset form
    name = '';
    age = '';
    bibNumber = '';
  }

  function removeRunner(runnerId: string) {
    session.removeRunner(runnerId);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      addRunner();
    }
  }
</script>

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

  <form on:submit|preventDefault={addRunner} class="add-runner-form">
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
    
    <div class="form-row">
      <div class="form-group">
        <label for="age">Age</label>
        <input 
          id="age"
          type="number" 
          bind:value={age} 
          placeholder="Age"
          min="1"
          max="99"
          on:keydown={handleKeydown}
          required
        />
      </div>
      
      <div class="form-group">
        <label for="bib">Bib # (Optional)</label>
        <input 
          id="bib"
          type="number" 
          bind:value={bibNumber} 
          placeholder="Bib"
          min="1"
          on:keydown={handleKeydown}
        />
      </div>
    </div>

    <button type="submit" class="add-btn" disabled={!name.trim() || !age}>
      Add Runner
    </button>
  </form>

  <div class="runners-list">
    <h3>Runners ({$session.runners.length})</h3>
    {#each $session.runners as runner (runner.id)}
      <div class="runner-card">
        <div class="runner-info">
          <div class="runner-name">{runner.name}</div>
          <div class="runner-details">
            Age: {runner.age}
            {#if runner.bibNumber}
              • Bib: {runner.bibNumber}
            {/if}
          </div>
        </div>
        <button 
          class="remove-btn"
          on:click={() => removeRunner(runner.id)}
          title="Remove runner"
        >
          ✕
        </button>
      </div>
    {/each}
    
    {#if $session.runners.length === 0}
      <div class="empty-state">
        No runners added yet. Add some runners to get started!
      </div>
    {/if}
  </div>
</div>

<style>
  .setup-container {
    padding: 1rem;
    max-width: 600px;
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

  .add-runner-form {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
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

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-alpha);
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

  .runners-list h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .runner-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
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

  @media (max-width: 480px) {
    .header {
      flex-direction: column;
      align-items: stretch;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>