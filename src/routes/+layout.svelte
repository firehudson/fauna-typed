<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { initStore } from '$lib/stores/index.svelte';

	onMount(() => {
		initStore();
	});
</script>

<slot></slot>

<style></style>
