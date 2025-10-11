import clientPromise from '$lib/server/mongo';
import { ObjectId } from 'mongodb';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	try {
		const { recordId } = params;
		console.log('Received recordId:', recordId);

		if (!recordId) {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'Record ID is required'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}

		const db = await clientPromise();
		const Records = db.collection('records');

		console.log('Searching for record with _id:', recordId);

		// Find the specific record including the image
		const response = await Records.findOne({ _id: recordId });

		console.log('Found record:', response ? 'YES' : 'NO');
		if (response) {
			console.log('Record _id:', response._id);
		}

		if (!response) {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'Record not found'
				}),
				{
					status: 404,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}

		return new Response(
			JSON.stringify({
				status: 'Success',
				response
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
				message: 'Failed to fetch record'
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