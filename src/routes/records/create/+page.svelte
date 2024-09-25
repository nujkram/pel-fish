<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/reusable/Button.svelte';
	import { goto } from '$app/navigation';
	import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
	import { LeafletMap, Marker, TileLayer } from 'svelte-leafletjs';
	import L from 'leaflet';

	let scientific_name: string = '';
	let name: string = '';
	let local_name: string = '';
	let selectedFile: File;
	let imageBase64: string;
	let environment: string = '';
	let distribution: string = '';
	let maturity: number;
	let max: number;
	let description: string = '';
	let biology: string = '';
	let life: string = '';
	let reference: string = '';
	let country: string = '';
	let municipality: string = '';
	let barangay: string = '';
	let threat: string = '';
	let uses: string = '';
	let latitude: string = '';
	let longitude: string = '';
	let message: string = '';
	let markers: L.Marker[] = [];
	let markerCoordinates: [number, number][] = [];
	let leafletMap: any;

	onMount(() => {
		const map = leafletMap.getMap();
		map.on('click', handleMapClick);
	});
	const threatOptions = [
		{ value: 'Harmless', label: 'Harmless' },
		{ value: 'Potentially Harmless', label: 'Potentially Harmless' },
		{ value: 'Dangerous if Provoked', label: 'Dangerous if Provoked' },
		{ value: 'Unpredictable', label: 'Unpredictable' },
		{ value: 'Frequently Dangerous', label: 'Frequently Dangerous' },
		{ value: 'Extremely Dangerous', label: 'Extremly Dangerous' }
	];

	const uploadImage = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file: File = target.files[0];
			const reader: FileReader = new FileReader();

			reader.onload = (event: ProgressEvent<FileReader>): void => {
				const img: HTMLImageElement = new Image();
				img.onload = (): void => {
					const canvas: HTMLCanvasElement = document.createElement('canvas');
					const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

					// Set maximum width or height
					const maxSize: number = 800;
					let width: number = img.width;
					let height: number = img.height;

					if (width > height) {
						if (width > maxSize) {
							height *= maxSize / width;
							width = maxSize;
						}
					} else {
						if (height > maxSize) {
							width *= maxSize / height;
							height = maxSize;
						}
					}

					canvas.width = width;
					canvas.height = height;

					ctx?.drawImage(img, 0, 0, width, height);

					// Compress and convert to base64
					const compressedBase64: string = canvas.toDataURL('image/jpeg', 0.7);
					imageBase64 = compressedBase64;
				};
				img.src = event.target?.result as string;
			};

			reader.readAsDataURL(file);
		}
	};

	const mapOptions = {
		center: [11.6978352, 122.6217542],
		zoom: 11,
		dragging: true
	};
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const tileLayerOptions = {
		minZoom: 0,
		maxZoom: 9,
		maxNativeZoom: 19,
	};

	const handleMapClick = (e: L.LeafletMouseEvent) => {
		if (e && e.latlng) {
			const newMarker = L.marker(e.latlng).addTo(leafletMap.getMap());
			newMarker.on('click', () => handleMarkerClick(newMarker));
			markers = [...markers, newMarker];
			markerCoordinates = [...markerCoordinates, [e.latlng.lat, e.latlng.lng]];
			updateCoordinates();
		} else {
			console.warn('Invalid click event or location data:', e);
		}
	};

	const handleMarkerClick = (clickedMarker: L.Marker) => {
		leafletMap.getMap().removeLayer(clickedMarker);
		const index = markers.indexOf(clickedMarker);
		markers = markers.filter((marker) => marker !== clickedMarker);
		markerCoordinates = markerCoordinates.filter((_, i) => i !== index);
		updateCoordinates();
	};

	const updateCoordinates = () => {
		if (markerCoordinates.length > 0) {
			const lastMarker = markerCoordinates[markerCoordinates.length - 1];
			latitude = lastMarker[0].toString();
			longitude = lastMarker[1].toString();
		} else {
			latitude = '';
			longitude = '';
		}
	};
</script>

