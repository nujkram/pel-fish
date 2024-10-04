import clientPromise from '$lib/server/mongo';
import { redirect } from '@sveltejs/kit';
export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, locals }) => {
	if(!locals.user) {
        throw redirect(302, '/auth/login');
    }

	const { recordId } = params;
	const db = await clientPromise();
	const Record = db.collection('records');

	const [record] = await Record.find({ _id: recordId }).toArray();

	return { recordId, record };
};
