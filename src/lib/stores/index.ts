import { createAccountStore } from './store-account.svelte';
import { createUserStore } from './store-document.svelte';
import { asc, desc } from './_shared/order';

const AccountStore = createAccountStore();
const UserStore = createUserStore();

const User = UserStore.init(AccountStore);

export { User, asc, desc };
