import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({
	request,
	locals
}: {
	request: Request;
	locals: any;
}): Promise<Response> => {
	const data = await request.json();
	const db = await clientPromise();
	const Record = db.collection('records');

	const recordUpdate = {
		$set: {
			updatedAt: new Date(),
			updatedBy: locals.user._id,
			markers: data.markers
		}
	};

	try {
		const response = await Record.updateOne({ _id: data._id }, recordUpdate);
		if (response.modifiedCount > 0) {
			return new Response(
				JSON.stringify({
					status: 'Success',
					message: 'Markers successfully updated',
					response
				})
			);
		} else {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'No record was updated',
					response
				}),
				{ status: 404 }
			);
		}
	} catch (error) {
		console.error('Error updating markers:', error);
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: 'An error occurred while updating markers',
				error: error.message
			}),
			{ status: 500 }
		);
	}
};
