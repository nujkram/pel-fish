import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { id } from '$lib/common/utils';

type ImportedRecord = {
	scientific_name: string;
	name: string;
	local_name: string;
	image: string;
	environment: string;
	distribution: string;
	description: string;
	biology: string;
	life: string;
	reference: string;
	country: string;
	municipality: string;
	barangay: string;
	threat: string;
	uses: string;
	markers: [number, number][];
	latitude: number;
	longitude: number;
};

export const POST = async ({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}): Promise<Response> => {
	const records: ImportedRecord[] = await request.json();
	const db = await clientPromise();
	const Record = db.collection('records');

	const preparedRecords = records.map((record) => ({
		...record,
		_id: id(),
		created: new Date(),
		createdBy: locals.user._id,
		createdAt: new Date(),
		isActive: true
	}));

	try {
		const result = await Record.insertMany(preparedRecords);
		return json({
			status: 'Success',
			message: `${result.insertedCount} records successfully added`,
			insertedIds: result.insertedIds
		});
	} catch (error) {
		console.error('Error inserting records:', error);
		return json({ status: 'Error', message: 'Failed to insert records' }, { status: 500 });
	}
};
