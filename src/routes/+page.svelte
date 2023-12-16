<script>
	import { page } from '$app/stores';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import Main from '$lib/components/Main.svelte';
</script>

{#if $page.data.user}
	<Dashboard />
{:else}
	<Main />
{/if}
