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

		// Aggregate threat level distribution
		const threatDistribution = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true }
				},
				{
					$group: {
						_id: '$threat',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				}
			])
			.toArray();

		// Calculate total for percentages
		const total = threatDistribution.reduce((sum, item) => sum + item.count, 0);

		// Format the data
		const formattedData = threatDistribution.map((item) => ({
			threat: item._id || 'Unknown',
			count: item.count,
			percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : '0.00'
		}));

		return json({
			success: true,
			data: formattedData,
			total
		});
	} catch (error) {
		console.error('Error fetching threat distribution:', error);
		return json({ error: 'Failed to fetch threat distribution' }, { status: 500 });
	}
};
