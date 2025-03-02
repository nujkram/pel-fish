<script lang="ts">
	const currentYear: number = new Date().getFullYear();
</script>

<footer class="bg-gray-800 text-white py-4">
	<div class="container mx-auto px-4">
		<div class="flex flex-col md:flex-row justify-between items-center">
			<div class="mb-2 md:mb-0">
				<p>&copy; {currentYear} All rights reserved.</p>
			</div>
			<div>
				<a href="/policy" class="hover:text-gray-300">Privacy Policy</a>
			</div>
		</div>
	</div>
</footer>
