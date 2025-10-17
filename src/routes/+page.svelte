<script>
	import Dashboard from '$lib/components/Dashboard.svelte';
	import Main from '$lib/components/Main.svelte';

	export let data;
	export let form;
	$: void form;
</script>

{#if data?.user}
	<Dashboard />
{:else}
	<Main />
{/if}
