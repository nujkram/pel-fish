import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const db = await clientPromise();
		const recordsCollection = db.collection('records');

		// Get species count by country
		const byCountry = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, country: { $exists: true, $ne: '' } }
				},
				{
					$group: {
						_id: '$country',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				},
				{
					$limit: 10
				}
			])
			.toArray();

		// Get species count by municipality
		const byMunicipality = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, municipality: { $exists: true, $ne: '' } }
				},
				{
					$group: {
						_id: '$municipality',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				},
				{
					$limit: 10
				}
			])
			.toArray();

		// Get species count by barangay
		const byBarangay = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, barangay: { $exists: true, $ne: '' } }
				},
				{
					$group: {
						_id: '$barangay',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				},
				{
					$limit: 10
				}
			])
			.toArray();

		// Get all location markers for heatmap
		const locationData = await recordsCollection
			.find(
				{
					isActive: true,
					latitude: { $exists: true, $ne: null },
					longitude: { $exists: true, $ne: null }
				},
				{
					projection: {
						_id: 1,
						name: 1,
						latitude: 1,
						longitude: 1,
						markers: 1,
						threat: 1
					}
				}
			)
			.toArray();

		return json({
			success: true,
			data: {
				byCountry: byCountry.map((item) => ({ name: item._id, count: item.count })),
				byMunicipality: byMunicipality.map((item) => ({ name: item._id, count: item.count })),
				byBarangay: byBarangay.map((item) => ({ name: item._id, count: item.count })),
				locationData
			}
		});
	} catch (error) {
		console.error('Error fetching geographic stats:', error);
		return json({ error: 'Failed to fetch geographic statistics' }, { status: 500 });
	}
};
