import type { Actions, PageServerLoad } from './$types';

import { createDocumentStore } from '$lib/stores/store-document.svelte';
const User = createDocumentStore().initS;

export const load = (async () => {
	/**
	 * Get all Users with pagination cursor
	 */
	const users = User.all().data;
	const usersPojo = User.toObjectArray(users);
	return { users: usersPojo };
}) satisfies PageServerLoad;

export const actions = {
	create: async (event) => {
		const data = await event.request.formData();
		const name = data.get('name');

		User.create({ firstName: name as string, lastName: name as string });
	},
	update: async (event) => {
		const data = await event.request.formData();
		const name = data.get('name') as string;
		const id = data.get('id') as string;

		User.byId(id).update({ firstName: name });
	}
} satisfies Actions;
