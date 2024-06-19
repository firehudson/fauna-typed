<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { initStore } from '$lib/stores';

	onMount(() => {
		initStore();
	});
</script>

<slot></slot>

<style></style>
