<script lang="ts">
	// @ts-nocheck
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let data;

	let Chart;
	let LeafletMap, TileLayer, Marker, Popup;

	let activeTab = 'threat';
	let loading = {
		threat: true,
		geographic: true,
		userActivity: true,
		biodiversity: true
	};

	// Data stores
	let threatData = null;
	let geographicData = null;
	let userActivityData = null;
	let biodiversityData = null;

	// Chart references
	let threatChart = null;
	let threatPieChart = null;
	let countryChart = null;
	let municipalityChart = null;
	let timelineChart = null;
	let contributorsChart = null;
	let environmentChart = null;
	let sizeChart = null;

	// Map configuration for geographic view
	const mapOptions = {
		center: [11.6978352, 122.6217542],
		zoom: 11
	};
	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const tileLayerOptions = {
		minZoom: 0,
		maxZoom: 20,
		maxNativeZoom: 19,
		attribution: '© OpenStreetMap contributors'
	};

	$: markerPositions = geographicData?.locationData || [];

	// Reactive statements to render charts when data and Chart are available
	$: if (Chart && threatData && activeTab === 'threat') renderThreatCharts();
	$: if (Chart && geographicData && activeTab === 'geographic') renderGeographicCharts();
	$: if (Chart && userActivityData && activeTab === 'userActivity') renderUserActivityCharts();
	$: if (Chart && biodiversityData && activeTab === 'biodiversity') renderBiodiversityCharts();

	// Fetch data functions
	async function fetchThreatDistribution() {
		try {
			const response = await fetch('/api/admin/reports/threat-distribution');
			const result = await response.json();
			if (result.success) {
				threatData = result.data;
			} else {
				console.error('Failed to fetch threat distribution:', result.error);
			}
		} catch (error) {
			console.error('Error fetching threat distribution:', error);
		} finally {
			loading.threat = false;
		}
	}

	async function fetchGeographicStats() {
		try {
			const response = await fetch('/api/admin/reports/geographic-stats');
			const result = await response.json();
			console.log('Geographic stats result:', result);
			if (result.success) {
				geographicData = result.data;
			} else {
				console.error('Failed to fetch geographic stats:', result.error);
			}
		} catch (error) {
			console.error('Error fetching geographic stats:', error);
		} finally {
			loading.geographic = false;
		}
	}

	async function fetchUserActivity() {
		try {
			const response = await fetch('/api/admin/reports/user-activity');
			const result = await response.json();
			console.log('User activity result:', result);
			if (result.success) {
				userActivityData = result.data;
			} else {
				console.error('Failed to fetch user activity:', result.error);
			}
		} catch (error) {
			console.error('Error fetching user activity:', error);
		} finally {
			loading.userActivity = false;
		}
	}

	async function fetchBiodiversity() {
		try {
			const response = await fetch('/api/admin/reports/biodiversity');
			const result = await response.json();
			console.log('Biodiversity result:', result);
			if (result.success) {
				biodiversityData = result.data;
			} else {
				console.error('Failed to fetch biodiversity:', result.error);
			}
		} catch (error) {
			console.error('Error fetching biodiversity:', error);
		} finally {
			loading.biodiversity = false;
		}
	}

	// Initialize when browser is available
	if (browser) {
		setTimeout(async () => {
			try {
				// Load Chart.js
				const chartModule = await import('chart.js');
				Chart = chartModule.Chart;
				Chart.register(...chartModule.registerables);

				// Load Leaflet
				const leafletModule = await import('svelte-leafletjs');
				LeafletMap = leafletModule.LeafletMap;
				TileLayer = leafletModule.TileLayer;
				Marker = leafletModule.Marker;
				Popup = leafletModule.Popup;
				await import('leaflet/dist/leaflet.css');
			} catch (error) {
				console.error('Error loading libraries:', error);
			}

			// Fetch all data
			fetchThreatDistribution();
			fetchGeographicStats();
			fetchUserActivity();
			fetchBiodiversity();
		}, 100);
	}

	// Chart rendering functions
	function renderThreatCharts() {
		if (!threatData || !Chart) return;

		// Use setTimeout to ensure DOM is ready
		setTimeout(() => {
			// Bar Chart
			const ctxBar = document.getElementById('threatBarChart');
			if (ctxBar) {
				if (threatChart) threatChart.destroy();
				threatChart = new Chart(ctxBar, {
					type: 'bar',
					data: {
						labels: threatData.map((item) => item.threat),
						datasets: [
							{
								label: 'Number of Species',
								data: threatData.map((item) => item.count),
								backgroundColor: [
									'rgba(34, 197, 94, 0.7)',
									'rgba(59, 130, 246, 0.7)',
									'rgba(234, 179, 8, 0.7)',
									'rgba(249, 115, 22, 0.7)',
									'rgba(239, 68, 68, 0.7)',
									'rgba(127, 29, 29, 0.7)'
								],
								borderColor: [
									'rgba(34, 197, 94, 1)',
									'rgba(59, 130, 246, 1)',
									'rgba(234, 179, 8, 1)',
									'rgba(249, 115, 22, 1)',
									'rgba(239, 68, 68, 1)',
									'rgba(127, 29, 29, 1)'
								],
								borderWidth: 2
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: { display: false },
							title: {
								display: true,
								text: 'Species Count by Threat Level',
								font: { size: 16, weight: 'bold' }
							}
						},
						scales: {
							y: { beginAtZero: true, ticks: { precision: 0 } }
						}
					}
				});
			}

			// Pie Chart
			const ctxPie = document.getElementById('threatPieChart');
			if (ctxPie) {
				if (threatPieChart) threatPieChart.destroy();
				threatPieChart = new Chart(ctxPie, {
					type: 'pie',
					data: {
						labels: threatData.map((item) => item.threat),
						datasets: [
							{
								data: threatData.map((item) => item.count),
								backgroundColor: [
									'rgba(34, 197, 94, 0.8)',
									'rgba(59, 130, 246, 0.8)',
									'rgba(234, 179, 8, 0.8)',
									'rgba(249, 115, 22, 0.8)',
									'rgba(239, 68, 68, 0.8)',
									'rgba(127, 29, 29, 0.8)'
								],
								borderWidth: 2
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: { position: 'right' },
							title: {
								display: true,
								text: 'Threat Level Distribution',
								font: { size: 16, weight: 'bold' }
							}
						}
					}
				});
			}
		}, 10);
	}

	function renderGeographicCharts() {
		if (!geographicData || !Chart) return;

		setTimeout(() => {
			console.log('Rendering geographic charts...');
			// Country Chart
			const ctxCountry = document.getElementById('countryChart');
			if (ctxCountry && geographicData.byCountry.length > 0) {
				if (countryChart) countryChart.destroy();
				countryChart = new Chart(ctxCountry, {
					type: 'bar',
					data: {
						labels: geographicData.byCountry.map((item) => item.name),
						datasets: [
							{
								label: 'Species Count',
								data: geographicData.byCountry.map((item) => item.count),
								backgroundColor: 'rgba(59, 130, 246, 0.7)',
								borderColor: 'rgba(59, 130, 246, 1)',
								borderWidth: 2
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						indexAxis: 'y',
						plugins: {
							legend: { display: false },
							title: {
								display: true,
								text: 'Top Countries by Species Count',
								font: { size: 16, weight: 'bold' }
							}
						},
						scales: {
							x: { beginAtZero: true, ticks: { precision: 0 } }
						}
					}
				});
			}

			// Municipality Chart
			const ctxMunicipality = document.getElementById('municipalityChart');
			if (ctxMunicipality && geographicData.byMunicipality.length > 0) {
				if (municipalityChart) municipalityChart.destroy();
				municipalityChart = new Chart(ctxMunicipality, {
					type: 'bar',
					data: {
						labels: geographicData.byMunicipality.map((item) => item.name),
						datasets: [
							{
								label: 'Species Count',
								data: geographicData.byMunicipality.map((item) => item.count),
								backgroundColor: 'rgba(34, 197, 94, 0.7)',
								borderColor: 'rgba(34, 197, 94, 1)',
								borderWidth: 2
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						indexAxis: 'y',
						plugins: {
							legend: { display: false },
							title: {
								display: true,
								text: 'Top Municipalities by Species Count',
								font: { size: 16, weight: 'bold' }
							}
						},
						scales: {
							x: { beginAtZero: true, ticks: { precision: 0 } }
						}
					}
				});
			}
		}, 10);
	}

	function renderUserActivityCharts() {
		console.log('renderUserActivityCharts called', { userActivityData, Chart });
		if (!userActivityData || !Chart) return;

		setTimeout(() => {
			// Timeline Chart
			const ctxTimeline = document.getElementById('timelineChart');
			console.log('Timeline chart:', {
				ctxTimeline,
				timelineLength: userActivityData.timeline?.length
			});
			if (ctxTimeline && userActivityData.timeline.length > 0) {
				if (timelineChart) timelineChart.destroy();
				timelineChart = new Chart(ctxTimeline, {
					type: 'line',
					data: {
						labels: userActivityData.timeline.map((item) => item.label),
						datasets: [
							{
								label: 'Records Created',
								data: userActivityData.timeline.map((item) => item.count),
								borderColor: 'rgba(59, 130, 246, 1)',
								backgroundColor: 'rgba(59, 130, 246, 0.1)',
								tension: 0.4,
								fill: true
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							title: {
								display: true,
								text: 'Records Created Over Time (Last 12 Months)',
								font: { size: 16, weight: 'bold' }
							}
						},
						scales: {
							y: { beginAtZero: true, ticks: { precision: 0 } }
						}
					}
				});
			}

			// Contributors Chart
			const ctxContributors = document.getElementById('contributorsChart');
			if (ctxContributors && userActivityData.topContributors.length > 0) {
				if (contributorsChart) contributorsChart.destroy();
				const top10 = userActivityData.topContributors.slice(0, 10);
				contributorsChart = new Chart(ctxContributors, {
					type: 'bar',
					data: {
						labels: top10.map((item) => item.userName),
						datasets: [
							{
								label: 'Records Created',
								data: top10.map((item) => item.recordsCreated),
								backgroundColor: 'rgba(168, 85, 247, 0.7)',
								borderColor: 'rgba(168, 85, 247, 1)',
								borderWidth: 2
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						indexAxis: 'y',
						plugins: {
							legend: { display: false },
							title: {
								display: true,
								text: 'Top 10 Contributors',
								font: { size: 16, weight: 'bold' }
							}
						},
						scales: {
							x: { beginAtZero: true, ticks: { precision: 0 } }
						}
					}
				});
			}
		}, 10);
	}

	function renderBiodiversityCharts() {
		console.log('renderBiodiversityCharts called', { biodiversityData, Chart });
		if (!biodiversityData || !Chart) return;

		setTimeout(() => {
			// Environment Chart
			const ctxEnvironment = document.getElementById('environmentChart');
			console.log('Environment chart:', {
				ctxEnvironment,
				envLength: biodiversityData.byEnvironment?.length
			});
			if (ctxEnvironment && biodiversityData.byEnvironment.length > 0) {
				if (environmentChart) environmentChart.destroy();
				environmentChart = new Chart(ctxEnvironment, {
					type: 'doughnut',
					data: {
						labels: biodiversityData.byEnvironment.map((item) => item.environment),
						datasets: [
							{
								data: biodiversityData.byEnvironment.map((item) => item.count),
								backgroundColor: [
									'rgba(59, 130, 246, 0.8)',
									'rgba(34, 197, 94, 0.8)',
									'rgba(234, 179, 8, 0.8)',
									'rgba(239, 68, 68, 0.8)',
									'rgba(168, 85, 247, 0.8)',
									'rgba(249, 115, 22, 0.8)'
								],
								borderWidth: 2
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: { position: 'right' },
							title: {
								display: true,
								text: 'Species by Environment',
								font: { size: 16, weight: 'bold' }
							}
						}
					}
				});
			}
		}, 10);
	}

	// Export functions
	async function exportToPDF() {
		alert('PDF export functionality - To be implemented with jsPDF library');
	}

	async function exportToCSV(reportType) {
		let csvContent = '';
		let filename = '';

		switch (reportType) {
			case 'threat':
				if (threatData) {
					csvContent =
						'Threat Level,Count,Percentage\n' +
						threatData
							.map((item) => `"${item.threat}",${item.count},${item.percentage}`)
							.join('\n');
					filename = 'threat-distribution.csv';
				}
				break;
			case 'geographic':
				if (geographicData) {
					csvContent =
						'Location Type,Name,Count\n' +
						geographicData.byCountry
							.map((item) => `"Country","${item.name}",${item.count}`)
							.join('\n') +
						'\n' +
						geographicData.byMunicipality
							.map((item) => `"Municipality","${item.name}",${item.count}`)
							.join('\n');
					filename = 'geographic-distribution.csv';
				}
				break;
			case 'userActivity':
				if (userActivityData) {
					csvContent =
						'User Name,Role,Records Created\n' +
						userActivityData.topContributors
							.map((item) => `"${item.userName}","${item.role}",${item.recordsCreated}`)
							.join('\n');
					filename = 'user-activity.csv';
				}
				break;
			case 'biodiversity':
				if (biodiversityData) {
					csvContent =
						'Environment,Count\n' +
						biodiversityData.byEnvironment
							.map((item) => `"${item.environment}",${item.count}`)
							.join('\n');
					filename = 'biodiversity.csv';
				}
				break;
		}

		if (csvContent) {
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = filename;
			link.click();
		}
	}

	// Cleanup charts on unmount
	onDestroy(() => {
		if (threatChart) threatChart.destroy();
		if (threatPieChart) threatPieChart.destroy();
		if (countryChart) countryChart.destroy();
		if (municipalityChart) municipalityChart.destroy();
		if (timelineChart) timelineChart.destroy();
		if (contributorsChart) contributorsChart.destroy();
		if (environmentChart) environmentChart.destroy();
		if (sizeChart) sizeChart.destroy();
	});
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">Statistical Reports</h1>
		<p class="text-gray-600">
			Comprehensive analysis of PelFish data including threat distribution, geographic statistics,
			user activity, and biodiversity metrics.
		</p>
	</div>

	<!-- Tabs -->
	<div class="bg-white rounded-lg shadow-lg mb-8">
		<div class="border-b border-gray-200">
			<nav class="flex -mb-px">
				<button
					class="px-6 py-4 text-sm font-medium border-b-2 transition-colors {activeTab === 'threat'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					on:click={() => (activeTab = 'threat')}
				>
					Threat Distribution
				</button>
				<button
					class="px-6 py-4 text-sm font-medium border-b-2 transition-colors {activeTab ===
					'geographic'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					on:click={() => (activeTab = 'geographic')}
				>
					Geographic Stats
				</button>
				<button
					class="px-6 py-4 text-sm font-medium border-b-2 transition-colors {activeTab ===
					'userActivity'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					on:click={() => (activeTab = 'userActivity')}
				>
					User Activity
				</button>
				<button
					class="px-6 py-4 text-sm font-medium border-b-2 transition-colors {activeTab ===
					'biodiversity'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					on:click={() => (activeTab = 'biodiversity')}
				>
					Biodiversity Overview
				</button>
			</nav>
		</div>

		<!-- Tab Content -->
		<div class="p-6">
			<!-- Threat Distribution Tab -->
			{#if activeTab === 'threat'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<h2 class="text-2xl font-bold text-gray-800">Threat Level Distribution</h2>
						<button
							on:click={() => exportToCSV('threat')}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Export to CSV
						</button>
					</div>

					{#if loading.threat}
						<div class="text-center py-12">
							<div
								class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
							/>
							<p class="mt-4 text-gray-600">Loading threat distribution data...</p>
						</div>
					{:else if threatData}
						<!-- Summary Cards -->
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<div class="bg-blue-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-blue-900 mb-1">Total Species</h3>
								<p class="text-3xl font-bold text-blue-600">
									{threatData.reduce((sum, item) => sum + item.count, 0)}
								</p>
							</div>
							<div class="bg-green-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-green-900 mb-1">Harmless Species</h3>
								<p class="text-3xl font-bold text-green-600">
									{threatData.find((item) => item.threat === 'Harmless')?.count || 0}
								</p>
							</div>
							<div class="bg-red-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-red-900 mb-1">Dangerous Species</h3>
								<p class="text-3xl font-bold text-red-600">
									{threatData
										.filter(
											(item) => item.threat.includes('Dangerous') || item.threat === 'Unpredictable'
										)
										.reduce((sum, item) => sum + item.count, 0)}
								</p>
							</div>
						</div>

						<!-- Charts -->
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div class="bg-white border rounded-lg p-4">
								<div style="height: 400px;">
									<canvas id="threatBarChart" />
								</div>
							</div>
							<div class="bg-white border rounded-lg p-4">
								<div style="height: 400px;">
									<canvas id="threatPieChart" />
								</div>
							</div>
						</div>

						<!-- Data Table -->
						<div class="bg-white border rounded-lg overflow-hidden mt-6">
							<table class="w-full">
								<thead class="bg-gray-50">
									<tr>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Threat Level
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Count
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Percentage
										</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200">
									{#each threatData as item}
										<tr class="hover:bg-gray-50">
											<td class="px-6 py-4 whitespace-nowrap">
												<span
													class="px-3 py-1 inline-flex text-sm font-semibold rounded-full
													{item.threat === 'Harmless'
														? 'bg-green-100 text-green-800'
														: item.threat === 'Potentially Harmless'
														? 'bg-blue-100 text-blue-800'
														: item.threat === 'Dangerous if Provoked'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-red-100 text-red-800'}"
												>
													{item.threat}
												</span>
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{item.count}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{item.percentage}%
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Geographic Stats Tab -->
			{#if activeTab === 'geographic'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<h2 class="text-2xl font-bold text-gray-800">Geographic Distribution</h2>
						<button
							on:click={() => exportToCSV('geographic')}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Export to CSV
						</button>
					</div>

					{#if loading.geographic}
						<div class="text-center py-12">
							<div
								class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
							/>
							<p class="mt-4 text-gray-600">Loading geographic data...</p>
						</div>
					{:else if geographicData}
						<!-- Location Map -->
						<div class="bg-white border rounded-lg p-4 mb-6">
							<h3 class="text-lg font-semibold text-gray-800 mb-4">Species Location Map</h3>
							<div style="height: 500px;">
								{#if browser && LeafletMap}
									<svelte:component this={LeafletMap} options={mapOptions}>
										<svelte:component this={TileLayer} url={tileUrl} options={tileLayerOptions} />
										{#each markerPositions as marker}
											<svelte:component
												this={Marker}
												latLng={marker.latitude && marker.longitude
													? [marker.latitude, marker.longitude]
													: marker.markers?.[0] || [0, 0]}
											>
												<svelte:component this={Popup}>
													<div class="p-2">
														<p class="font-semibold">{marker.name}</p>
														{#if marker.threat}
															<p class="text-sm text-gray-600">Threat: {marker.threat}</p>
														{/if}
													</div>
												</svelte:component>
											</svelte:component>
										{/each}
									</svelte:component>
								{:else}
									<div class="flex items-center justify-center h-full">
										<p class="text-gray-500">Loading map...</p>
									</div>
								{/if}
							</div>
						</div>

						<!-- Charts -->
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{#if geographicData.byCountry.length > 0}
								<div class="bg-white border rounded-lg p-4">
									<div style="height: 400px;">
										<canvas id="countryChart" />
									</div>
								</div>
							{/if}
							{#if geographicData.byMunicipality.length > 0}
								<div class="bg-white border rounded-lg p-4">
									<div style="height: 400px;">
										<canvas id="municipalityChart" />
									</div>
								</div>
							{/if}
						</div>

						<!-- Barangay List -->
						{#if geographicData.byBarangay.length > 0}
							<div class="bg-white border rounded-lg overflow-hidden mt-6">
								<div class="px-6 py-4 bg-gray-50">
									<h3 class="text-lg font-semibold text-gray-800">Top Barangays</h3>
								</div>
								<table class="w-full">
									<thead class="bg-gray-50">
										<tr>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Barangay
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Species Count
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200">
										{#each geographicData.byBarangay as item}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{item.name}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{item.count}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					{/if}
				</div>
			{/if}

			<!-- User Activity Tab -->
			{#if activeTab === 'userActivity'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<h2 class="text-2xl font-bold text-gray-800">User Activity Analytics</h2>
						<button
							on:click={() => exportToCSV('userActivity')}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Export to CSV
						</button>
					</div>

					{#if loading.userActivity}
						<div class="text-center py-12">
							<div
								class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
							/>
							<p class="mt-4 text-gray-600">Loading user activity data...</p>
						</div>
					{:else if userActivityData}
						<!-- Charts -->
						<div class="grid grid-cols-1 gap-6">
							{#if userActivityData.timeline.length > 0}
								<div class="bg-white border rounded-lg p-4">
									<div style="height: 300px;">
										<canvas id="timelineChart" />
									</div>
								</div>
							{/if}
							{#if userActivityData.topContributors.length > 0}
								<div class="bg-white border rounded-lg p-4">
									<div style="height: 400px;">
										<canvas id="contributorsChart" />
									</div>
								</div>
							{/if}
						</div>

						<!-- Top Contributors Table -->
						{#if userActivityData.topContributors.length > 0}
							<div class="bg-white border rounded-lg overflow-hidden mt-6">
								<div class="px-6 py-4 bg-gray-50">
									<h3 class="text-lg font-semibold text-gray-800">Top Contributors</h3>
								</div>
								<table class="w-full">
									<thead class="bg-gray-50">
										<tr>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Rank
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												User Name
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Role
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Records Created
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200">
										{#each userActivityData.topContributors as item, index}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{index + 1}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{item.userName}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													<span
														class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
													>
														{item.role}
													</span>
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{item.recordsCreated}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}

						<!-- Contributions by Role -->
						{#if userActivityData.byRole.length > 0}
							<div class="bg-white border rounded-lg overflow-hidden mt-6">
								<div class="px-6 py-4 bg-gray-50">
									<h3 class="text-lg font-semibold text-gray-800">Contributions by Role</h3>
								</div>
								<table class="w-full">
									<thead class="bg-gray-50">
										<tr>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Role
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Total Records
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200">
										{#each userActivityData.byRole as item}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{item.role}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{item.count}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					{/if}
				</div>
			{/if}

			<!-- Biodiversity Overview Tab -->
			{#if activeTab === 'biodiversity'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<h2 class="text-2xl font-bold text-gray-800">Biodiversity Overview</h2>
						<button
							on:click={() => exportToCSV('biodiversity')}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Export to CSV
						</button>
					</div>

					{#if loading.biodiversity}
						<div class="text-center py-12">
							<div
								class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
							/>
							<p class="mt-4 text-gray-600">Loading biodiversity data...</p>
						</div>
					{:else if biodiversityData}
						<!-- Summary Cards -->
						<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
							<div class="bg-blue-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-blue-900 mb-1">Total Species</h3>
								<p class="text-3xl font-bold text-blue-600">{biodiversityData.totalSpecies}</p>
							</div>
							<div class="bg-green-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-green-900 mb-1">Avg Max Size (cm)</h3>
								<p class="text-3xl font-bold text-green-600">
									{biodiversityData.sizeMaturityStats.avgMaxSize?.toFixed(1) || 'N/A'}
								</p>
							</div>
							<div class="bg-purple-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-purple-900 mb-1">Max Size (cm)</h3>
								<p class="text-3xl font-bold text-purple-600">
									{biodiversityData.sizeMaturityStats.maxMaxSize || 'N/A'}
								</p>
							</div>
							<div class="bg-orange-50 rounded-lg p-4">
								<h3 class="text-sm font-medium text-orange-900 mb-1">Avg Maturity (years)</h3>
								<p class="text-3xl font-bold text-orange-600">
									{biodiversityData.sizeMaturityStats.avgMaturity?.toFixed(1) || 'N/A'}
								</p>
							</div>
						</div>

						<!-- Environment Chart -->
						{#if biodiversityData.byEnvironment.length > 0}
							<div class="bg-white border rounded-lg p-4">
								<div style="height: 400px;">
									<canvas id="environmentChart" />
								</div>
							</div>
						{/if}

						<!-- Threat Summary -->
						<div class="bg-white border rounded-lg overflow-hidden mt-6">
							<div class="px-6 py-4 bg-gray-50">
								<h3 class="text-lg font-semibold text-gray-800">Threat Level Summary</h3>
							</div>
							<div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
								<div class="text-center">
									<p class="text-sm text-gray-600">Harmless</p>
									<p class="text-2xl font-bold text-green-600">
										{biodiversityData.threatSummary.harmless}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-600">Potentially Harmless</p>
									<p class="text-2xl font-bold text-blue-600">
										{biodiversityData.threatSummary.potentiallyHarmless}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-600">Dangerous if Provoked</p>
									<p class="text-2xl font-bold text-yellow-600">
										{biodiversityData.threatSummary.dangerousIfProvoked}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-600">Unpredictable</p>
									<p class="text-2xl font-bold text-orange-600">
										{biodiversityData.threatSummary.unpredictable}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-600">Frequently Dangerous</p>
									<p class="text-2xl font-bold text-red-600">
										{biodiversityData.threatSummary.frequentlyDangerous}
									</p>
								</div>
								<div class="text-center">
									<p class="text-sm text-gray-600">Extremely Dangerous</p>
									<p class="text-2xl font-bold text-red-800">
										{biodiversityData.threatSummary.extremelyDangerous}
									</p>
								</div>
							</div>
						</div>

						<!-- Top Economic Uses -->
						{#if biodiversityData.usesDistribution.length > 0}
							<div class="bg-white border rounded-lg overflow-hidden mt-6">
								<div class="px-6 py-4 bg-gray-50">
									<h3 class="text-lg font-semibold text-gray-800">Top Economic Uses</h3>
								</div>
								<table class="w-full">
									<thead class="bg-gray-50">
										<tr>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Use
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Species Count
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200">
										{#each biodiversityData.usesDistribution as item}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 text-sm text-gray-900">{item.use}</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{item.count}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}

						<!-- Diversity by Location -->
						{#if biodiversityData.diversityByLocation.length > 0}
							<div class="bg-white border rounded-lg overflow-hidden mt-6">
								<div class="px-6 py-4 bg-gray-50">
									<h3 class="text-lg font-semibold text-gray-800">Species Diversity by Location</h3>
								</div>
								<table class="w-full">
									<thead class="bg-gray-50">
										<tr>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Location
											</th>
											<th
												class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Species Count
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200">
										{#each biodiversityData.diversityByLocation as item}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{item.location}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{item.speciesCount}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
