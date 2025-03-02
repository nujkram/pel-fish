import clientPromise from '$lib/server/mongo';

export const load = async ({ params }) => {
	const { recordId } = params;
	const db = await clientPromise();
	const Record = db.collection('records');

	const [record] = await Record.find({ _id: recordId }).toArray();

	return { record };
};
