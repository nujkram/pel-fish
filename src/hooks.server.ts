import clientPromise from '$lib/server/mongo';
import { dev } from '$app/environment';

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	// Handle CORS preflight requests
	if (event.request.method === 'OPTIONS' && event.url.pathname.startsWith('/api/')) {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': dev ? '*' : 'https://pel-fish.vercel.app',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Max-Age': '86400'
			}
		});
	}

	const session = event.cookies.get('meteor_login_token');

	if (!session) {
		event.locals.user = null;
		return await resolve(event);
	}

	const db = await clientPromise();
	const Users = db.collection('users');
	const user = await Users.findOne({ 'services.resume.loginTokens.hashedToken': session });

	if (user) {
		event.locals.user = {
			_id: user._id,
			name: user?.profile?.displayName || user?.emails?.[0]?.address,
			email: user?.emails?.[0]?.address,
			profile: user?.profile
		};
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);

	// Add CORS headers for API routes
	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('Access-Control-Allow-Origin', dev ? '*' : 'https://pel-fish.vercel.app');
		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	}

	return response;
};

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }: { error: any }) {
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event });
	console.error('⚡️ Dev. Unhandled Error', error);
	console.error('#############################################');
	// console.error({ event });

	if (dev) {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	} else {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	}
}
