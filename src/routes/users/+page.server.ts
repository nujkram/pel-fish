export const ssr = false;
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const { user } = locals;

	return {
		user
	};
}
