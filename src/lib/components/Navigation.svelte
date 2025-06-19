<script lang="ts">
  import { currentScreen } from '../stores/session';
  import type { Screen } from '../types';

  function setScreen(screen: Screen) {
    $currentScreen = screen;
  }
</script>

<nav class="nav">
  <button 
    class="nav-btn" 
    class:active={$currentScreen === 'setup'}
    on:click={() => setScreen('setup')}
  >
    🏃 Setup
  </button>
  
  <button 
    class="nav-btn" 
    class:active={$currentScreen === 'timing'}
    on:click={() => setScreen('timing')}
  >
    ⏱️ Timing
  </button>
  
  <button 
    class="nav-btn" 
    class:active={$currentScreen === 'share'}
    on:click={() => setScreen('share')}
  >
    📤 Share
  </button>
  
  <button 
    class="nav-btn" 
    class:active={$currentScreen === 'import'}
    on:click={() => setScreen('import')}
  >
    📥 Import
  </button>
</nav>

<style>
  .nav {
    display: flex;
    justify-content: space-around;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .nav-btn {
    flex: 1;
    padding: 0.75rem 0.5rem;
    border: none;
    background: transparent;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-btn.active {
    background: var(--accent);
    color: white;
  }

  @media (max-width: 480px) {
    .nav-btn {
      font-size: 0.75rem;
      padding: 0.5rem 0.25rem;
    }
  }
</style>