export const ssr = false;
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: { params: { id: string } }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}
};
