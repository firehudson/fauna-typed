import { createAccountStore } from './store-account.svelte';
import { createDocumentStore } from './store-document.svelte';
import { asc, desc } from './_shared/order';
import type { User } from '$lib/types/user';

const AccountStore = createAccountStore();
const UserStore = createDocumentStore<User>('User');

const initUserStore = UserStore.init(AccountStore);

export { initUserStore as User, asc, desc };
