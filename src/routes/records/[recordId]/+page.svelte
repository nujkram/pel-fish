<script lang="ts">
	import { formatDateMDY } from '$lib/utils/dateHelper';
	import LiveBuoy from '$lib/components/icons/LiveBuoy.svelte';

	export let data;

	let { record } = data;
	let imageError: Boolean = record?.image ? false : true;
</script>

<div class="border-2 border-gray-100 rounded-lg h-auto dark:border-gray-700 my-12 mx-4">
	<div class="p-8 bg-white mt-24 text-gray-700">
		<div class="grid grid-cols-1">
			<div class="relative">
				<div
					class="w-24 h-24 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500"
				>
					{#if !imageError}
						<img
							src={record?.image || ''}
							on:error={() => (imageError = true)}
							alt={record?.name}
						/>
					{:else}
						<LiveBuoy />
					{/if}
				</div>
			</div>
		</div>
		<div class="mt-6 text-center border-b pb-12">
			<h1 class="text-4xl font-medium">
				{record?.name}
			</h1>

			<p class="font-light text-gray-600 mt-3">{record?.scientific_name || 'No scientific name'}</p>
			<p class="mt-8 text-xs text-gray-500">Created Date - {formatDateMDY(record?.created)}</p>
		</div>
		{#if record?.environment}
			<div class="mt-6 font-bold">Environment</div>
			<div class="text-base mt-2">{record.environment}</div>
		{/if}

		{#if record?.distribution}
			<div class="mt-6 font-bold">Distribution</div>
			<div class="text-base mt-2">{record.distribution}</div>
		{/if}

		{#if record?.maturity || record?.max}
			<div class="mt-6 font-bold">Length</div>
			<div class="text-base mt-2">
				{#if record?.maturity}
					<span>Maturity:</span> {record.maturity};
				{/if}
				{#if record?.max}
					<span>Max:</span> {record.max}
				{/if}
			</div>
		{/if}

		{#if record?.description}
			<div class="mt-6 font-bold">Description</div>
			<div class="text-base mt-2">{record.description}</div>
		{/if}

		{#if record?.biology}
			<div class="mt-6 font-bold">Biology</div>
			<div class="text-base mt-2">{record.biology}</div>
		{/if}

		{#if record?.life}
			<div class="mt-6 font-bold">Life Cycle and Mating Behavior</div>
			<div class="text-base mt-2">{record.life}</div>
		{/if}

		{#if record?.reference}
			<div class="mt-6 font-bold">Main Reference</div>
			<div class="text-base mt-2">{record.reference}</div>
		{/if}
		
        {#if record?.country}
			<div class="mt-6 font-bold">Countries</div>
			<div class="text-base mt-2">{record.country}</div>
		{/if}
		
        {#if record?.threat}
			<div class="mt-6 font-bold">Threat to Humans</div>
			<div class="text-base mt-2">{record.threat}</div>
		{/if}
		
        {#if record?.uses}
			<div class="mt-6 font-bold">Human uses</div>
			<div class="text-base mt-2">{record.uses}</div>
		{/if}
	</div>
</div>
