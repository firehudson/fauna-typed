import { Document, type DocumentPojo, type DocumentProperties } from './fauna';
import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'MasterQuestion';
const STORE_NAME = 'MASTER_QUESTION_STORE';

/**
 * MasterQuestion without Functions
 */
type MasterQuestionBaseProperties = {
	[K in keyof MasterQuestion as MasterQuestion[K] extends Function ? never : K]: MasterQuestion[K];
};
export type MasterQuestionProperties = Omit<MasterQuestionBaseProperties, 'ts'> &
	DocumentProperties & {};

export class MasterQuestion extends Document {
	title!: string;
	explanation!: string;
	answers!: string[];
	type!: string;
	location!: string;

	constructor(doc: MasterQuestionProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { id, ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(masterQuestion: Omit<Partial<MasterQuestionProperties>, 'id' | 'coll'>): void {
		updateObject(this.id, masterQuestion);
	}

	replace(masterQuestion: Omit<MasterQuestionProperties, 'id' | 'coll'>): void {
		replaceObject(this.id, masterQuestion);
	}

	delete(): void {
		deleteObject(this.id);
	}

	toObject(): MasterQuestionPojo {
		const masterQuestionPojo: MasterQuestionPojo = {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			answers: this.answers,
			explanation: this.explanation,
			location: this.location,
			title: this.title,
			type: this.type
		};

		return masterQuestionPojo;
	}
}

/**
 * TODO: Eventually we can get rid also from MasterQuestionPojo if we ensure, that MasterQuestionProperties has only PoJo Objects
 */
export type MasterQuestionPojo = DocumentPojo & {
	title: string;
	explanation: string;
	answers: string[];
	type: string;
	location: string;
};
