<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex flex-col flex-wrap content-center gap-10">
	<form method="POST" action="?/create" class="flex max-w-48 flex-col gap-3">
		<label class="label">
			Name
			<input class="input" name="name" type="text" />
		</label>
		<button class="variant-filled-primary btn">Create User</button>
	</form>

	<div class="flex flex-col gap-3">
		Users
		{#each data.users as user}
			<form method="POST" action="?/update" class="flex flex-row gap-2">
				<input class="input" type="text" value={user.firstName} name="name" />
				<input type="text" value={user.id} name="id" hidden />
				<button class="variant-filled-primary btn">Update</button>
			</form>
		{/each}
	</div>
</div>
