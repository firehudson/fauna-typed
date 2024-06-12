<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';

	let group = $state('user');
	let { children } = $props();

	function handleTabClick(tabName: string) {
		goto(`${tabName}`);
	}
</script>

<Tabs>
	{#snippet list()}
		<Tabs.Control bind:group name="user" onclick={() => handleTabClick('user')}>User</Tabs.Control>
		<Tabs.Control bind:group name="account" onclick={() => handleTabClick('account')}
			>Account</Tabs.Control
		>
	{/snippet}
</Tabs>
{@render children()}
