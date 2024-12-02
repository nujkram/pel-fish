<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import FrontNav from '$lib/components/FrontNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	// $: {
	// 	if (!$page.data.user) {
	// 		redirect();
	// 	}
	// }

	// function redirect() {
	// 	goto('/auth/login');
	// }
</script>

<div class="min-h-screen flex flex-col">
	{#if $page.data.user}
		<Navbar data={$page.data} />
		<div class="flex flex-1">
			<Sidebar />
			<main class="flex-1 mt-16 ml-64 mb-16">
				<slot />
			</main>
		</div>
	{:else}
		<FrontNav />
		<slot />
	{/if}
	<Footer />
</div>