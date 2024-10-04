import clientPromise from '$lib/server/mongo';
import { redirect } from '@sveltejs/kit';
export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if(!locals.user) {
        throw redirect(302, '/auth/login');
    }

	const db = await clientPromise();
	const Setting = db.collection('settings');

	const settings = await Setting.findOne({});

	const { user } = locals;

	return {
		user,
		settings
	};
}
