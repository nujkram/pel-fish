<script lang="ts">
	// @ts-nocheck
	import Button from '$lib/components/reusable/Button.svelte';
	import { onMount } from 'svelte';
	import CircleX from '$lib/components/icons/CircleX.svelte';

	export let isEditModalOpen = false;
	export let currentRecord;
	export let loadRecord = () => {};

	let _id: string = currentRecord._id;
	let name: string = currentRecord.name;
	let description: string = currentRecord.description;
	let selectedFile: any | null = null;
	let imageBase64: any | null = currentRecord.image;

	function setEditValues() {
		if (currentRecord === undefined) {
			currentRecord = [{ _id: 'NA' }, { name: 'NA' }, { description: 'NA' }];
		}
		_id = currentRecord._id;
		name = currentRecord.name;
		description = currentRecord.description;
	}

	const handleCloseModal = () => (isEditModalOpen = false);

	async function handleSubmit(event) {
		event?.preventDefault();
		const response = await fetch('/api/admin/record/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				_id,
				name,
				description,
				image: imageBase64
			})
		});
		let result = await response.json();
		isEditModalOpen = false;
		if (result.status === 'Success') {
			loadRecord();
		}
	}

	const uploadImage = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file: File = target.files[0];
			const reader: FileReader = new FileReader();

			reader.onload = (event: ProgressEvent<FileReader>): void => {
				const img: HTMLImageElement = new Image();
				img.onload = (): void => {
					const canvas: HTMLCanvasElement = document.createElement('canvas');
					const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

					// Set maximum width or height
					const maxSize: number = 800;
					let width: number = img.width;
					let height: number = img.height;

					if (width > height) {
						if (width > maxSize) {
							height *= maxSize / width;
							width = maxSize;
						}
					} else {
						if (height > maxSize) {
							width *= maxSize / height;
							height = maxSize;
						}
					}

					canvas.width = width;
					canvas.height = height;

					ctx?.drawImage(img, 0, 0, width, height);

					// Compress and convert to base64
					const compressedBase64: string = canvas.toDataURL('image/jpeg', 0.7);
					console.log('compressedBase64', compressedBase64);
					imageBase64 = compressedBase64;
				};
				img.src = event.target?.result as string;
			};

			reader.readAsDataURL(file);
		}
	};

	onMount(() => {
		setEditValues();
	});
</script>

<div class="fixed z-10 inset-0 overflow-y-auto {isEditModalOpen ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
		<div
			class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
			id="updated-record-modal"
			tabindex="-1"
			aria-hidden="true"
		>
			<div class="relative w-full h-full max-w-md md:h-auto">
				<!-- Modal content -->
				<div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<button
						on:click={handleCloseModal}
						type="button"
						class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
						data-modal-hide="authentication-modal"
					>
						<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
							><path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/></svg
						>
						<span class="sr-only">Close modal</span>
					</button>
					<div class="px-6 py-6 lg:px-8">
						<div class="flex justify-between">
							<h2 class="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
								Edit Record
							</h2>
						</div>
						<form class="space-gender-6" on:submit={handleSubmit}>
							<div>
								<label
									for="text"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Record</label
								>
								<input
									class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
									type="text"
									name="gender"
									id="gender"
									bind:value={name}
									required
								/>
							</div>
							<div>
								<label
									for="text"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Description</label
								>
								<textarea
									class="mb-4 block resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									type="text"
									id="description"
									name="description"
									bind:value={description}
									rows="5"
									required
								/>
							</div>
							<div>
								<label
									for="text"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label
								>
								<input
									class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
									type="file"
									name="image"
									on:change={uploadImage}
									accept=".png, .jpg, .jpeg"
								/>
							</div>
							<div class="mb-4">
								{#if imageBase64}
									<img src={imageBase64} alt="Record Image" />
								{/if}
							</div>
							<div class="grid grid-cols-4">
								<Button color="success" textSize="text-md" text="Update" />
								<Button
									color="primary"
									textSize="text-md"
									text="Close"
									on:click={handleCloseModal}
								/>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
