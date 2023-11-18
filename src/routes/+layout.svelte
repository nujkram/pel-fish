<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	$: {
		if (!$page.data.user) {
			redirect();
		}
	}

	function redirect() {
		goto('/auth/login');
	}

	$:console.log('layout', $page.data);
</script>

<main id="content">
	{#if $page.data.user}
		<Navbar data={$page.data} />
		<Sidebar />
		<main class="mt-16 ml-[16.5rem]">
			<slot />
		</main>
	{:else}
		<slot />
	{/if}
</main>
