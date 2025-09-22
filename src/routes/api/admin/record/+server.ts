import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const db = await clientPromise();
		const Records = db.collection('records');

		// Check if images should be included (default: false for performance)
		const includeImages = url.searchParams.get('includeImages') === 'true';

		// Project out image field by default for better performance
		const projection = includeImages ? {} : { image: 0 };

		const response = await Records.find({}).sort({ created: -1 }).project(projection).toArray();

		return new Response(
			JSON.stringify({
				status: 'Success',
				response: response || [],
				includesImages: includeImages
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error('API Error:', error);
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: 'Failed to fetch records'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
}
