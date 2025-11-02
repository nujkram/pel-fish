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

		// Total unique species
		const totalSpecies = await recordsCollection.countDocuments({ isActive: true });

		// Species by environment
		const byEnvironment = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, environment: { $exists: true, $ne: '' } }
				},
				{
					$group: {
						_id: '$environment',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				}
			])
			.toArray();

		// Threat level summary
		const threatSummary = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true }
				},
				{
					$group: {
						_id: null,
						harmless: {
							$sum: {
								$cond: [{ $eq: ['$threat', 'Harmless'] }, 1, 0]
							}
						},
						potentiallyHarmless: {
							$sum: {
								$cond: [{ $eq: ['$threat', 'Potentially Harmless'] }, 1, 0]
							}
						},
						dangerousIfProvoked: {
							$sum: {
								$cond: [{ $eq: ['$threat', 'Dangerous if Provoked'] }, 1, 0]
							}
						},
						unpredictable: {
							$sum: {
								$cond: [{ $eq: ['$threat', 'Unpredictable'] }, 1, 0]
							}
						},
						frequentlyDangerous: {
							$sum: {
								$cond: [{ $eq: ['$threat', 'Frequently Dangerous'] }, 1, 0]
							}
						},
						extremelyDangerous: {
							$sum: {
								$cond: [{ $eq: ['$threat', 'Extremely Dangerous'] }, 1, 0]
							}
						}
					}
				}
			])
			.toArray();

		// Species diversity by location (top 10 locations)
		const diversityByLocation = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, municipality: { $exists: true, $ne: '' } }
				},
				{
					$group: {
						_id: '$municipality',
						speciesCount: { $sum: 1 },
						species: { $push: '$name' }
					}
				},
				{
					$project: {
						_id: 1,
						speciesCount: 1,
						uniqueSpecies: { $size: '$species' }
					}
				},
				{
					$sort: { speciesCount: -1 }
				},
				{
					$limit: 10
				}
			])
			.toArray();

		// Size and maturity statistics
		const sizeMaturityStats = await recordsCollection
			.aggregate([
				{
					$match: {
						isActive: true,
						max: { $exists: true, $ne: null, $gt: 0 }
					}
				},
				{
					$group: {
						_id: null,
						avgMaxSize: { $avg: '$max' },
						minMaxSize: { $min: '$max' },
						maxMaxSize: { $max: '$max' },
						avgMaturity: { $avg: '$maturity' }
					}
				}
			])
			.toArray();

		// Economic uses distribution
		const usesDistribution = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, uses: { $exists: true, $ne: '' } }
				},
				{
					$group: {
						_id: '$uses',
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

		return json({
			success: true,
			data: {
				totalSpecies,
				byEnvironment: byEnvironment.map((item) => ({
					environment: item._id,
					count: item.count
				})),
				threatSummary: threatSummary[0] || {
					harmless: 0,
					potentiallyHarmless: 0,
					dangerousIfProvoked: 0,
					unpredictable: 0,
					frequentlyDangerous: 0,
					extremelyDangerous: 0
				},
				diversityByLocation: diversityByLocation.map((item) => ({
					location: item._id,
					speciesCount: item.speciesCount
				})),
				sizeMaturityStats: sizeMaturityStats[0] || {
					avgMaxSize: 0,
					minMaxSize: 0,
					maxMaxSize: 0,
					avgMaturity: 0
				},
				usesDistribution: usesDistribution.map((item) => ({
					use: item._id,
					count: item.count
				}))
			}
		});
	} catch (error) {
		console.error('Error fetching biodiversity stats:', error);
		return json({ error: 'Failed to fetch biodiversity statistics' }, { status: 500 });
	}
};