<div class="border border-gray-200 rounded mr-4 p-8">
	<form
		class="w-full max-w-2xl mb-4"
		on:submit|preventDefault={async () => {
			try {
				let response = await fetch('/api/admin/record/insert', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						scientific_name: scientific_name,
						name: name,
						local_name: local_name,
						image: imageBase64,
						environment: environment,
						distribution: distribution,
						maturity: maturity,
						max: max,
						description: description,
						biology: biology,
						life: life,
						reference: reference,
						country: country,
						municipality: municipality,
						barangay: barangay,
						threat: threat,
						uses: uses,
						markers: markerCoordinates,
						latitude: latitude,
						longitude: longitude
					})
				});

				let result = await response.json();
				message = result.message;
				setTimeout(() => {
					message = '';
					goto('/records');
				}, 3000);
			} catch (error) {
				console.error('error', error);
			}
		}}
	>
		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-scientific_name"
				>
					Scientific Name
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-scientific_name"
					type="text"
					name="scientific_name"
					bind:value={scientific_name}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-name"
				>
					Name
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-name"
					type="text"
					name="name"
					bind:value={name}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-local_name"
				>
					Local Name
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-local_name"
					type="text"
					name="local_name"
					bind:value={local_name}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-local_name"
				>
					Image
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-image"
					type="file"
					name="image"
					on:change={uploadImage}
					accept=".png, .jpg, .jpeg"
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-environment"
				>
					Environment
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-environment"
					type="text"
					name="environment"
					bind:value={environment}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-distribution"
				>
					Distribution
				</label>
				<textarea
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-distribution"
					rows="6"
					name="distribution"
					bind:value={distribution}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<h2 class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Length</h2>
			</div>
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-maturity"
				>
					Maturity
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-maturity"
					type="number"
					name="maturity"
					bind:value={maturity}
				/>
			</div>
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-max"
				>
					Max
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-max"
					type="number"
					name="max"
					bind:value={max}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-description"
				>
					Description
				</label>
				<textarea
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-description"
					name="description"
					rows="6"
					bind:value={description}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-biology"
				>
					Biology
				</label>
				<textarea
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-biology"
					name="biology"
					rows="6"
					bind:value={biology}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-life"
				>
					Life
				</label>
				<textarea
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-life"
					name="life"
					rows="6"
					bind:value={life}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-reference"
				>
					Reference
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-reference"
					type="text"
					name="reference"
					bind:value={reference}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-threat"
				>
					Threat
				</label>
				<select
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-threat"
					name="threat"
					bind:value={threat}
				>
					{#each threatOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-full px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-uses"
				>
					Uses
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-uses"
					type="text"
					name="uses"
					bind:value={uses}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-country"
				>
					Country
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-country"
					type="text"
					name="country"
					bind:value={country}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-municipality"
				>
					Municipality
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-municipality"
					type="text"
					name="municipality"
					bind:value={municipality}
				/>
			</div>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-barangay"
				>
					Barangay
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-barangay"
					type="text"
					name="barangay"
					bind:value={barangay}
				/>
			</div>
		</div>

		<div class="h-screen w-full">
			<LeafletMap bind:this={leafletMap} options={mapOptions}>
				<TileLayer url={tileUrl} options={tileLayerOptions} />
			</LeafletMap>
		</div>

		<div class="flex flex-wrap -mx-3 mb-6">
			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-latitude"
				>
					Latitude
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-latitude"
					type="text"
					name="latitude"
					bind:value={latitude}
					readonly
				/>
			</div>

			<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
				<label
					class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
					for="inline-longitude"
				>
					Longitude
				</label>
				<input
					class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
					id="inline-longitude"
					type="text"
					name="longitude"
					bind:value={longitude}
					readonly
				/>
			</div>
		</div>

		<div class="md:flex md:items-center">
			<div class="md:w-3/12" />
			<div class="md:w-9/12 text-right">
				<Button type="button" color="bg-green-500" textSize="text-md" text="Submit">
					<CheckCircle />
				</Button>
			</div>
		</div>
	</form>
	{#if message}
		<div
			transition:fade
			class="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b"
			role="alert"
		>
			<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
				><path
					d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
				/></svg
			>
			<p>{@html message}</p>
		</div>
	{/if}
</div>

<style>
	:root {
		--date-input-width: 100%;
		--date-picker-background: #e5e7eb;
		--date-picker-foreground: #374151;
	}
</style>
