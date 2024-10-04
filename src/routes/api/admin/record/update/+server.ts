import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: { request: Request; locals: any }) => {
	const data = await request.json();
	const db = await clientPromise();
	const Record = db.collection('records');

	const recordUpdate = {
		$set: {
			updatedAt: new Date(),
			updatedBy: locals.user._id,
			scientific_name: data.scientific_name,
			name: data.name,
			local_name: data.local_name,
			environment: data.environment,
			distribution: data.distribution,
			maturity: data.maturity,
			max: data.max,
			description: data.description,
			biology: data.biology,
			life: data.life,
			reference: data.reference,
			country: data.country,
			municipality: data.municipality,
			barangay: data.barangay,
			threat: data.threat,
			uses: data.uses,
			latitude: data.latitude,
			longitude: data.longitude,
			image: data.image
		}
	};

	const response = await Record.updateOne({ _id: data._id }, recordUpdate);
	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Record successfully updated',
				response
			})
		);
	}

	return new Response(
		JSON.stringify({
			status: 'Error',
			message: 'Failed to update record'
		}),
		{ status: 500 }
	);
};
