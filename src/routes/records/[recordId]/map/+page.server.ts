export const ssr = false;
import { redirect } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

export const load = async ({ locals, params }: { locals: any, params: { recordId: string } }) => {
	if(!locals.user) {
        throw redirect(302, '/auth/login');
    }

    const {recordId} = params;
	const db = await clientPromise();
	const Records = db.collection('records');

	const [response] = await Records.find({ _id: recordId }).sort({ created: -1 }).project({ markers: 1, name: 1 }).toArray();

    return {markers: response.markers, name: response.name};
};
