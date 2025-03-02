export const ssr = false;
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, fetch }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const response = await fetch('/api/admin/record');
	const result = await response.json();

	return {
		records: result.response
	};
};
