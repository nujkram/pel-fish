import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({
	request,
	locals
}: {
	request: Request;
	locals: any;
}): Promise<Response> => {
	try {
		const { _id } = await request.json();
		const db = await clientPromise();
		const Records = db.collection('records');

		const result = await Records.deleteOne({ _id });

		if (result.deletedCount === 1) {
			return new Response(
				JSON.stringify({
					status: 'Success',
					message: 'Record successfully deleted'
				})
			);
		}
	} catch (error) {
		console.error('Error deleting record:', error);
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: 'Failed to delete record'
			}),
			{ status: 500 }
		);
	}
};
