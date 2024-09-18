<script>
	// @ts-nocheck
	import Button from '$lib/components/reusable/Button.svelte';
	import CircleX from '$lib/components/icons/CircleX.svelte';

	export let isConfirmModalOpen = false;
	export let currentRecord;
	export let loadRecord = () => {};

	const record = currentRecord;
	const _id = record._id;
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
		isConfirmModalOpen = false;
		if (result.status === 'Success') {
			loadRecord();
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
					<button on:click={handleCloseModal} class=" absolute right-2 top-2">
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
				</div>
			</div>
		</div>
	</div>
</div>
