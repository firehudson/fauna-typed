<script lang="ts">
	import { page } from '$app/stores';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';
	import { CollectionStore } from '$lib/stores/index.svelte';

	let group = $state($page.params.collection);
	let { children } = $props();

	function handleTabClick(tabName: string) {
		goto(`/cms/client/table/${tabName.toLowerCase()}`);
	}
</script>

<Tabs>
	{#snippet list()}
		{#each CollectionStore.all()?.data as collection (collection.name)}
			<Tabs.Control
				bind:group
				name={collection.name}
				onchange={() => handleTabClick(collection.name)}>{collection.name}</Tabs.Control
			>
		{/each}
	{/snippet}
</Tabs>
{@render children()}
