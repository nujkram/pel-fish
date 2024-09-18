import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, locals }: any) {
	const db = await clientPromise();
	const Records = db.collection('records');

	const response = await Records.find({}).sort({ created: -1 }).project({ image: 0 }).toArray();

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
}
