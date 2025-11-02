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
		const usersCollection = db.collection('users');

		// Get records created per user
		const recordsByUser = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, createdBy: { $exists: true } }
				},
				{
					$group: {
						_id: '$createdBy',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				}
			])
			.toArray();

		// Get user details and combine with counts
		const userIds = recordsByUser.map((item) => item._id);
		const users = await usersCollection
			.find(
				{ _id: { $in: userIds } },
				{
					projection: {
						_id: 1,
						'profile.displayName': 1,
						'profile.firstName': 1,
						'profile.lastName': 1,
						role: 1
					}
				}
			)
			.toArray();

		const userMap = new Map(users.map((u) => [u._id, u]));

		const topContributors = recordsByUser.map((item) => {
			const user = userMap.get(item._id);
			return {
				userId: item._id,
				userName:
					user?.profile?.displayName ||
					`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() ||
					'Unknown User',
				role: user?.role || 'unknown',
				recordsCreated: item.count
			};
		});

		// Get records created over time (by month for last 12 months)
		const twelveMonthsAgo = new Date();
		twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

		const recordsOverTime = await recordsCollection
			.aggregate([
				{
					$match: {
						isActive: true,
						created: { $exists: true, $gte: twelveMonthsAgo }
					}
				},
				{
					$group: {
						_id: {
							year: { $year: '$created' },
							month: { $month: '$created' }
						},
						count: { $sum: 1 }
					}
				},
				{
					$sort: { '_id.year': 1, '_id.month': 1 }
				}
			])
			.toArray();

		const timeline = recordsOverTime.map((item) => ({
			year: item._id.year,
			month: item._id.month,
			count: item.count,
			label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
		}));

		// Get contributions by role
		const roleContributions = await recordsCollection
			.aggregate([
				{
					$match: { isActive: true, createdBy: { $exists: true } }
				},
				{
					$lookup: {
						from: 'users',
						localField: 'createdBy',
						foreignField: '_id',
						as: 'userInfo'
					}
				},
				{
					$unwind: '$userInfo'
				},
				{
					$group: {
						_id: '$userInfo.role',
						count: { $sum: 1 }
					}
				},
				{
					$sort: { count: -1 }
				}
			])
			.toArray();

		const byRole = roleContributions.map((item) => ({
			role: item._id || 'Unknown',
			count: item.count
		}));

		return json({
			success: true,
			data: {
				topContributors,
				timeline,
				byRole
			}
		});
	} catch (error) {
		console.error('Error fetching user activity:', error);
		return json({ error: 'Failed to fetch user activity statistics' }, { status: 500 });
	}
};
