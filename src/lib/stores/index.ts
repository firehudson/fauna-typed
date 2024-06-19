import { createAccountStore } from './store-account.svelte';
import { createDocumentStore, type UserStore } from './store-document.svelte';
import { asc, desc } from './_shared/order';
import type { User } from '$lib/types/user';
import type { Consequence } from '$lib/types/consequence';
import type { Event } from '$lib/types/event';
import type { MasterQuestion } from '$lib/types/masterQuestion';
import type { MasterAnswer } from '$lib/types/masterAnswer';
import type { MasterChapter } from '$lib/types/masterChapter';
import { client, fql } from '$lib/database/client';

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

let Collections: Record<string, UserStore> | null = null;

export const initStore = async () => {
	console.log('=============Start');
	const collectionsRes = (await client.query(fql(['Collection.all().toArray()']))).data as any[];

	Collections = Object.fromEntries(
		collectionsRes?.map((collection) => {
			const typedKey = collection.name as keyof CollectionTypes;

			return [
				collection.name,
				createDocumentStore<CollectionTypes[typeof typedKey]>(collection.name).init(AccountStore)
			];
		})
	);

	console.log('Store initialized', Collections);
};

export const getStore = () => {
	console.log('getStore', Collections);
	if (!Collections) {
		throw new Error('Store not initialized');
	}

	return Collections;
};

export { initUserStore as User, asc, desc, Collections };
