<script lang="ts">
	import { onMount } from 'svelte';
	import { parse } from 'csv-parse/browser/esm/sync';

	type Marker = [number, number];

	type ImportedRecord = {
		_id: string;
		scientific_name: string;
		name: string;
		local_name: string;
		image: string;
		environment: string;
		distribution: string;
		description: string;
		biology: string;
		life: string;
		reference: string;
		country: string;
		municipality: string;
		barangay: string;
		threat: string;
		uses: string;
		markers: Marker[];
		latitude: number;
		longitude: number;
		created: Date;
		createdBy: string;
		isActive: boolean;
	};

	let fileInput: HTMLInputElement;
	let importedRecords: ImportedRecord[] = [];
	let isLoading: boolean = false;
	let error: string | null = null;

	const handleFileChange = (event: Event): void => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			parseFile(file);
		}
	};

	const parseFile = (file: File): void => {
		isLoading = true;
		error = null;

		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>): void => {
			try {
				const content = e.target?.result as string;
				const records = parse(content, {
					columns: true,
					skip_empty_lines: true
				});
				importedRecords = records.map((record: any) => ({
					...record,
					created: new Date(parseInt(record.created)),
					isActive: record.isActive === 'true',
					latitude: parseFloat(record.latitude),
					longitude: parseFloat(record.longitude),
					markers: record.markers ? JSON.parse(record.markers) : []
				}));
			} catch (err) {
				error = 'Error parsing file. Please check the format.';
				console.error(err);
			} finally {
				isLoading = false;
			}
		};
		reader.onerror = (): void => {
			error = 'Error reading file. Please try again.';
			isLoading = false;
		};
		reader.readAsText(file);
	};

	const handleImport = async (): Promise<void> => {
		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/admin/record/upload', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(importedRecords)
			});

			const result = await response.json();

			if (response.ok) {
				alert(result.message);
				importedRecords = [];
				if (fileInput) fileInput.value = '';
			} else {
				throw new Error(result.message || 'Failed to import records');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
			console.error(err);
		} finally {
			isLoading = false;
		}
	};

	onMount((): void => {
		// Any initialization logic if needed
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Import Records</h1>

	<div class="mb-6">
		<label for="fileInput" class="block text-sm font-medium text-gray-700 mb-2">
			Choose CSV file
		</label>
		<input
			id="fileInput"
			type="file"
			accept=".csv"
			on:change={handleFileChange}
			bind:this={fileInput}
			class="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
		/>
	</div>

	{#if isLoading}
		<p class="text-gray-600">Loading...</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if importedRecords.length > 0}
		<div class="overflow-x-auto">
			<table class="min-w-full bg-white">
				<thead class="bg-gray-100">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Name</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Country</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Municipality</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Barangay</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Latitude</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Longitude</th
						>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each importedRecords as record}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">{record.name}</td>
							<td class="px-6 py-4 whitespace-nowrap">{record.country}</td>
							<td class="px-6 py-4 whitespace-nowrap">{record.municipality}</td>
							<td class="px-6 py-4 whitespace-nowrap">{record.barangay}</td>
							<td class="px-6 py-4 whitespace-nowrap">{record.latitude}</td>
							<td class="px-6 py-4 whitespace-nowrap">{record.longitude}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<button
			on:click={handleImport}
			disabled={isLoading || importedRecords.length === 0}
			class="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isLoading ? 'Importing...' : 'Import Records'}
		</button>
	{/if}
</div>
