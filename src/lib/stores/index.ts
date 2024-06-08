import { createAccountStore } from './store-account.svelte';
import { createUserStore } from './store-user.svelte';
import { asc, desc } from './_shared/order';

const AccountStore = createAccountStore();
const UserStore = createUserStore();

const User = UserStore.init(AccountStore);

const Collections = {
	User: User
};

export { Collections, asc, desc };
