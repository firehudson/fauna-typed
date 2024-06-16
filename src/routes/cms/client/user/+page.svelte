<script lang="ts">
	import { createUserStore } from '$lib/stores/store-document.svelte';
	import type { User } from '$lib/types/user';
	import { X } from 'lucide-svelte';
	// import type { PageData } from './$types';

	let filter = $state({
		firstName: '',
		lastName: ''
	});

	const User = createUserStore().initS;
	// let usersPage = $state(User.all());

	let usersPageFiltered = $derived(
		User.where(
			(u) => u.firstName.includes(filter.firstName) && u.lastName.includes(filter.lastName)
		)
	);

	const u_user: User = $state({
		firstName: '',
		lastName: ''
	});

	function createUser() {
		User.create(u_user);
		u_user.firstName = '';
		u_user.lastName = '';
	}

	function on_key_down(e: KeyboardEvent) {
		console.log('key down', e.key);
		if (e.key === 'Enter') {
			createUser();
		}
	}

	// export let data: PageData;
</script>

<div class="flex flex-col flex-wrap content-center gap-10 p-4">
	<div class="w-192 flex flex-col gap-10">
		<div class="flex max-w-96 flex-col gap-3">
			<div class="flex gap-3">
				<label class="label">
					First Name
					<input
						class="input"
						name="firstName"
						type="text"
						bind:value={u_user.firstName}
						onkeydown={on_key_down}
					/>
				</label>
				<label class="label">
					Last Name
					<input
						class="input"
						name="lastName"
						type="text"
						bind:value={u_user.lastName}
						onkeydown={on_key_down}
					/>
				</label>
			</div>
			<button
				class="variant-filled-primary btn max-w-48"
				onclick={() => createUser()}
				onkeydown={on_key_down}>Create User</button
			>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="h2">Users</h2>
			<!-- {#each data.user as user} -->
			<div class="table-container space-y-4">
				<table class="table-hover table-compact table w-full table-auto">
					<thead>
						<tr>
							<th class="flex flex-col"
								>First Name<input
									class="input"
									type="text"
									name="searchFirstName"
									bind:value={filter.firstName}
								/></th
							>
							<th
								>Last Name<input
									class="input"
									type="text"
									name="searchLastName"
									bind:value={filter.lastName}
								/></th
							>
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each usersPageFiltered.data as user}
							<tr>
								<td>
									<input
										class="input"
										type="text"
										bind:value={user.firstName}
										name="firstName"
									/></td
								>
								<td>
									<input class="input" type="text" bind:value={user.lastName} name="lastName" /></td
								>
								<td>
									<button
										class="variant-filled-primary btn"
										onclick={() =>
											user.update({ firstName: user.firstName, lastName: user.lastName })}
										>Update</button
									>
								</td>
								<td>
									<button class="variant-ghost-error btn-icon" onclick={() => user.delete()}>
										<X />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
