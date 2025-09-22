import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api/external': {
				target: 'https://pel-fish.vercel.app',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/external/, '/api')
			}
		}
	}
});
