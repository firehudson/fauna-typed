import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'Collection';
const STORE_NAME = 'COLLECTION_STORE';

/**
 * Collection without Functions
 */
type CollectionBaseProperties = {
	[K in keyof Collection as Collection[K] extends Function ? never : K]: Collection[K];
};
export type CollectionProperties = Omit<CollectionBaseProperties, 'ts'> & {};

export class Collection {
	coll?: string = '';
	ts: Date = new Date();
	ttl?: Date;
	name!: string;
	indexes!: Record<string, any>;
	constraints!: any[];
	fields!: Record<string, Record<string, string>>;

	constructor(doc: CollectionProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(collection: Omit<Partial<CollectionProperties>, 'coll'>): void {
		updateObject(this.name, collection);
	}

	replace(collection: Omit<CollectionProperties, 'coll'>): void {
		replaceObject(this.name, collection);
	}

	delete(): void {
		deleteObject(this.name);
	}

	toObject(): CollectionPojo {
		const collectionPojo: CollectionPojo = {
			name: this.name,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			constraints: this.constraints,
			indexes: this.indexes,
			fields: this.fields
		};

		return collectionPojo;
	}
}

/**
 * TODO: Eventually we can get rid also from CollectionPojo if we ensure, that CollectionProperties has only PoJo Objects
 */
export type CollectionPojo = {
	coll?: string;
	ts: Date;
	ttl?: Date;
	name: string;
	indexes: Record<string, any>;
	constraints: any[];
	fields?: Record<string, Record<string, string>>;
};
