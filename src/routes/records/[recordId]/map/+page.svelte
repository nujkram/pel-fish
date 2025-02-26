<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/reusable/Button.svelte';
	import { goto } from '$app/navigation';
	import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
	import { LeafletMap, Marker, TileLayer } from 'svelte-leafletjs';
	import L from 'leaflet';
	import { page } from '$app/stores';

	export let data: any;

	let recordId: string;
	let leafletMap: any;
	let markers: L.Marker[] = [];
	let markerCoordinates: [number, number][] = [];
	let message: string = '';

	const mapOptions = {
		center: [11.6978352, 122.6217542],
		zoom: 11,
		dragging: true
	};
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const tileLayerOptions = {
		minZoom: 0,
		maxZoom: 21,
		maxNativeZoom: 19,
	};

	onMount(async (): Promise<void> => {
		markerCoordinates = data.markers;

		const map = leafletMap.getMap();
		map.on('click', handleMapClick);

		// Add existing markers
		for (const coord of markerCoordinates) {
			addMarker(coord);
		}
	});

	

	const addMarker = (coord: [number, number]) => {
		const map = leafletMap.getMap();
		const marker = L.marker(coord).addTo(map);
		marker.on('click', () => handleMarkerClick(marker));
		markers = [...markers, marker];
	};

	const handleMapClick = (e: L.LeafletMouseEvent) => {
		if (e && e.latlng) {
			const coord: [number, number] = [e.latlng.lat, e.latlng.lng];
			addMarker(coord);
			markerCoordinates = [...markerCoordinates, coord];
		} else {
			console.warn('Invalid click event or location data:', e);
		}
	};

	const handleMarkerClick = (clickedMarker: L.Marker) => {
		const map = leafletMap.getMap();
		map.removeLayer(clickedMarker);
		const index = markers.indexOf(clickedMarker);
		markers = markers.filter((marker) => marker !== clickedMarker);
		markerCoordinates = markerCoordinates.filter((_, i) => i !== index);
	};

	const handleSubmit = async (): Promise<void> => {
		try {
			const response = await fetch('/api/admin/record/update-marker', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ 
					_id: recordId,
					markers: markerCoordinates 
				})
			});

			const result = await response.json();
			message = result.message;
			setTimeout(() => {
				message = '';
				goto('/records');
			}, 3000);
		} catch (error) {
			console.error('Error updating markers:', error);
		}
	};
</script>

<div class="border border-gray-200 rounded mr-4 p-8">
	<h1 class="text-2xl font-bold mb-4">Update {data.name}</h1>
	<div class="h-screen w-full mb-4">
		<LeafletMap bind:this={leafletMap} options={mapOptions}>
			<TileLayer url={tileUrl} options={tileLayerOptions} />
		</LeafletMap>
	</div>

	<div class="md:flex md:items-center">
		<div class="md:w-3/12" />
		<div class="md:w-9/12 text-right">
			<Button
				type="button"
				on:click={handleSubmit}
				color="bg-green-500"
				textSize="text-md"
				text="Update Markers"
			>
				<CheckCircle />
			</Button>
		</div>
	</div>

	{#if message}
		<div
			transition:fade
			class="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b"
			role="alert"
		>
			<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
				<path
					d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
				/>
			</svg>
			<p>{@html message}</p>
		</div>
	{/if}
</div>
