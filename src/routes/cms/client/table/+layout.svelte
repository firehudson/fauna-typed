<script lang="ts">
	let { children } = $props();
</script>

<!-- <TabGroup>
	<Tab bind:group={tabSet} name="tab1" value={0} on:click={() => handleTabClick(0)}>
		<span>User</span>
	</Tab>
	<Tab bind:group={tabSet} name="tab2" value={1} on:click={() => handleTabClick(0)}>Account</Tab>
</TabGroup> -->
{@render children()}
