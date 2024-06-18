import { Document, type DocumentPojo, type DocumentProperties } from './fauna';
import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'Consequence';
const STORE_NAME = 'CONSEQUENCE_STORE';

/**
 * Consequence without Functions
 */
type ConsequenceBaseProperties = {
	[K in keyof Consequence as Consequence[K] extends Function ? never : K]: Consequence[K];
};
export type ConsequenceProperties = Omit<ConsequenceBaseProperties, 'ts'> & DocumentProperties & {};

export class Consequence extends Document {
	name!: string;
	event!: string;
	masterAnswer!: string;
	nextEvents!: string[];
	masterChapter!: string;
	actions!: string;
	location!: any;

	constructor(doc: ConsequenceProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { id, ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(consequence: Omit<Partial<ConsequenceProperties>, 'id' | 'coll'>): void {
		updateObject(this.id, consequence);
	}

	replace(consequence: Omit<ConsequenceProperties, 'id' | 'coll'>): void {
		replaceObject(this.id, consequence);
	}

	delete(): void {
		deleteObject(this.id);
	}

	toObject(): ConsequencePojo {
		const consequencePojo: ConsequencePojo = {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			name: this.name,
			event: this.event,
			masterAnswer: this.masterAnswer,
			nextEvents: this.nextEvents,
			masterChapter: this.masterChapter,
			actions: this.actions,
			location: this.location
		};

		return consequencePojo;
	}
}

/**
 * TODO: Eventually we can get rid also from ConsequencePojo if we ensure, that ConsequenceProperties has only PoJo Objects
 */
export type ConsequencePojo = DocumentPojo & {
	name?: string;
	event?: string;
	masterAnswer?: string;
	nextEvents?: string[];
	masterChapter?: string;
	actions?: string;
	location?: any;
};
