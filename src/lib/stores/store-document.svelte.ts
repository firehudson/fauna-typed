import { Module, type QuerySuccess, TimeStub } from 'fauna';
import { Page, Document, type Predicate } from '../types/fauna';
import { User, type UserProperties, type UserPojo } from '../types/user';
import { v } from '../types/validators';
import type { AccountStore } from './store-account.svelte';
import type { Ordering } from './_shared/order';
import { redo, undo } from './_shared/history';
import { client, fql } from '../database/client';
import { browser } from '$app/environment';

const COLL_NAME = 'User';
const STORE_NAME = 'USER_STORE';

export type CreateUserStore = {
	users: User[];
	init: (accountStore: AccountStore) => UserStore; // TODO: init needs also to take the database client
	initS: UserStore; // TODO: Only for testing - delete later
	/**
	 * Empties the store. Useful if e.g. the user signs out
	 * @returns
	 */
	destroy: () => void;
};

export type UserStore = {
	byId: (id: string) => User;
	first: () => User;
	last: () => User;
	all: () => Page<User>;
	paginate: (after: string) => Page<User>; // TODO: To be implemented
	where: (filter: Predicate<User>) => Page<User>;
	create: (user: UserProperties) => User;

	undo: () => void;
	redo: () => void;

	/**
	 * Transforms an Array of User into a POJO that can be used in the DOM.
	 * @param users
	 * @returns
	 */
	toObjectArray: (users: User[]) => UserPojo[];
};

const documentHandler = {
	get(target: any, prop: any, receiver: any): any {
		console.log('objectProp:', prop);
		console.log('objectTarget:', target);

		switch (prop) {
			case 'id':
				return target.id;
			case 'ts':
				return target.ts;
			case 'coll':
				return target.coll;
			case 'firstName':
				return target.firstName;
			case 'lastName':
				return target.lastName;
			case 'update':
				return (user: Omit<Partial<UserProperties>, 'id' | 'coll'>): void => {
					console.log('update target', target);
					return target.update(user);
				};
			case 'replace':
				return (user: Omit<UserProperties, 'id' | 'coll'>): void => target.replace(user);
			case 'delete':
				return () => {
					console.log('delete target', target);
					target.delete();
				};
			default:
				return Reflect.get(target, prop, receiver);
		}
	}
};

/**
 * Used to determine the current state of the store
 */
let current: User[] = $state<User[]>([]);

/**
 * Used for undo functionality
 */
let past: [User[]?] = $state<[User[]?]>([]);

/**
 * Used for redo functionality
 */
let future: [User[]?] = $state<[User[]?]>([]);

/**
 * Stores all documents retrieved from the database unchanged. Used as a reference to determine the difference to "current" in order to determine which documents need to be updated, deleted or created in the database when the "sync" function is called.
 */
const database: User[] = $state<User[]>([]);

const getObjects = (filter: Predicate<User>): User[] => {
	return current.filter(filter);
};

const upsertObject = (user: UserProperties): User => {
	const index = current.findIndex((u) => $state.is(u.id, user.id));

	// const newUser = new User(user);
	const newUser: User = new Proxy(new User(user), documentHandler);

	if (index > -1) {
		addToPast();
		current[index] = newUser;
	} else {
		addToPast();
		current.push(newUser);
	}
	toLocalStorage();
	const updatedUser = current.find((u) => $state.is(u.id, newUser.id));
	if (!updatedUser) {
		throw new Error('User not found after upsert');
	}
	console.log('***current***\n', current);
	return updatedUser;
};

export const updateObject = (id: string, fields: Partial<UserProperties>) => {
	const user = current.find((u) => $state.is(u.id, id));
	if (user) {
		addToPast();
		Object.assign(user, fields);
		toLocalStorage();
	}
};

export const replaceObject = (id: string, fields: UserProperties) => {
	const index = current.findIndex((u) => $state.is(u.id, id));
	if (index !== -1) {
		addToPast();
		Object.assign(current[index], fields);
		Object.keys(current[index]).forEach((key) => {
			if (!(key in fields)) {
				if (key !== 'id' && key !== 'ts' && key !== 'coll') {
					delete current[index][key];
				}
			}
		});
		toLocalStorage();
	}
};

export const deleteObject = (id: string) => {
	const index = current.findIndex((u) => $state.is(u.id, id));
	if (index !== -1) {
		addToPast();
		current.splice(index, 1);
		toLocalStorage();
	}
};

export const toLocalStorage = () => {
	if (browser) {
		localStorage.setItem(STORE_NAME, JSON.stringify(current));
	}
};

export const fromLocalStorage = () => {
	if (browser) {
		const storedData = localStorage.getItem(STORE_NAME);
		if (storedData) {
			try {
				const parsedUsers = JSON.parse(storedData) as UserProperties[];
				parsedUsers.forEach((parsedUser) => {
					upsertObject(new User(parsedUser));
				});

				console.log('Store updated from localStorage');
			} catch (error) {
				console.error('Error parsing stored data:', error);
			}
		} else {
			console.log('No stored data found');
		}
	}
	current.push(
		new User({
			id: 'TEMP_1',
			firstName: 'John',
			lastName: 'Doe',
			ts: new Date().toISOString(), // Assuming ts is required
			account: 'account' // Assuming account is required
		})
	);
	console.log('Test user added:', current);
};

