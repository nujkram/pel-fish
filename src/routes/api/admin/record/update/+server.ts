import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	const data = await request.json();
	const db = await clientPromise();
	const Record = db.collection('records');

	const recordUpdate = {
		$set: {
			updatedAt: new Date(),
			updatedBy: locals.user._id,
			name: data.name,
			description: data.description,
			image: data.image
		}
	};

	const response = await Record.updateOne({ _id: data._id }, recordUpdate);
	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Fish successfully added',
				response
			})
		);
	}
}
