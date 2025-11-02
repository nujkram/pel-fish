<script lang="ts">
	import ComputerDesktop from './icons/ComputerDesktop.svelte';
	import Folder from './icons/Folder.svelte';
	import File from './icons/Folder.svelte';
	import CogSixTooth from './icons/CogSixTooth.svelte';
	import Users from './icons/Users.svelte';
	import ChartBar from './icons/ChartBar.svelte';

	import SidebarItem from './SidebarItem.svelte';
</script>

<aside
	id="logo-sidebar"
	class="fixed top-0 left-0 z-40 w-32 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
	aria-label="Sidebar"
>
	{#if SidebarItem}
		<SidebarItem link="/" title="Dashboard"><ComputerDesktop /></SidebarItem>
		<SidebarItem link="/records" title="Records"><Folder /></SidebarItem>
		<SidebarItem link="/reports" title="Reports"><ChartBar /></SidebarItem>
		<SidebarItem link="/users" title="Users"><Users /></SidebarItem>
		<SidebarItem link="/settings" title="Settings"><CogSixTooth /></SidebarItem>
	{/if}
</aside>
