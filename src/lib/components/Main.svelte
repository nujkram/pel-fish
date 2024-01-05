<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { LeafletMap, TileLayer, Marker, Popup } from 'svelte-leafletjs';
	import { paginate } from 'svelte-paginate';
	import Sort from './reusable/Sort.svelte';
	import { goto } from '$app/navigation';

	interface Fish {
		biology: string;
		country: string;
		created: string;
		createBy: string;
		description: string;
		distribution: string;
		environment: string;
		image: string;
		isActive: boolean;
		latitude: string;
		life: string;
		local_name: string;
		longitude: string;
		maturity: number;
		max: number;
		name: string;
		reference: string;
		scientific_name: string;
		threat: string;
		uses: string;
		_id: string;
	}

	let records: Fish[];
	let status = 'all';
	let search: string;
	let currentPage: number = 1;
	let pageSize: number = 10;
	let itemSize: number;
	let paginatedItems: any = [];
	let pageMinIndex: number = 1;
	let pageMaxIndex: number = pageSize;
	let sortOrder = 'asc';
	let currentRecord: any;
	let leafletMap: any;
	let markerPosition: any = [];

	const mapOptions = {
		center: [11.6978352, 122.6217542],
		zoom: 11
	};
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const tileLayerOptions = {
		minZoom: 0,
		maxZoom: 5,
		maxNativeZoom: 19,
		attribution: '© OpenStreetMap contributors'
	};

	const fetchData = async (path: string): Promise<any> => {
		try {
			let response = await fetch(path, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			return result.response;
		} catch (error) {
			console.error('error', error);
		}
	};

	onMount(async () => {
		records = await fetchData('/api/admin/record');
		sortItems(records, 'name', 'asc');
	});

	const sortItems = (fish: Fish[], sortBy: keyof Fish, sortOrder: string) => {
		let order = sortOrder === 'asc' ? 1 : -1;
		fish = fish.sort((a, b) => {
			if (a[sortBy] > b[sortBy]) {
				return order;
			}
			if (a[sortBy] < b[sortBy]) {
				return -order;
			}
			return 0;
		});
	};

	const handleSort = (column: keyof Fish, sort: string) => {
		sort = sort === 'asc' ? 'desc' : 'asc';
		sortItems(records, 'name', sort);
	};

	const handleOverFlow = () => {
		if (pageMaxIndex > itemSize) currentPage -= 1;
	};

	const decrementPageNumber = () => {
		if (currentPage > 1) {
			currentPage -= 1;
			pageMinIndex = (currentPage - 1) * pageSize + 1;
			pageMaxIndex = currentPage * pageSize;
		}
	};

	const incrementPageNumber = () => {
		if (currentPage < itemSize / pageSize) {
			currentPage += 1;
			pageMinIndex = (currentPage - 1) * pageSize + 1;
			pageMaxIndex = currentPage * pageSize;
		}
	};

	const viewRecord = () => {
		return () => {
			console.log('currentRecord', currentRecord);
			goto(`records/${currentRecord._id}`);
		};
	};

	$: {
		if (pageSize < 1) pageSize = 1;
		if (records) {
			try {
				paginatedItems = search
					? records.filter((item) => {
							return status !== 'all'
								? item.name.match(RegExp(search, 'gi')) ||
										(item.scientific_name.match(RegExp(search, 'gi')) &&
											item.isActive === (status === 'active'))
								: item.name.match(RegExp(search, 'gi')) ||
										item.scientific_name.match(RegExp(search, 'gi'));
					  })
					: records.filter((items) => {
							return status !== 'all' ? items.isActive === (status === 'active') : items;
					  });

				if (paginatedItems.length) {
					itemSize = paginatedItems.length;
					paginatedItems = paginate({ items: paginatedItems, pageSize, currentPage });

					markerPosition = [];
					paginatedItems.forEach((data: any) => {
						let lat = parseFloat(data.latitude);
						let lng = parseFloat(data.longitude);
						if (!isNaN(lat) && !isNaN(lng)) {
							markerPosition.push({ coord: [lat, lng], name: data.name, id: data._id });
						}
					});

					console.log('markerPosition', markerPosition);
				}

				pageMinIndex = paginatedItems.length == 0 ? 0 : 1 + (currentPage - 1) * pageSize;
				pageMaxIndex =
					pageSize * currentPage > paginatedItems.length
						? paginatedItems.length
						: pageSize * currentPage;
			} catch (error: any) {
				console.error('error', error);
			}
		}
	}
</script>

<div class="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg dark:border-gray-700">
	<div class="flex items-center mb-4 rounded bg-gray-500 dark:bg-gray-800">
		<div
			class="flex py-8 justify-center md:flex-row border gap-12 bg-white rounded dark:bg-gray-800 sm:px-16 xl:px-24 w-full flex-col"
		>
			<div class="flex flex-col gap-4 mt-8 w-full overflow-x-auto">
				<div class="flex gap-4 w-full">
					<div class="grid grid-cols-9 gap-2">
						<div class="col-span-2">
							<select
								id="status"
								bind:value={status}
								class="bg-gray-50 border border-gray-300 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							>
								<option class="text-gray-900 text-sm font-semibold" value="all" selected>All</option
								>
								<option class="text-green-600 text-sm font-semibold" value="active"> Active</option>
								<option class="text-red-500 text-sm font-semibold" value="inactive">Inactive</option
								>
							</select>
						</div>

						<div class="col-start-3 col-span-7 rounded">
							<form class="flex items-center">
								<label for="search" class="sr-only">Search</label>
								<div class="relative w-full">
									<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
										<svg
											aria-hidden="true"
											class="w-5 h-5 text-gray-500 dark:text-gray-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											><path
												fill-rule="evenodd"
												d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
												clip-rule="evenodd"
											/></svg
										>
									</div>
									<input
										type="search"
										bind:value={search}
										id="search"
										class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										placeholder="Search"
										required
									/>
								</div>
							</form>
						</div>
					</div>
					<div class="flex flex-col items-center justify-center rounded dark:bg-gray-800">
						{#key paginatedItems?.length}
							<p class="mb-2 text-3xl font-extrabold">{paginatedItems?.length || 0}</p>
						{/key}
						<p class="text-gray-500 text-xs dark:text-gray-400 text-center">Records</p>
					</div>
				</div>
				<div
					class="flex  h-fit mb-1 rounded bg-gray-50 dark:bg-gray-800"
				>
					<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
						<thead
							class="text-m text-gray-700 border-b bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
						>
							<tr>
								<th scope="col" class="pl-6">
									<div class="flex my-auto gap-0">
										Name <Sort on:click={() => handleSort('name', sortOrder)} />
									</div>
								</th>
								<th scope="col" class="pl-6">
									<div class="flex my-auto gap-0">
										Scientific Name <Sort
											on:click={() => handleSort('scientific_name', sortOrder)}
										/>
									</div>
								</th>
								<th scope="col" class="pl-6">
									<div class="flex my-auto gap-0">
										Country <Sort on:click={() => handleSort('country', sortOrder)} />
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{#key paginatedItems}
								{#if paginatedItems.length}
									{#each paginatedItems as item}
										<tr
											class=" bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
											on:mouseenter={() => {
												if (currentRecord !== item) {
													currentRecord = item;
												}
											}}
											on:click={viewRecord()}
										>
											<td
												class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium"
											>
												{item.name || 'NA'}
											</td>
											<td
												class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium"
											>
												{item.scientific_name || 'NA'}
											</td>
											<td
												class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium"
											>
												{item.country || 'NA'}
											</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td colspan="3" class="text-center">No records found.</td>
									</tr>
								{/if}
							{/key}
						</tbody>
					</table>
				</div>
				<div class="flex flex-col md:items-start my-2 items-end w-full">
					<span class="text-sm text-gray-700 dark:text-gray-400">
						Showing <span class="font-semibold text-gray-900 dark:text-white"
							>{pageMinIndex}</span
						>
						to
						<span class="font-semibold text-gray-900 dark:text-white">{pageMaxIndex}</span>
						of <span class="font-semibold text-gray-900 dark:text-white">{itemSize}</span> Entries
					</span>
					<div class="inline-flex mt-2 xs:mt-0">
						<button
							on:click={decrementPageNumber}
							class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						>
							<svg
								aria-hidden="true"
								class="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
									clip-rule="evenodd"
								/>
							</svg>
							Prev
						</button>
						<button
							on:click={incrementPageNumber}
							class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						>
							Next
							<svg
								aria-hidden="true"
								class="w-5 h-5 ml-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
			<div class="h-screen w-full">
				{#key paginatedItems}
					{#if markerPosition.length}
						<LeafletMap this={leafletMap} options={mapOptions}>
							<TileLayer url={tileUrl} options={tileLayerOptions} />
							{#each markerPosition as marker}
								<Marker latLng={marker.coord}>
									<Popup><a href="/records/{marker.id}">{marker.name}</a></Popup>
								</Marker>
							{/each}
						</LeafletMap>
					{:else}
						<div class="flex w-full h-full">
							<p class="m-auto">Map failed to load.</p>
						</div>
					{/if}
				{/key}
			</div>
		</div>
	</div>
</div>
