<script>
	// @ts-nocheck
	import Button from '$lib/components/reusable/Button.svelte';
	import CircleX from '$lib/components/icons/CircleX.svelte';
	import { fade } from 'svelte/transition';

	export let isConfirmModalOpen = false;
	export let currentRecord;
	export let loadRecord = () => {};

	const record = currentRecord;
	const _id = record._id;
	let message = '';
	const handleCloseModal = () => (isConfirmModalOpen = false);

	async function handleConfirmDelete(event) {
		event?.preventDefault();
		const response = await fetch('/api/admin/record/delete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ _id })
		});
		let result = await response.json();

		if (result.status === 'Success') {
			message = result.message || 'Record deleted successfully';
			setTimeout(() => {
				message = '';
				isConfirmModalOpen = false;
				loadRecord();
			}, 3000);
		}
	}
</script>

<div class="fixed z-10 inset-0 overflow-y-auto {isConfirmModalOpen ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
		<div
			id="confirm-modal"
			tabindex="-1"
			class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
		>
			<div class="relative w-full h-full max-w-md md:h-auto">
				<div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<button on:click={handleCloseModal} class="absolute right-2 top-2">
						<CircleX />
					</button>
					<div class="p-6 text-center">
						<svg
							aria-hidden="true"
							class="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<h2 class="mb-2 text-lg font-normal text-gray-800 dark:text-gray-400">
							{currentRecord?.name}
						</h2>
						<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
							Are you sure you want to delete this record?
						</h3>
						<Button color="danger" textSize="text-md" text="Yes" on:click={handleConfirmDelete} />
						<Button color="primary" textSize="text-md" text="Cancel" on:click={handleCloseModal} />
					</div>

					{#if message}
						<div
							transition:fade
							class="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b"
							role="alert"
						>
							<svg
								class="fill-current w-4 h-4 mr-2"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
							>
								<path
									d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
								/>
							</svg>
							<p>{message}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