/**
 * Add the `current` store to the `past` store to support undo functionality.
 * It also resets the `future` store, because the future store must only active if undo was used (If not old states will interfere).
 */
const addToPast = (): void => {
	past.push([...current]);
	if (past.length > 20) {
		past.shift();
	}
	future = [];
};

export const createUserStore = (): CreateUserStore => {
	let AccountStore: AccountStore | null = null;

	// fromLocalStorage();

	const createStoreHandler = {
		get(target: any, prop: any, receiver: any): any {
			switch (prop) {
				case 'users':
					return current;
				case 'init':
					return (accountStore: AccountStore) => {
						AccountStore = accountStore;
						fromLocalStorage();
						return new Proxy(current, storeHandler);
					};
				case 'destroy':
					return () => {
						current = [];
						if (window) {
							localStorage.removeItem(STORE_NAME);
						}
					};
				default:
					return undefined;
			}
		}
	};

	const storeHandler = {
		get(target: any, prop: any, receiver: any): any {
			console.log('storeProp:', prop);

			switch (prop) {
				case 'byId':
					return (...args: string[]) => {
						const user = getObjects((user) => user.id === args[0]).at(0);
						return user;
					};

				case 'first':
					return () => {
						const firstResult = current.at(0);
						return firstResult;
					};

				case 'last':
					return () => {
						const lastResult = current.at(-1);
						return lastResult;
					};

				case 'all':
					return () => {
						const result: Page<User> = new Page(current, undefined);
						// fetchAllFromDB(result);
						return new Proxy(result, pageHandler);
					};

				case 'where':
					return (filter: Predicate<User>) => {
						const result: Page<User> = new Page(getObjects(filter), undefined);
						// fetchWhereFromDB(result);
						return new Proxy(result, pageHandler);
					};

				case 'create':
					return (user: UserProperties) => {
						return upsertObject(user);
					};

				/*************
				 * Undo/Redo
				 ************/

				case 'undo':
					return () => {
						const result = undo(current, past, future);
						if (result) {
							current = result.current;
							past = result.past;
							future = result.future;

							toLocalStorage();
						}
					};

				case 'redo':
					return () => {
						const result = redo(current, past, future);
						if (result) {
							current = result.current;
							past = result.past;
							future = result.future;
							toLocalStorage();
						}
					};

				case 'toObjectArray':
					return (users: User[]) => {
						return users?.map((user) => user.toObject());
					};

				default:
					// This will handle all other cases, including 'then' for Promises
					return Reflect.get(target, prop, receiver);
			}
		}
	};

	function createPageHandler<T extends Document>() {
		return {
			get(target: Page<T>, prop: keyof Page<T>, receiver: any): any {
				console.log('pageProp:', prop);

				switch (prop) {
					case 'data':
						return new Proxy(target.data, arrayHandler);
					case 'after':
						return target.after;
					case 'order':
						return (...orderings: Ordering<T>[]) => {
							target.order(...orderings); // Use the Page class's order method
							return new Proxy(target, createPageHandler<T>()); // Return a proxy to allow chaining
						};
					default:
						return Reflect.get(target, prop, receiver);
				}
			}
		};
	}

	const pageHandler = createPageHandler<User>();

	const arrayHandler = {
		get(target: any, prop: any, receiver: any): any {
			console.log('arrayProp:', prop);
			console.log('arrayTarget:', target);

			switch (prop) {
				case 'at':
					return (index: number) => {
						if (target.at(index) != null) {
							return target.at(index);
						} else {
							target.at(index);
						}
					};
				default:
					return Reflect.get(target, prop, receiver);
			}
		}
	};

	// TODO: change type to T
	// async function fetchAllFromDB(page: Page<User>) {
	// 	try {
	// 		const response: QuerySuccess<Page<UserProperties>> = await client.query<Page<UserProperties>>(
	// 			fql`User.all()`
	// 		);
	// 		if (response.data) {
	// 			const data: User[] = response.data.data.map(
	// 				(userWithoutMethods) => new User(userWithoutMethods)
	// 			);

	// 			// Find the data in the store and replace it with the new data. If it doesn't exist, add it.
	// 			data.forEach((newUser) => {
	// 				const existingUserIndex = page.data.findIndex((user) => newUser.id === user.id);
	// 				if (existingUserIndex !== -1) {
	// 					// Replace the existing user with the new user
	// 					page.data[existingUserIndex] = newUser;
	// 				} else {
	// 					// Add the new user to the store
	// 					page.data.push(newUser);
	// 				}
	// 			});

	// 			// TODO: Update also the localStorage

	// 			// Object.assign(page, updatedStore);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error fetching user from database:', error);
	// 	}
	// }

	return new Proxy({}, createStoreHandler) as unknown as CreateUserStore;
};
