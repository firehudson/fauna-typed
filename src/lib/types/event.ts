import { Document, type DocumentPojo, type DocumentProperties } from './fauna';
import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'Event';
const STORE_NAME = 'EVENT_STORE';

/**
 * Event without Functions
 */
type EventBaseProperties = {
	[K in keyof Event as Event[K] extends Function ? never : K]: Event[K];
};
export type EventProperties = Omit<EventBaseProperties, 'ts'> & DocumentProperties & {};

export class Event extends Document {
	name!: string;
	masterQuestion!: string;
	consequences!: string[];
	masterChapter!: string;
	multipleReference!: string;
	type!: string;
	location!: string;

	constructor(doc: EventProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { id, ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(event: Omit<Partial<EventProperties>, 'id' | 'coll'>): void {
		updateObject(this.id, event);
	}

	replace(event: Omit<EventProperties, 'id' | 'coll'>): void {
		replaceObject(this.id, event);
	}

	delete(): void {
		deleteObject(this.id);
	}

	toObject(): EventPojo {
		const eventPojo: EventPojo = {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			name: this.name,
			consequences: this.consequences,
			location: this.location,
			masterChapter: this.masterChapter,
			masterQuestion: this.masterQuestion,
			multipleReference: this.multipleReference,
			type: this.type
		};

		return eventPojo;
	}
}

/**
 * TODO: Eventually we can get rid also from EventPojo if we ensure, that EventProperties has only PoJo Objects
 */
export type EventPojo = DocumentPojo & {
	name: string;
	masterQuestion: string;
	consequences: string[];
	masterChapter: string;
	multipleReference: string;
	type: string;
	location: string;
};
