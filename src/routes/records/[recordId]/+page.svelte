<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { LeafletMap, TileLayer, Marker, Popup } from 'svelte-leafletjs';
	import L from 'leaflet';

	export let data;
	let { record } = data;
	let imageError = !record?.image;
	let leafletMap: any;
	let mapInitialized = false;

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
		mapInitialized =
			record &&
			((Array.isArray(record.markers) && record.markers.length > 0) ||
				(record.latitude && record.longitude));
	}

	const initializeMap = () => {
		if (leafletMap && mapInitialized) {
			const map = leafletMap.getMap();
			map.invalidateSize();
			if (Array.isArray(record.markers) && record.markers.length > 0) {
				const bounds = L.latLngBounds(record.markers);
				map.fitBounds(bounds.pad(0.5), { maxZoom: 10 });
			} else if (record.latitude && record.longitude) {
				const lat = Number.parseFloat(record.latitude);
				const lng = Number.parseFloat(record.longitude);
				if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
					map.setView([lat, lng], 10);
				}
			}
		}
	};
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<div class="bg-white rounded-lg shadow-lg overflow-hidden">
		<div class="relative h-64">
			{#if !imageError && record?.image}
				<img
					src={record.image.startsWith('data:')
						? record.image
						: `data:image/jpeg;base64,${record.image}`}
					alt={record?.name}
					class="w-full h-full object-cover"
					on:error={() => (imageError = true)}
				/>
			{:else}
				<div class="w-full h-full bg-gray-200 flex items-center justify-center">
					<span class="text-gray-400">No image available</span>
				</div>
			{/if}
		</div>

		<div class="p-6">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">{record?.name}</h1>
			<p class="text-xl text-gray-600 italic mb-4">{record?.scientific_name}</p>
			{#if record?.local_name}
				<p class="text-gray-600 mb-6">Local Name: {record.local_name}</p>
			{/if}

			{#if record?.threat}
				<div class="mb-6">
					<span class="font-semibold">Threat Status: </span>
					<span
						class="px-3 py-1 rounded-full text-sm {record.threat.toLowerCase() === 'harmless'
							? 'bg-green-100 text-green-800'
							: 'bg-yellow-100 text-yellow-800'}"
					>
						{record.threat}
					</span>
				</div>
			{/if}

			{#each ['environment', 'distribution', 'description', 'biology', 'life'] as field}
				{#if record?.[field]}
					<div class="mb-6">
						<h2 class="text-xl font-semibold mb-2 text-gray-800">
							{field.charAt(0).toUpperCase() + field.slice(1)}
						</h2>
						<p class="text-gray-600">{record[field]}</p>
					</div>
				{/if}
			{/each}

			{#if mapInitialized}
				<div class="h-96 w-full mb-6">
					<LeafletMap bind:this={leafletMap} options={mapOptions} on:ready={initializeMap}>
						<TileLayer url={tileUrl} options={tileLayerOptions} />
						{#if Array.isArray(record.markers) && record.markers.length > 0}
							{#each record.markers as marker}
								<Marker latLng={marker}>
									<Popup>{record.name}</Popup>
								</Marker>
							{/each}
						{:else if record.latitude && record.longitude}
							<Marker latLng={[Number(record.latitude), Number(record.longitude)]}>
								<Popup>{record.name}</Popup>
							</Marker>
						{/if}
					</LeafletMap>
				</div>
			{/if}

			{#if record?.reference}
				<div class="mt-8 p-4 bg-gray-50 rounded">
					<h2 class="font-semibold mb-2">Reference</h2>
					<p class="text-sm italic text-gray-600">{record.reference}</p>
				</div>
			{/if}
		</div>
	</div>
</div>
