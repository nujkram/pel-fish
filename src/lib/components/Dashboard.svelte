<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { LeafletMap, TileLayer, Marker, Popup } from 'svelte-leafletjs';

	let roles: any = [];
	let users: any = [];
	let records: any = [];
	let markerPosition: { coord: [number, number]; name: string; id: string }[] = [];
	let leafletMap: any;

	const mapOptions = {
		center: [11.6978352, 122.6217542],
		zoom: 11
	};
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const tileLayerOptions = {
		minZoom: 0,
		maxZoom: 9,
		maxNativeZoom: 19,
		attribution: '© OpenStreetMap contributors'
	};

	$: {
		if (users.length > 0) {
			for (let i = 0; i < roles.length; i++) {
				roles[i].count = getTotal(users, 'role', roles[i].name);
			}
		}
	}

	async function fetchData(path: string) {
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
	}

	function getTotal(array: any, property: any, sort: any) {
		if (!Array.isArray(array) || array.length === 0) return 0;
		let count = 0;
		for (let i = 0; i < array.length; i++)
			if (array[i].hasOwnProperty(property) && array[i][property] === sort) count++;
		return count;
	}

	onMount(async () => {
		users = await fetchData('/api/admin/user');
		records = await fetchData('/api/admin/record');
		roles = await fetchData('/api/admin/role');
	});

	$: {
		markerPosition = [];
		records.forEach((data: any) => {
			if (Array.isArray(data.markers) && data.markers.length > 0) {
				data.markers.forEach((marker: [number, number]) => {
					let lat: number = marker[0];
					let lng: number = marker[1];
					if (!isNaN(lat) && !isNaN(lng)) {
						markerPosition.push({ coord: [lat, lng], name: data.name, id: data._id });
					}
				});
			} else {
				// Fallback to using latitude and longitude if markers array is empty or not present
				let lat = parseFloat(data.latitude);
				let lng = parseFloat(data.longitude);
				if (!isNaN(lat) && !isNaN(lng)) {
					markerPosition.push({ coord: [lat, lng], name: data.name, id: data._id });
				}
			}
		});
	}
</script>

<div class="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg dark:border-gray-700">
	<div class="flex items-center justify-center mb-4 rounded bg-gray-500 dark:bg-gray-800">
		<div
			class="flex items-center py-8 flex-col border justify-center bg-white rounded dark:bg-gray-800 sm:px-16 xl:px-24"
		>
			<h1
				class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
			>
				PelFish Dashboard
			</h1>
			<p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
				An interactive and accessible information system that will help the LGU and fisher folks
				store and monitor data of the different species of Pelagic fishes that are commonly
				identified in Banate Bay. The system will generate statistical reports that are needed by
				the user with just one click of the mouse as well as a public forum for user interaction and
				reviews.
			</p>
			<div class="flex flex-row items-center justify-center gap-20 mt-8">
				<div class="flex flex-col items-center justify-center rounded dark:bg-gray-800">
					<p class="mb-2 text-3xl font-extrabold">{users.length}</p>
					<p class="text-gray-500 dark:text-gray-400">Total Users</p>
				</div>

				<div class="flex flex-col items-center justify-center rounded dark:bg-gray-800">
					<p class="mb-2 text-3xl font-extrabold">{records.length}</p>
					<p class="text-gray-500 dark:text-gray-400">Total Records</p>
				</div>
			</div>
			<div class="h-screen w-full z-0">
				{#key markerPosition}
					<LeafletMap bind:this={leafletMap} options={mapOptions}>
						<TileLayer url={tileUrl} options={tileLayerOptions} />
						{#each markerPosition as marker}
							<Marker latLng={marker.coord}>
								<Popup><a href="/records/{marker.id}">{marker.name}</a></Popup>
							</Marker>
						{/each}
					</LeafletMap>
				{/key}
			</div>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-4 mb-4">
		<div class="flex flex-col rounded bg-gray-500 dark:bg-gray-800">
			<div
				class="w-full h-full bg-white border border-gray-200 rounded shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700"
			>
				<div class="flex items-center justify-between mb-4">
					<h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">
						Users: {users.length}
					</h5>
					<a
						href="/users"
						class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
					>
						View all users
					</a>
				</div>
				<ul class="divide-y divide-gray-200 dark:divide-gray-700">
					{#key roles}
						{#if roles.length}
							{#each roles as role}
								<li class="py-3 sm:py-4">
									<div class="flex items-center space-x-4">
										<div class="flex-1 min-w-0">
											<p class="text-l font-medium text-gray-900 truncate dark:text-white">
												{role.name}
											</p>
										</div>
										<div
											class="inline-flex items-center text-base font-bold text-gray-900 dark:text-white"
										>
											{#if role.count}
												{role.count}
											{:else}
												0
											{/if}
										</div>
									</div>
								</li>
							{/each}
						{/if}
					{/key}
				</ul>
			</div>
		</div>

		<div class="flex items-center justify-center rounded bg-gray-500 dark:bg-gray-800">
			<div
				class="w-full h-full bg-white border border-gray-200 rounded shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700"
			>
				<div class="flex items-center justify-between mb-4">
					<h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">
						Records: {records.length}
					</h5>
					<a href="/" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
						View all records
					</a>
				</div>
				<ul class="divide-y divide-gray-200 dark:divide-gray-700" />
			</div>
		</div>
	</div>
</div>
