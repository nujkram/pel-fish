<script>
	import { goto } from '$app/navigation';

	let isDropdownOpen = false;

	function handleToggleDropDown() {
		console.log('clicked');

		isDropdownOpen = !isDropdownOpen;
	}
</script>

<nav
	class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
>
	<div class="px-3 py-2 lg:px-5 lg:pl-3">
		<div class="flex items-center justify-between">
			<a href="/" class="flex ml-2 md:mr-24" style="text-decoration-line: none;">
				<img
					src="https://flowbite.com/docs/images/logo.svg"
					class="h-6 mr-3 sm:h-9"
					alt="Flowbite Logo"
				/>
				<span class="text-xl font-semibold dark:text-white text-gray-900">PELFISH</span>
			</a>
			<div class="flex items-center">
				<div class="flex items-center ml-3">
					<div class="relative inline-block text-left">
						<div>
							<button
								type="button"
								class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset ring-gray-300 hover:bg-gray-50"
								id="menu-button"
								aria-expanded="true"
								aria-haspopup="true"
								on:click={() => {
									goto('/');
								}}
							>
								Home
							</button>
						</div>
					</div>
					<div class="relative inline-block text-left">
						<div>
							<button
								type="button"
								class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset ring-gray-300 hover:bg-gray-50"
								id="menu-button"
								aria-expanded="true"
								aria-haspopup="true"
								on:click={() => {}}
							>
								About
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</nav>
