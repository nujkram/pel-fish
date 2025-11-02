<script>
	import { goto } from '$app/navigation';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import FrontNav from '$lib/components/FrontNav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	export let data;
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
	{#if data.user}
		<Navbar {data} />
		<div class="flex flex-1 flex-col">
			<Sidebar />
			<main class="flex-1 mt-16 ml-32">
				<slot />
			</main>
			<div class="ml-32">
				<Footer />
			</div>
		</div>
	{:else}
		<div class="flex flex-col min-h-screen">
			<FrontNav />
			<div class="flex-1">
				<slot />
			</div>
			<Footer />
		</div>
	{/if}
</div>
