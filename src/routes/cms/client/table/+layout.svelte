<script lang="ts">
	import { page } from '$app/stores';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';
	import { Collections } from '$lib/stores/index.svelte';

	let group = $state($page.params.collection);
	let { children } = $props();

	function handleTabClick(tabName: string) {
		goto(`/cms/client/table/${tabName.toLowerCase()}`);
	}
</script>

<Tabs>
	{#snippet list()}
		{#each Object.keys(Collections.stores || {}) as collection (collection)}
			<Tabs.Control bind:group name={collection} onchange={() => handleTabClick(collection)}
				>{collection}</Tabs.Control
			>
		{/each}
	{/snippet}
</Tabs>
{@render children()}
