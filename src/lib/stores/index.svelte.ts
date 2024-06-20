import { createAccountStore } from './store-account.svelte';
import { createDocumentStore, type UserStore } from './store-document.svelte';
import { asc, desc } from './_shared/order';
import type { User } from '$lib/types/user';
import type { Consequence } from '$lib/types/consequence';
import type { Event } from '$lib/types/event';
import type { MasterQuestion } from '$lib/types/masterQuestion';
import type { MasterAnswer } from '$lib/types/masterAnswer';
import type { MasterChapter } from '$lib/types/masterChapter';
import { createCollectionStore } from './store-collection.svelte';

export type CollectionTypes = {
	Consequence: Consequence;
	Event: Event;
	MasterQuestion: MasterQuestion;
	MasterAnswer: MasterAnswer;
	MasterChapter: MasterChapter;
	User: User;
};

const AccountStore = createAccountStore();
const UserStore = createDocumentStore<User>('User');
const CollectionStore = createCollectionStore().init();

const initUserStore = UserStore.init(AccountStore);

const Collections: { stores: Record<string, UserStore> | null } = $state({ stores: null });

export const initStore = async () => {
	const collections = CollectionStore.all().data;
	console.log('=============Start', collections);

	Collections.stores = Object.fromEntries(
		collections?.map((collection) => {
			const typedKey = collection.name as keyof CollectionTypes;

			return [
				collection.name,
				createDocumentStore<CollectionTypes[typeof typedKey]>(collection.name).init(AccountStore)
			];
		})
	);

	console.log('Store initialized', Collections);
};

export { initUserStore as User, asc, desc, Collections, CollectionStore };
