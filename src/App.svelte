<script lang="ts">
  import Navigation from './lib/components/Navigation.svelte';
  import RunnerSetup from './lib/components/RunnerSetup.svelte';
  import TimingScreen from './lib/components/TimingScreen.svelte';
  import ShareScreen from './lib/components/ShareScreen.svelte';
  import ImportScreen from './lib/components/ImportScreen.svelte';
  import { currentScreen } from './lib/stores/session';
</script>

<main class="app">
  <header class="app-header">
    <h1>⏱️ Cross Country Timer</h1>
  </header>

  <Navigation />

  <div class="app-content">
    {#if $currentScreen === 'setup'}
      <RunnerSetup />
    {:else if $currentScreen === 'timing'}
      <TimingScreen />
    {:else if $currentScreen === 'share'}
      <ShareScreen />
    {:else if $currentScreen === 'import'}
      <ImportScreen />
    {/if}
  </div>
</main>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
  }

  .app-header {
    background: var(--primary);
    color: white;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .app-header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .app-header h1 {
      font-size: 1.25rem;
    }
  }
</style>