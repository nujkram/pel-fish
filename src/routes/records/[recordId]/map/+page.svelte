<script lang="ts">
	import { onMount, onDestroy, afterUpdate, tick } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/reusable/Button.svelte';
	import { goto } from '$app/navigation';
	import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
	// @ts-expect-error types provided via ambient declarations
	import { LeafletMap, Marker, TileLayer } from 'svelte-leafletjs';
	// @ts-expect-error types provided via ambient declarations
	import L from 'leaflet';
	// Explicitly set Leaflet default marker icon URLs to work in production builds
	// Vite will resolve these assets correctly when imported with ?url
	// Do this at module scope so it's ready before markers are created
	import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png?url';
	import markerIconUrl from 'leaflet/dist/images/marker-icon.png?url';
	import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png?url';
	import { page } from '$app/stores';

	export let data: any;

	let recordId: string;
	let leafletMap: any;
	let markerCoordinates: [number, number][] = data.markers || [];
	let message: string = '';
	let isMapReady = false;

	$: recordId = $page.params.recordId;

	// Reactive statement to ensure markers are loaded from data
	$: if (data && data.markers) {
		markerCoordinates = data.markers;
	}

	const mapOptions = {
		center: [11.6978352, 122.6217542],
		zoom: 11,
		dragging: true
	};
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const tileLayerOptions = {
		minZoom: 0,
		maxZoom: 21,
		maxNativeZoom: 19
	};

	let hasInitialized = false;

	// Configure default icon URLs once
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: markerIcon2xUrl,
		iconUrl: markerIconUrl,
		shadowUrl: markerShadowUrl
	});

	const handleMapLoad = () => {
		isMapReady = true;
		hasInitialized = true;
	};

	onMount(async () => {
		await tick();

		// Fallback: if load event doesn't fire, manually set map ready after 1 second
		setTimeout(() => {
			if (!isMapReady && leafletMap) {
				try {
					const map = leafletMap.getMap();
					if (map) {
						isMapReady = true;
						hasInitialized = true;
					}
				} catch (e) {
					// Silent fallback
				}
			}
		}, 1000);
	});

	afterUpdate(() => {
		if (leafletMap && !hasInitialized) {
			try {
				const map = leafletMap.getMap();
				if (map && !isMapReady) {
					isMapReady = true;
					hasInitialized = true;
				}
			} catch (e) {
				// Silent - map not ready yet
			}
		}
	});

	onDestroy(() => {
		isMapReady = false;
	});

	const addMarker = (coord: [number, number]) => {
		if (!coord || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1])) {
			return;
		}
		markerCoordinates = [...markerCoordinates, coord];
	};

	const handleMapClick = (e: any) => {
		// The event from svelte-leafletjs comes in e.detail
		const leafletEvent = e.detail || e;

		// Force map ready on first click if not already ready
		if (!isMapReady) {
			isMapReady = true;
			hasInitialized = true;
		}

		if (!leafletEvent || !leafletEvent.latlng) {
			return;
		}

		const coord: [number, number] = [leafletEvent.latlng.lat, leafletEvent.latlng.lng];
		addMarker(coord);
	};

	const handleMarkerClick = (coord: [number, number]) => {
		markerCoordinates = markerCoordinates.filter((c) => c[0] !== coord[0] || c[1] !== coord[1]);
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

			if (!response.ok) {
				message = `Error: ${response.statusText}`;
				return;
			}

			const result = await response.json();
			message = result.message;
			setTimeout(() => {
				message = '';
				goto('/records');
			}, 3000);
		} catch (error) {
			message = 'Failed to update markers. Please try again.';
		}
	};
</script>

<div class="border border-gray-200 rounded mr-4 p-8">
	<h1 class="text-2xl font-bold mb-4">Update {data.name}</h1>
	<div class="md:flex md:items-center mb-4">
		<div class="md:w-3/12">
			{#if isMapReady}
				<span class="text-green-600 font-semibold">Map Ready - Click to add pins</span>
			{:else}
				<span class="text-yellow-600 font-semibold">Loading map...</span>
			{/if}
		</div>
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
	<div class="h-screen w-full">
		<LeafletMap
			bind:this={leafletMap}
			options={mapOptions}
			events={['load', 'click']}
			on:load={handleMapLoad}
			on:click={handleMapClick}
		>
			<TileLayer url={tileUrl} options={tileLayerOptions} />
			{#each markerCoordinates as coord (coord.join(','))}
				<Marker latLng={coord} events={['click']} on:click={() => handleMarkerClick(coord)} />
			{/each}
		</LeafletMap>
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
