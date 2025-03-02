<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import { paginate } from 'svelte-paginate';
	import Button from '$lib/components/reusable/Button.svelte';
	import EditRecordForm from '$lib/components/forms/record/EditRecordForm.svelte';
	import DeleteRecordForm from '$lib/components/forms/record/DeleteRecordForm.svelte';
	import Sort from '$lib/components/reusable/Sort.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import Trash from '$lib/components/icons/Trash.svelte';
	import Eye from '$lib/components/icons/Eye.svelte';
	import LiveBuoy from '$lib/components/icons/LiveBuoy.svelte';

	export let data;

	let status = 'all';
	let search;
	let items = data.records;
	let currentPage = 1;
	let pageSize = 10;
	let itemSize;
	let paginatedItems = [];
	let currentRecord;
	let pageMinIndex = 1;
	let pageMaxIndex = pageSize;
	let sortOrder = 'asc';
	let sortBy = 'code';
	let isEditModalOpen = false;
	let isConfirmModalOpen = false;

	// Add new variables for enhanced filtering
	let selectedFilters = {
		threat: 'all',
		country: 'all'
	};

	let uniqueCountries = [...new Set(items.map((item) => item.country))].filter(Boolean);

	// Modals
	const handleEditModal = () => (isEditModalOpen = !isEditModalOpen);
	const handleConfirmDeleteModal = () => (isConfirmModalOpen = !isConfirmModalOpen);

	function currentRecordExist() {
		if (currentRecord === undefined) {
			console.error('Selected record is undefined!');
			return false;
		}

		if (!items.some((item) => item._id === currentRecord._id)) {
			console.error('Selected record does not exist in items fetch from database!');
			return false;
		}

		if (currentRecord.name === '' || currentRecord.description === '') {
			return false;
		}
		return true;
	}

	function sortItems() {
		let order = sortOrder === 'asc' ? 1 : -1;
		items = items.sort((a, b) => {
			if (a[sortBy] < b[sortBy]) return -1 * order;
			if (a[sortBy] > b[sortBy]) return 1 * order;
			return 0;
		});
	}

	function handleSort(columnName) {
		if (columnName === sortBy) {
			sortOrder = sortOrder === 'asc' ? 'des' : 'asc';
			console.warn(sortOrder);
		} else {
			sortBy = columnName;
		}
		sortItems();
	}

	const handleOverFlow = () => {
		if (pageMinIndex > itemSize) currentPage = 1;
	};

	const decrementPageNumber = () => {
		if (currentPage > 1) currentPage -= 1;
	};
	const incrementPageNumber = () => {
		if (pageMaxIndex < itemSize) currentPage += 1;
	};

	$: {
		// Prevent user to input below the minimum value of pagesize
		if (pageSize < 1) pageSize = 1;

		// Filter items based on search and status
		if (items) {
			try {
				paginatedItems = search
					? items.filter((item) => {
							const nameMatch =
								item.name && typeof item.name === 'string'
									? item.name.match(new RegExp(search, 'gi'))
									: false;
							const localNameMatch =
								item.local_name && typeof item.local_name === 'string'
									? item.local_name.match(new RegExp(search, 'gi'))
									: false;
							const countryMatch =
								item.country && typeof item.country === 'string'
									? item.country.match(new RegExp(search, 'gi'))
									: false;

							if (status !== 'all') {
								return (
									(nameMatch || localNameMatch || countryMatch) &&
									item.isActive === (status === 'active')
								);
							}
							return nameMatch || localNameMatch || countryMatch;
					  })
					: items.filter((item) => {
							return status !== 'all' ? item.isActive === (status === 'active') : true;
					  });

				if (paginatedItems.length) {
					itemSize = paginatedItems.length;
					paginatedItems = paginate({ items: paginatedItems, pageSize, currentPage });
				}

				pageMinIndex = paginatedItems.length == 0 ? 0 : 1 + (currentPage - 1) * pageSize;
				pageMaxIndex =
					pageSize * currentPage > paginatedItems.length
						? paginatedItems.length
						: pageSize * currentPage;
			} catch (error) {
				console.error('error', error);
			}
		}
	}

	const loadRecord = async () => {
		try {
			// Update items directly from data.records
			items = data.records;
			// Re-sort items if needed
			sortItems();
			// Reset pagination to first page
			currentPage = 1;
		} catch (error) {
			console.error('Error loading records:', error);
		}
	};
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Header Section -->
	<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
		<h1 class="text-2xl font-bold text-gray-800 mb-4">Manage Records</h1>

		<!-- Filters and Actions Row -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<!-- Status Filter -->
			<div>
				<div class="block text-sm font-medium text-gray-700 mb-2">Status</div>
				<select
					bind:value={status}
					class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				>
					<option value="all">All Status</option>
					<option value="active" class="text-green-600">Active</option>
					<option value="inactive" class="text-red-500">Inactive</option>
				</select>
			</div>

			<!-- Threat Level Filter -->
			<div>
				<div class="block text-sm font-medium text-gray-700 mb-2">Threat Level</div>
				<select
					bind:value={selectedFilters.threat}
					class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				>
					<option value="all">All Threats</option>
					<option value="Harmless">Harmless</option>
					<option value="Potentially Harmless">Potentially Harmless</option>
					<option value="Dangerous if Provoked">Dangerous if Provoked</option>
					<option value="Extremely Dangerous">Extremely Dangerous</option>
				</select>
			</div>

			<!-- Search Bar -->
			<div>
				<div class="block text-sm font-medium text-gray-700 mb-2">Search</div>
				<div class="relative">
					<input
						type="search"
						bind:value={search}
						placeholder="Search records..."
						class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
					/>
					<span class="absolute left-3 top-1/2 -translate-y-1/2">
						<svg
							class="w-5 h-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3">
			<Button color="success" text="Create New Record" type="link" href="/records/create">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
			</Button>
			<Button color="primary" text="Import Records" type="link" href="/records/import">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
					/>
				</svg>
			</Button>
		</div>
	</div>

	<!-- Records Table -->
	<div class="bg-white rounded-lg shadow-lg overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Image
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Name & Details
							<Sort on:click={() => handleSort('name')} />
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Location
							<Sort on:click={() => handleSort('country')} />
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Threat Level
							<Sort on:click={() => handleSort('threat')} />
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Status
							<Sort on:click={() => handleSort('isActive')} />
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[280px]"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each paginatedItems as data}
						<tr class="hover:bg-gray-50">
							<!-- Image -->
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
									{#if data.image}
										<img src={data.image} alt={data.name} class="h-full w-full object-cover" />
									{:else}
										<div class="h-full w-full flex items-center justify-center">
											<LiveBuoy />
										</div>
									{/if}
								</div>
							</td>

							<!-- Name & Details -->
							<td class="px-6 py-4">
								<div class="text-sm font-medium text-gray-900">{data.name}</div>
								<div class="text-sm text-gray-500">{data.scientific_name}</div>
								{#if data.local_name}
									<div class="text-xs text-gray-400">Local: {data.local_name}</div>
								{/if}
							</td>

							<!-- Location -->
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900">{data.country || 'N/A'}</div>
								{#if data.municipality}
									<div class="text-xs text-gray-500">{data.municipality}</div>
								{/if}
							</td>

							<!-- Threat Level -->
							<td class="px-6 py-4">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
									{data.threat === 'Harmless'
										? 'bg-green-100 text-green-800'
										: data.threat === 'Potentially Harmless'
										? 'bg-blue-100 text-blue-800'
										: data.threat === 'Dangerous if Provoked'
										? 'bg-yellow-100 text-yellow-800'
										: 'bg-red-100 text-red-800'}"
								>
									{data.threat || 'Unknown'}
								</span>
							</td>

							<!-- Status -->
							<td class="px-6 py-4">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
									{data.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}"
								>
									{data.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>

							<!-- Actions -->
							<td class="px-6 py-4 text-right space-x-2 flex">
								<Button color="primary" text="View" on:click={() => goto(`/records/${data._id}`)}>
									<Eye />
								</Button>
								<Button
									color="warning"
									text="Edit"
									on:click={() => {
										currentRecord = data;
										handleEditModal();
									}}
								>
									<Edit />
								</Button>
								<Button
									color="warning"
									text="Map"
									on:click={() => goto(`/records/${data._id}/map`)}
								>
									<LiveBuoy />
								</Button>
								<Button
									color="danger"
									text="Delete"
									on:click={() => {
										currentRecord = data;
										handleConfirmDeleteModal();
									}}
								>
									<Trash />
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
			<div class="flex justify-between items-center">
				<div class="text-sm text-gray-700">
					Showing <span class="font-medium">{pageMinIndex}</span> to
					<span class="font-medium">{pageMaxIndex}</span>
					of{' '}
					<span class="font-medium">{itemSize}</span> results
				</div>
				<div class="flex items-center space-x-2">
					<input
						type="number"
						bind:value={pageSize}
						on:change={handleOverFlow}
						class="w-16 rounded border-gray-300 text-sm"
						min="1"
					/>
					<span class="text-sm text-gray-700">per page</span>
				</div>
				<div class="flex space-x-2">
					<Button
						color="secondary"
						text="Previous"
						disabled={currentPage === 1}
						on:click={decrementPageNumber}
					/>
					<Button
						color="secondary"
						text="Next"
						disabled={pageMaxIndex >= itemSize}
						on:click={incrementPageNumber}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modals -->
{#if isEditModalOpen}
	<EditRecordForm bind:isEditModalOpen bind:currentRecord />
{/if}
{#if isConfirmModalOpen}
	<DeleteRecordForm bind:isConfirmModalOpen {currentRecord} {loadRecord} />
{/if}
