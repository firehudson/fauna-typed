import type { PageLoad } from './$types';
import { createDocumentStore } from '$lib/stores/store-document.svelte';

const User = createDocumentStore().initS;

export const load = (async () => {
	const users = User.all().data;
	console.log('***users***', users);
	console.log('***users.at(0)***', users.at(0));
	const userObjectArray = User.toObjectArray(users);
	return { user: userObjectArray };
}) satisfies PageLoad;
