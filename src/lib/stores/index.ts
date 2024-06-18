import { createAccountStore } from './store-account.svelte';
import { createDocumentStore } from './store-document.svelte';
import { asc, desc } from './_shared/order';
import type { User } from '$lib/types/user';
import type { Consequence } from '$lib/types/consequence';
import type { Event } from '$lib/types/event';
import type { MasterQuestion } from '$lib/types/masterQuestion';
import type { MasterAnswer } from '$lib/types/masterAnswer';
import type { MasterChapter } from '$lib/types/masterChapter';

export const CollectionNames = {
	Event: 'Event',
	MasterQuestion: 'MasterQuestion',
	Consequence: 'Consequence',
	MasterChapter: 'MasterChapter',
	MasterAnswer: 'MasterAnswer',
	User: 'User'
};
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

const initUserStore = UserStore.init(AccountStore);

const Collections = Object.fromEntries(
	Object.entries(CollectionNames).map(([key, collectionName]) => {
		const typedKey = key as keyof CollectionTypes;

		return [
			collectionName,
			createDocumentStore<CollectionTypes[typeof typedKey]>(collectionName).init(AccountStore)
		];
	})
);

export { initUserStore as User, asc, desc, Collections };
