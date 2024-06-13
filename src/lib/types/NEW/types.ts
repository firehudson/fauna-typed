import { Client, fql, Page, type QuerySuccess, type DocumentT } from 'fauna';

type User = {
	firstName: string;
	lastName: string;
	account: () => Account;
};

type Account = {
	user: () => Account;
	provider: string;
	providerUserId: string;
};

type Functions<T> = {
	update: (document: T) => void;
	replace: (document: T) => void;
	delete: () => void;
};

type FunctionsT<T> = Functions<T> & T;

// const mergedUser: FunctionsT<DocumentT<User>>;
// mergedUser.account;

// const mergedPageUser: Page<FunctionsT<DocumentT<User>>>;
// mergedPageUser.data.forEach((doc) => doc.account);
