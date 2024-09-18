export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params, url, parent }) {
	await parent();
	if (!locals?.user) {
		return;
	}

	const { user } = locals;

	return {
		user
	};
}
