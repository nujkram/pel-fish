import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params, locals }: any) {
	const {recordId} = params;
	const db = await clientPromise();
	const Records = db.collection('records');

	const [response] = await Records.find({ _id: recordId }).sort({ created: -1 }).project({ markers: 1 }).toArray();

    if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
}
