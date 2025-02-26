<script lang="ts">
	import { User, asc, desc } from '$lib/stores';
	import { User as UserClass, type UserProperties } from '$lib/types/user';
	import { X } from 'lucide-svelte';
	import { tick } from 'svelte';
	import Sort from './sort.svelte';
	import type { Ordering } from '$lib/stores/_shared/order';
	import type { Sorter } from './sort';
	import { page } from '$app/stores';

	let collectionName = $derived($page.params.collection);

	// To get the keys from User
	const user = new UserClass({
		id: '',
		ttl: new Date(),
		firstName: '',
		lastName: '',
		account: ''
	});
	const allKeys = Object.keys(user) as Array<keyof UserProperties>;

	const readonlyKeys: Array<keyof UserProperties> = ['coll', 'ts'];
	const writableKeys = allKeys.filter((key) => !readonlyKeys.includes(key));

	type StringifyProperties<T> = {
		[K in keyof T]: string;
	};

	type CollectionFilter = StringifyProperties<UserProperties>;

	const createEmptyFilter = (): CollectionFilter => {
		const filter: Partial<CollectionFilter> = {};
		allKeys.forEach((key) => {
			filter[key] = '';
		});
		return filter as CollectionFilter;
	};

	let filter = $state(createEmptyFilter());

	let sorter: Sorter[] = $state([]);

	// Create from sorter `Sorter[]` an array of `Ordering<UserClass>`
	function getSorters(sorter: Sorter[]): Ordering<UserClass>[] {
		return sorter.map((sort) => {
			const key = sort.key as keyof UserClass;
			const sorterFunction = sort.direction === 'asc' ? asc : desc;
			return sorterFunction((u: UserClass) => u[key]);
		});
	}

	let usersPageFiltered = $derived(
		User.where(
			(u) => u.firstName.includes(filter.firstName) && u.lastName.includes(filter.lastName)
		).order(...getSorters(sorter))
	);

	const u_user: UserProperties = $state({
		firstName: '',
		lastName: ''
	});

	async function createUser() {
		console.log('New user: ', u_user);
		User.create(u_user);
		u_user.firstName = '';
		u_user.lastName = '';

		await tick();
		const inputElement = document.getElementById('create-user');
		if (inputElement) {
			inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function on_key_down(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			createUser();
		}
	}
</script>

<div class="flex flex-wrap justify-center gap-10 p-4">
	<div>
		<button class="btn preset-filled" onclick={() => User.undo()}>Undo</button>
		<button class="btn preset-filled" onclick={() => User.redo()}>Redo</button>
	</div>
	<div class="w-192 flex flex-col gap-10">
		<div class="flex flex-col gap-3">
			<h2 class="h2">{collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}</h2>
			<div class="table-container space-y-4">
				<table class="table w-full table-auto">
					<thead>
						<tr>
							<th></th>
							{#each allKeys as key}
								<th>
									{key}
									<input class="input" type="text" name="filter-{key}" bind:value={filter[key]} />
								</th>
							{/each}
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each usersPageFiltered.data as user, index}
							<tr>
								<td class="w-5">{index + 1}</td>
								{#each allKeys as key}
									<td> <input class="input" type="text" bind:value={user[key]} name="key" /></td>
								{/each}
								<td>
									<button class="btn preset-filled" onclick={() => user.update(user)}>Update</button
									>
								</td>
								<td>
									<button class="btn-icon preset-tonal-error" onclick={() => user.delete()}>
										<X />
									</button>
								</td>
							</tr>
						{/each}
						<tr id="create-user">
							<td></td>
							<td>
								<input
									class="input"
									name="firstName"
									type="text"
									bind:value={u_user.firstName}
									onkeydown={on_key_down}
								/></td
							>
							<td>
								<input
									class="input"
									name="lastName"
									type="text"
									bind:value={u_user.lastName}
									onkeydown={on_key_down}
								/>
							</td>
							<td>
								<button
									class="btn max-w-48 preset-filled"
									onclick={() => createUser()}
									onkeydown={on_key_down}>Create User</button
								>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<div><h3 class="h3">Sort</h3></div>
	<Sort objectKeys={allKeys} {sorter} class="w-80" />
</div>
