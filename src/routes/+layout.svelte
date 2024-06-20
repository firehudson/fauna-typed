<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { initStore } from '$lib/stores/index.svelte';
	import { createCollectionStore } from '$lib/stores/store-collection.svelte';

	onMount(async () => {
		await createCollectionStore().fetchCollections();

		initStore();
	});
</script>

<slot></slot>

<style></style>
