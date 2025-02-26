<script lang="ts">
	import { formatDateMDY } from '$lib/utils/dateHelper';
	import LiveBuoy from '$lib/components/icons/LiveBuoy.svelte';

	export let data;

	let { record } = data;

	let imageError = !record?.image;
	let showLightbox = false;
</script>

<div class="border-2 border-gray-100 rounded-lg h-auto dark:border-gray-700 my-12 mx-4">
	<div class="p-8 bg-white mt-24 text-gray-700">
		<div class="grid grid-cols-1">
			<div class="relative">
				<div
					class="w-32 h-32 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500 cursor-pointer hover:opacity-90 transition-opacity"
					on:click={() => !imageError && record?.image && (showLightbox = true)}
					on:keydown={(e) => e.key === 'Enter' && !imageError && record?.image && (showLightbox = true)}
					role="button"
					tabindex="0"
				>
					{#if !imageError && record?.image}
						<img
							src={record.image.startsWith('data:')
								? record.image
								: `data:image/jpeg;base64,${record.image}`}
							on:error={() => (imageError = true)}
							alt={record?.name}
							class="w-full h-full object-cover rounded-full"
						/>
					{:else}
						<LiveBuoy />
					{/if}
				</div>
			</div>
		</div>
		<div class="mt-10 text-center border-b pb-12">
			<h1 class="text-4xl font-medium">
				{record?.name}
			</h1>

			<p class="font-light text-gray-600 mt-3">{record?.scientific_name || 'No scientific name'}</p>
			{#if record?.local_name}
				<p class="font-light text-gray-500 mt-2">Local Name: {record.local_name}</p>
			{/if}
			<p class="mt-8 text-xs text-gray-500">Created Date - {formatDateMDY(record?.created)}</p>
		</div>
		<div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
			{#if record?.country || record?.municipality || record?.barangay}
				<div class="bg-gray-50 p-4 rounded-lg">
					<h2 class="font-bold text-lg mb-2">Location</h2>
					{#if record?.country}
						<p class="text-sm"><span class="font-medium">Country:</span> {record.country}</p>
					{/if}
					{#if record?.municipality}
						<p class="text-sm"><span class="font-medium">Municipality:</span> {record.municipality}</p>
					{/if}
					{#if record?.barangay}
						<p class="text-sm"><span class="font-medium">Barangay:</span> {record.barangay}</p>
					{/if}
				</div>
			{/if}

			<div class="bg-gray-50 p-4 rounded-lg">
				{#if record?.threat}
					<div class="mb-2">
						<span class="font-bold">Threat Status:</span>
						<span class="ml-2 px-3 py-1 rounded-full text-sm {record.threat.toLowerCase() === 'harmless' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
							{record.threat}
						</span>
					</div>
				{/if}
				{#if record?.uses}
					<div>
						<span class="font-bold">Uses:</span>
						<span class="ml-2">{record.uses}</span>
					</div>
				{/if}
			</div>
		</div>

		{#each ['environment', 'distribution', 'description', 'biology', 'life'] as field}
			{#if record?.[field]}
				<div class="mt-6 bg-white p-4 rounded-lg border border-gray-100">
					<h2 class="font-bold text-lg mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</h2>
					<p class="text-base">{record[field]}</p>
				</div>
			{/if}
		{/each}

		{#if record?.reference}
			<div class="mt-6 bg-gray-50 p-4 rounded-lg">
				<h2 class="font-bold text-lg mb-2">Reference</h2>
				<p class="text-sm italic">{record.reference}</p>
			</div>
		{/if}
	</div>
</div>

{#if showLightbox && !imageError && record?.image}
	<button
		class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
		on:click={() => (showLightbox = false)}
		on:keydown={(e) => e.key === 'Escape' && (showLightbox = false)}
		aria-label="Close lightbox"
	>
		<div class="relative max-w-4xl max-h-[90vh] w-full">
			<button
				class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
				on:click|stopPropagation={() => (showLightbox = false)}
			>
				<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<img
				src={record.image.startsWith('data:')
					? record.image
					: `data:image/jpeg;base64,${record.image}`}
				alt={record?.name}
				class="max-h-[90vh] mx-auto object-contain rounded-lg"
			/>
		</div>
	</button>
{/if}
