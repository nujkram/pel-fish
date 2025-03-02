<script lang="ts">
	// @ts-nocheck
	import Button from '$lib/components/reusable/Button.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let isEditModalOpen = false;
	export let currentRecord;

	let _id: string = currentRecord._id;
	let scientific_name: string = currentRecord.scientific_name;
	let name: string = currentRecord.name;
	let local_name: string = currentRecord.local_name;
	let environment: string = currentRecord.environment;
	let distribution: string = currentRecord.distribution;
	let maturity: number = currentRecord.maturity;
	let max: number = currentRecord.max;
	let description: string = currentRecord.description;
	let biology: string = currentRecord.biology;
	let life: string = currentRecord.life;
	let reference: string = currentRecord.reference;
	let country: string = currentRecord.country;
	let municipality: string = currentRecord.municipality;
	let barangay: string = currentRecord.barangay;
	let threat: string = currentRecord.threat;
	let uses: string = currentRecord.uses;
	let latitude: string = currentRecord.latitude;
	let longitude: string = currentRecord.longitude;
	let selectedFile: File | null = null;
	let imageBase64: string | null = currentRecord.image;

	let message = '';

	const threatOptions = [
		{ value: 'Harmless', label: 'Harmless' },
		{ value: 'Potentially Harmless', label: 'Potentially Harmless' },
		{ value: 'Dangerous if Provoked', label: 'Dangerous if Provoked' },
		{ value: 'Unpredictable', label: 'Unpredictable' },
		{ value: 'Frequently Dangerous', label: 'Frequently Dangerous' },
		{ value: 'Extremely Dangerous', label: 'Extremly Dangerous' }
	];

	const setEditValues = () => {
		if (currentRecord === undefined) {
			currentRecord = {
				_id: 'NA',
				scientific_name: 'NA',
				name: 'NA',
				local_name: 'NA',
				environment: 'NA',
				distribution: 'NA',
				maturity: 0,
				max: 0,
				description: 'NA',
				biology: 'NA',
				life: 'NA',
				reference: 'NA',
				country: 'NA',
				municipality: 'NA',
				barangay: 'NA',
				threat: 'NA',
				uses: 'NA',
				latitude: 'NA',
				longitude: 'NA',
				image: null
			};
		}
		_id = currentRecord._id;
		scientific_name = currentRecord.scientific_name;
		name = currentRecord.name;
		local_name = currentRecord.local_name;
		environment = currentRecord.environment;
		distribution = currentRecord.distribution;
		maturity = currentRecord.maturity;
		max = currentRecord.max;
		description = currentRecord.description;
		biology = currentRecord.biology;
		life = currentRecord.life;
		reference = currentRecord.reference;
		country = currentRecord.country;
		municipality = currentRecord.municipality;
		barangay = currentRecord.barangay;
		threat = currentRecord.threat;
		uses = currentRecord.uses;
		latitude = currentRecord.latitude;
		longitude = currentRecord.longitude;
		imageBase64 = currentRecord.image;
	};

	const handleCloseModal = () => (isEditModalOpen = false);

	const handleSubmit = async (event: Event) => {
		event.preventDefault();

		try {
			const response = await fetch('/api/admin/record/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id,
					scientific_name,
					name,
					local_name,
					environment,
					distribution,
					maturity,
					max,
					description,
					biology,
					life,
					reference,
					country,
					municipality,
					barangay,
					threat,
					uses,
					latitude,
					longitude,
					image: imageBase64
				})
			});
			const result = await response.json();

			if (result.status === 'Success') {
				message = 'Record updated successfully';
				// First show message for 2 seconds
				await new Promise((resolve) => setTimeout(resolve, 2000));
				// Then close modal and reload
				isEditModalOpen = false;
				location.reload();
			} else {
				message = result.message || 'Error updating record';
				setTimeout(() => {
					message = '';
				}, 3000);
			}
		} catch (error) {
			console.error('Submission error:', error);
			message = 'Error updating record';
			setTimeout(() => {
				message = '';
			}, 3000);
		}
	};

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

					const compressedBase64: string = canvas.toDataURL('image/jpeg', 0.7);
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

