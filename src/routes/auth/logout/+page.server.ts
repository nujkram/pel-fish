import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	// eat the cookie
	cookies.set('meteor_login_token', '', {
		path: '/',
		httpOnly: true,
		maxAge: 0,
		expires: new Date(0)
	});

	// clear the session
	locals.user = null;

	// redirect to login page
	throw redirect(303, '/auth/login');
};
