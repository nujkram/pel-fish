<script lang="ts">
	import { onMount, onDestroy, afterUpdate, tick } from 'svelte';
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
	let map: L.Map | null = null;
	let isMapReady = false;

	$: recordId = $page.params.recordId;

	// Global test - this should appear immediately when page loads
	console.log('===== MAP PAGE LOADED =====');
	console.log('Window location:', window.location.href);
	console.log('Data:', data);

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

	const initializeMap = () => {
		try {
			console.log('[Map] initializeMap called');
			console.log('[Map] typeof L:', typeof L);
			console.log('[Map] leafletMap:', leafletMap);

			// Check if Leaflet is loaded
			if (typeof L === 'undefined') {
				console.error('[Map] Leaflet library not loaded');
				return;
			}

			if (!leafletMap) {
				console.error('[Map] leafletMap not available');
				return;
			}

			console.log('[Map] Getting map instance...');
			map = leafletMap.getMap();
			console.log('[Map] Map instance:', map);

			if (!map) {
				console.error('[Map] Failed to get map instance');
				return;
			}

			// Add a test to verify the map object has the 'on' method
			console.log('[Map] Map methods available:', typeof map === 'object' ? Object.keys(map).slice(0, 10) : 'not an object');
			console.log('[Map] Map.on exists:', typeof map.on === 'function');

			console.log('[Map] Attaching click handler...');
			map.on('click', handleMapClick);
			console.log('[Map] Click handler attached successfully');

			// Also try adding a direct test handler to verify click works
			map.on('click', (e: any) => {
				console.log('[Map] DIRECT HANDLER - Map was clicked!', e);
			});

			isMapReady = true;

			// Add existing markers
			console.log('[Map] Adding', markerCoordinates.length, 'existing markers');
			for (const coord of markerCoordinates) {
				addMarker(coord);
			}

			// Focus on markers if they exist
			if (markerCoordinates.length > 0 && markers.length > 0) {
				const group = new L.FeatureGroup(markers);
				map.fitBounds(group.getBounds().pad(0.5), { maxZoom: 10 });
			}

			console.log('[Map] Initialization complete, isMapReady:', isMapReady);
			console.log('[Map] Click anywhere on the map to test...');
		} catch (error) {
			console.error('[Map] Error during initialization:', error);
			console.error('[Map] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
		}
	};

	onMount(async () => {
		console.log('[Map] onMount triggered');
		markerCoordinates = data.markers || [];

		// Wait for the DOM and Svelte component to be ready
		await tick();
		console.log('[Map] After tick, leafletMap:', leafletMap);

		// Try to initialize immediately
		if (leafletMap) {
			console.log('[Map] leafletMap available immediately');
			initializeMap();
			hasInitialized = true;
		} else {
			// If not ready, wait a bit and try again
			console.log('[Map] leafletMap not ready, waiting...');
			setTimeout(() => {
				console.log('[Map] Retry after 100ms, leafletMap:', leafletMap);
				if (leafletMap && !hasInitialized) {
					initializeMap();
					hasInitialized = true;
				}
			}, 100);

			// Another retry after 500ms
			setTimeout(() => {
				console.log('[Map] Retry after 500ms, leafletMap:', leafletMap);
				if (leafletMap && !hasInitialized) {
					initializeMap();
					hasInitialized = true;
				}
			}, 500);

			// Final retry after 1000ms
			setTimeout(() => {
				console.log('[Map] Final retry after 1000ms, leafletMap:', leafletMap);
				if (leafletMap && !hasInitialized) {
					initializeMap();
					hasInitialized = true;
				} else if (!leafletMap) {
					console.error('[Map] leafletMap NEVER became available!');
				}
			}, 1000);
		}
	});

	// Svelte 4 compatible: also try using afterUpdate
	afterUpdate(() => {
		if (leafletMap && !hasInitialized) {
			console.log('[Map] afterUpdate detected leafletMap, initializing...');
			initializeMap();
			hasInitialized = true;
		}
	});

	onDestroy(() => {
		try {
			console.log('[Map] Cleaning up map component...');

			if (map) {
				map.off('click', handleMapClick);
				console.log('[Map] Click handler removed');
			}

			// Clean up markers
			markers.forEach(marker => {
				try {
					marker.off('click');
					if (map) {
						map.removeLayer(marker);
					}
				} catch (e) {
					console.warn('[Map] Error cleaning up marker:', e);
				}
			});

			markers = [];
			isMapReady = false;
		} catch (error) {
			console.error('[Map] Error during cleanup:', error);
		}
	});

	const addMarker = (coord: [number, number]) => {
		try {
			if (!leafletMap || !map) {
				console.error('[Map] Cannot add marker: map not ready');
				return;
			}

			if (!coord || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1])) {
				console.error('[Map] Invalid coordinates:', coord);
				return;
			}

			console.log('[Map] Adding marker at:', coord);
			const marker = L.marker(coord).addTo(map);
			marker.on('click', () => handleMarkerClick(marker));
			markers = [...markers, marker];
		} catch (error) {
			console.error('[Map] Error adding marker:', error);
		}
	};

	const handleMapClick = (e: L.LeafletMouseEvent) => {
		try {
			console.log('[Map] Map clicked:', e);

			if (!isMapReady) {
				console.warn('[Map] Map not ready for interaction');
				return;
			}

			if (!e || !e.latlng) {
				console.warn('[Map] Invalid click event or location data:', e);
				return;
			}

			const coord: [number, number] = [e.latlng.lat, e.latlng.lng];
			console.log('[Map] Adding marker at clicked position:', coord);
			addMarker(coord);
			markerCoordinates = [...markerCoordinates, coord];
		} catch (error) {
			console.error('[Map] Error handling map click:', error);
		}
	};

	const handleMarkerClick = (clickedMarker: L.Marker) => {
		try {
			if (!map) {
				console.error('[Map] Cannot remove marker: map not ready');
				return;
			}

			console.log('[Map] Marker clicked, removing...');
			map.removeLayer(clickedMarker);
			const index = markers.indexOf(clickedMarker);
			markers = markers.filter((marker) => marker !== clickedMarker);
			markerCoordinates = markerCoordinates.filter((_, i) => i !== index);
			console.log('[Map] Marker removed. Remaining markers:', markers.length);
		} catch (error) {
			console.error('[Map] Error removing marker:', error);
		}
	};

	const handleSubmit = async (): Promise<void> => {
		try {
			console.log('[Map] Submitting markers:', markerCoordinates.length);

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
				console.error('[Map] Server error:', response.status, response.statusText);
				message = `Error: ${response.statusText}`;
				return;
			}

			const result = await response.json();
			console.log('[Map] Update successful:', result);
			message = result.message;
			setTimeout(() => {
				message = '';
				goto('/records');
			}, 3000);
		} catch (error) {
			console.error('[Map] Error updating markers:', error);
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
		<LeafletMap bind:this={leafletMap} options={mapOptions}>
			<TileLayer url={tileUrl} options={tileLayerOptions} />
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
