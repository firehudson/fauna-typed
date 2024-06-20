import { browser } from '$app/environment';
import { client, fql } from '$lib/database/client';
import type { Collection, CollectionProperties } from '../types/collection';
import { Page, type Predicate } from '../types/fauna';
import { redo, undo } from './_shared/history';

const STORE_NAME = 'COLLECTION_STORE';

export type CreateCollectionStore = {
	collections: Collection[];
	init: () => CollectionStore; // TODO: init needs also to take the database client
	fetchCollections: () => Promise<void>;
	/**
	 * Empties the store. Useful if e.g. the user signs out
	 * @returns
	 */
	destroy: () => void;
};

export type CollectionStore = {
	byName: (id: string) => Collection;
	all: () => Page<Collection>;
	paginate: (after: string) => Page<Collection>; // TODO: To be implemented
	where: (filter: Predicate<Collection>) => Page<Collection>;
	// create: (user: CollectionProperties) => Collection;

	undo: () => void;
	redo: () => void;

	/**
	 * Transforms an Array of Collection into a POJO that can be used in the DOM.
	 * @param users
	 * @returns
	 */
	// toObjectArray: (users: Collection[]) => UserPojo[];
};

/**
 * Used to determine the current state of the store
 */
let current: Collection[] = $state<Collection[]>([]);

/**
 * Used for undo functionality
 */
let past: [Collection[]?] = $state<[Collection[]?]>([]);

/**
 * Used for redo functionality
 */
let future: [Collection[]?] = $state<[Collection[]?]>([]);

const getObjects = (filter: Predicate<Collection>): Collection[] => {
	return current.filter(filter);
};

const upsertObject = (user: CollectionProperties): Collection => {
	// const index = current.findIndex((u) => u.id === user.id);
	// const newUser = new Collection(user);
	// if (index > -1) {
	// 	addToPast();
	// 	current[index] = newUser;
	// } else {
	// 	addToPast();
	// 	current.push(newUser);
	// }
	// toLocalStorage();
	// const updatedUser = current.find((u) => u.id === newUser.id);
	// if (!updatedUser) {
	// 	throw new Error('Collection not found after upsert');
	// }
	// return updatedUser;
	return {} as Collection;
};

export const updateObject = (id: string, fields: Partial<CollectionProperties>) => {
	const user = current.find((u) => u.id === id);
	if (user) {
		addToPast();
		Object.assign(user, fields);
		toLocalStorage();
	}
};

export const replaceObject = (id: string, fields: CollectionProperties) => {
	const index = current.findIndex((u) => u.id === id);
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
	const index = current.findIndex((u) => u.id === id);
	if (index !== -1) {
		addToPast();
		current.splice(index, 1);
		toLocalStorage();
	}
};

const toLocalStorage = () => {
	if (browser) {
		localStorage.setItem(STORE_NAME, JSON.stringify(current));
	}
};

const fromLocalStorage = () => {
	if (browser) {
		const storedData = localStorage.getItem(STORE_NAME);

		if (storedData) {
			const parsedUsers = JSON.parse(storedData) as CollectionProperties[];
			// current = parsedUsers.map((parsedUser) => new Collection(parsedUser));
			current = parsedUsers;
		}
	}
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

export const createCollectionStore = (): CreateCollectionStore => {
	fromLocalStorage();

	const createStoreHandler = {
		get(target: any, prop: any, receiver: any): any {
			switch (prop) {
				case 'collections':
					return current;
				case 'fetchCollections':
					return async () => {
						await fetchAllCollections();
					};

				case 'init':
					return () => {
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
				case 'byName':
					return (name: string) => {
						const collection = getObjects((collection) => collection.name === name)?.[0] || {};
						return new Proxy(collection, objectHandler);
					};

				case 'all':
					return () => {
						const result: Page<Collection> = new Page(current, undefined);
						// fetchAllFromDB(result);
						return new Proxy(result, pageHandler);
					};

				case 'where':
					return (filter: Predicate<Collection>) => {
						const result: Page<Collection> = new Page(getObjects(filter), undefined);
						// fetchWhereFromDB(result);
						return new Proxy(result, pageHandler);
					};

				case 'create':
					return (collection: CollectionProperties) => {
						return new Proxy(upsertObject(collection), objectHandler);
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
					return (collections: Collection[]) => {
						return collections?.map((collection) => collection.toObject());
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

	const pageHandler = createPageHandler<Collection>();

	const arrayHandler = {
		get(target: any, prop: any, receiver: any): any {
			console.log('arrayProp:', prop);

			switch (prop) {
				case 'at':
					return (index: number) => {
						if (target.at(index) != null) {
							return new Proxy(target.at(index), objectHandler);
						} else {
							target.at(index);
						}
					};
				default:
					return Reflect.get(target, prop, receiver);
			}
		}
	};

	const objectHandler = {
		get(target: any, prop: any, receiver: any): any {
			console.log('objectProp:', prop);

			switch (prop) {
				case 'id':
					return target.id;
				case 'ts':
					return target.ts;
				case 'coll':
					return target.coll;
				case 'name':
					return target.name;
				case 'indexes':
					return target.indexes;
				case 'constraints':
					return target.constraints;
				case 'fields':
					return target.fields;
				case 'update':
					return (user: Partial<CollectionProperties>): void => target.update(user);
				case 'replace':
					return (user: CollectionProperties): void => target.replace(user);
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

	const fetchAllCollections = async () => {
		try {
			const collectionsRes = (await client.query(fql(['Collection.all().toArray()'])))
				.data as Collection[];

			current = collectionsRes;
		} catch (error) {
			current = [];
			console.log('Error in fetchAllCollections', error);
		}
	};

	return new Proxy({}, createStoreHandler) as unknown as CreateCollectionStore;
};