<div class="fixed z-50 inset-0 overflow-y-auto {isEditModalOpen ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center p-4">
		<div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
		<div
			class="relative z-50 h-[600px] mt-16 overflow-auto bg-white rounded-lg shadow-xl w-full max-w-6xl"
		>
			<div class="px-6 py-6 lg:px-8">
				<div class="flex justify-between mb-4">
					<h2 class="text-2xl font-bold leading-6 text-gray-900" id="modal-headline">
						Edit Record
					</h2>
					<button
						on:click={handleCloseModal}
						class="text-gray-400 hover:text-gray-500"
						aria-label="Close modal"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{#if message}
					<div
						transition:fade={{ duration: 200 }}
						class="fixed top-4 right-4 z-50 flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded shadow-lg"
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

				<form class="grid grid-cols-1 md:grid-cols-2 gap-6" on:submit={handleSubmit}>
					<div class="space-y-4">
						<div>
							<label for="scientific_name" class="block text-sm font-medium text-gray-700"
								>Scientific Name</label
							>
							<input
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								type="text"
								name="scientific_name"
								id="scientific_name"
								bind:value={scientific_name}
								required
							/>
						</div>
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
							<input
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								type="text"
								name="name"
								id="name"
								bind:value={name}
								required
							/>
						</div>
						<div>
							<label for="local_name" class="block text-sm font-medium text-gray-700"
								>Local Name</label
							>
							<input
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								type="text"
								name="local_name"
								id="local_name"
								bind:value={local_name}
								required
							/>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<label for="environment" class="block text-sm font-medium text-gray-700"
								>Environment</label
							>
							<input
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								type="text"
								name="environment"
								id="environment"
								bind:value={environment}
								required
							/>
						</div>
						<div>
							<label for="maturity" class="block text-sm font-medium text-gray-700"
								>Maturity (cm)</label
							>
							<input
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								type="number"
								name="maturity"
								id="maturity"
								bind:value={maturity}
								step="0.1"
							/>
						</div>
						<div>
							<label for="max" class="block text-sm font-medium text-gray-700">Max</label>
							<input
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								type="number"
								name="max"
								id="max"
								bind:value={max}
							/>
						</div>
					</div>

					<div class="md:col-span-2">
						<label for="distribution" class="block text-sm font-medium text-gray-700"
							>Distribution</label
						>
						<textarea
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							id="distribution"
							name="distribution"
							rows="3"
							bind:value={distribution}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="description" class="block text-sm font-medium text-gray-700"
							>Description</label
						>
						<textarea
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							id="description"
							name="description"
							rows="5"
							bind:value={description}
							required
						/>
					</div>

					<div class="md:col-span-2">
						<label for="biology" class="block text-sm font-medium text-gray-700">Biology</label>
						<textarea
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							id="biology"
							name="biology"
							rows="5"
							bind:value={biology}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="life" class="block text-sm font-medium text-gray-700"
							>Life Cycle and Mating Behavior</label
						>
						<textarea
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							id="life"
							name="life"
							rows="5"
							bind:value={life}
						/>
					</div>

					<div>
						<label for="reference" class="block text-sm font-medium text-gray-700">Reference</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="reference"
							id="reference"
							bind:value={reference}
						/>
					</div>

					<div>
						<label for="country" class="block text-sm font-medium text-gray-700">Country</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="country"
							id="country"
							bind:value={country}
							required
						/>
					</div>

					<div>
						<label for="municipality" class="block text-sm font-medium text-gray-700"
							>Municipality</label
						>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="municipality"
							id="municipality"
							bind:value={municipality}
							required
						/>
					</div>

					<div>
						<label for="barangay" class="block text-sm font-medium text-gray-700">Barangay</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="barangay"
							id="barangay"
							bind:value={barangay}
							required
						/>
					</div>

					<div>
						<label for="threat" class="block text-sm font-medium text-gray-700">Threat</label>
						<select
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							name="threat"
							id="threat"
							bind:value={threat}
							required
						>
							{#each threatOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="uses" class="block text-sm font-medium text-gray-700">Uses</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="uses"
							id="uses"
							bind:value={uses}
						/>
					</div>

					<div>
						<label for="latitude" class="block text-sm font-medium text-gray-700">Latitude</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="latitude"
							id="latitude"
							bind:value={latitude}
						/>
					</div>

					<div>
						<label for="longitude" class="block text-sm font-medium text-gray-700">Longitude</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="text"
							name="longitude"
							id="longitude"
							bind:value={longitude}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="image" class="block text-sm font-medium text-gray-700">Image</label>
						<input
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							type="file"
							name="image"
							id="image"
							bind:value={imageBase64}
							accept="image/*"
							on:change={uploadImage}
						/>
					</div>

					<div class="md:col-span-2">
						<Button type="submit" class="w-full" text="Update" />
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
