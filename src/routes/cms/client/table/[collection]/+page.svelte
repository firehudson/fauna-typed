<script lang="ts">
	import { getStore, asc, desc, type CollectionTypes } from '$lib/stores';
	import { X } from 'lucide-svelte';
	import { tick } from 'svelte';
	import Sort from './sort.svelte';
	import type { Ordering } from '$lib/stores/_shared/order';
	import type { Sorter } from './sort';
	import { page } from '$app/stores';
	import { initialState } from '$lib/stores/initialState';

	const Collections = getStore();

	let collectionName = $derived($page.params.collection);
	const collectionKey = $derived(
		Object.keys(Collections).find((key) => key.toLowerCase() === collectionName)
	) as keyof CollectionTypes;

	type CollectionType = CollectionTypes[typeof collectionKey];

	const collectionInstance = Collections[collectionKey];

	const allKeys = $derived(
		Object.keys(initialState[collectionKey as keyof typeof initialState]) as Array<
			keyof CollectionType
		>
	);

	const readonlyKeys = ['coll', 'ts'];
	const writableKeys = allKeys.filter((key) => !readonlyKeys.includes(key));

	type StringifyProperties<T> = {
		[K in keyof T]: string;
	};

	type CollectionFilter = StringifyProperties<CollectionType>;

	const createEmptyFilter = (): CollectionFilter => {
		const filter: Partial<CollectionFilter> = {};
		allKeys.forEach((key) => {
			if (!['coll', 'ts', 'ttl', 'name', 'id'].includes(key)) {
				filter[key] = '';
			}
		});
		return filter as CollectionFilter;
	};

	let filter = $state(createEmptyFilter());

	let sorter: Sorter[] = $state([]);

	// Create from sorter `Sorter[]` an array of `Ordering<UserClass>`
	function getSorters(sorter: Sorter[]): Ordering<CollectionType>[] {
		return sorter.map((sort) => {
			const key = sort.key as keyof CollectionType;
			const sorterFunction = sort.direction === 'asc' ? asc : desc;
			return sorterFunction((u: CollectionType) => u[key]);
		});
	}

	let collectionsPageFiltered = $derived(
		collectionInstance
			.where((u) => {
				const filterKeys = Object.keys(filter) as Array<keyof CollectionFilter>;
				return filterKeys.every((key) => {
					return u[key]
						?.toString()
						?.toLowerCase()
						?.includes?.(filter[key]?.toString()?.toLowerCase());
				});
			})
			.order(...getSorters(sorter))
	);

	let u_collection = $state(initialState[collectionKey]);

	$effect(() => {
		u_collection = initialState[collectionKey];
		filter = createEmptyFilter();
	});

	async function createUser() {
		console.log('New user: ', u_collection);
		collectionInstance.create(u_collection);
		u_collection = initialState[collectionKey];

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
		<button class="btn preset-filled" onclick={() => collectionInstance.undo()}>Undo</button>
		<button class="btn preset-filled" onclick={() => collectionInstance.redo()}>Redo</button>
	</div>
	<div class="w-192 flex flex-col gap-10">
		<div class="flex flex-col gap-3">
			<h2 class="h2">{collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}</h2>
			<div class="table-container space-y-4">
				<table class="table w-full table-auto">
					<thead>
						<tr>
							<th></th>
							{#each allKeys as keyName (keyName)}
								<th>
									{keyName}
									{#if filter?.[keyName] !== undefined}
										<input
											class="input"
											type="text"
											name="filter-{keyName}"
											bind:value={filter[keyName]}
										/>
									{/if}
								</th>
							{/each}
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each collectionsPageFiltered.data as collectionData, index}
							<tr>
								<td class="w-5">{index + 1}</td>
								{#each allKeys as key}
									<td>
										<input
											class="input"
											type="text"
											bind:value={collectionData[key]}
											name="key"
										/></td
									>
								{/each}
								<td>
									<button
										class="btn preset-filled"
										onclick={() => collectionData.update(collectionData)}>Update</button
									>
								</td>
								<td>
									<button
										class="btn-icon preset-tonal-error"
										onclick={() => collectionData.delete()}
									>
										<X />
									</button>
								</td>
							</tr>
						{/each}
						<tr id="create-user">
							<td></td>
							{#each Object.keys(u_collection) as u_collection_key (u_collection_key)}
								<td>
									<input
										class="input"
										name={u_collection_key}
										type="text"
										bind:value={u_collection[u_collection_key as keyof typeof u_collection]}
										onkeydown={on_key_down}
									/></td
								>
							{/each}

							<td>
								<button
									class="btn max-w-48 preset-filled"
									onclick={() => createUser()}
									onkeydown={on_key_down}>Create Document</button
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
