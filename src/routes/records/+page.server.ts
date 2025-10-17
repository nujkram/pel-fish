export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals, fetch }) => {
	// Allow both authenticated and guest users to view records
	const response = await fetch('/api/admin/record');
	const result = await response.json();

	return {
		records: result.response || [],
		user: locals.user || null
	};
};
