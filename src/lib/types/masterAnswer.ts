import { Document, type DocumentPojo, type DocumentProperties } from './fauna';
import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'MasterAnswer';
const STORE_NAME = 'MASTER_ANSWER_STORE';

/**
 * MAsterAnswer without Functions
 */
type MasterAnswerBaseProperties = {
	[K in keyof MasterAnswer as MasterAnswer[K] extends Function ? never : K]: MasterAnswer[K];
};
export type MasterAnswerProperties = Omit<MasterAnswerBaseProperties, 'ts'> &
	DocumentProperties & {};

export class MasterAnswer extends Document {
	title!: string;
	examples!: string[];
	explanation!: string;
	masterQuestion!: string;
	formula!: string;
	location!: string;

	constructor(doc: MasterAnswerProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { id, ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(masterAnswer: Omit<Partial<MasterAnswerProperties>, 'id' | 'coll'>): void {
		updateObject(this.id, masterAnswer);
	}

	replace(masterAnswer: Omit<MasterAnswerProperties, 'id' | 'coll'>): void {
		replaceObject(this.id, masterAnswer);
	}

	delete(): void {
		deleteObject(this.id);
	}

	toObject(): MasterAnswerPojo {
		const masterAnswerPojo: MasterAnswerPojo = {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			examples: this.examples,
			explanation: this.explanation,
			formula: this.formula,
			location: this.location,
			masterQuestion: this.masterQuestion,
			title: this.title
		};

		return masterAnswerPojo;
	}
}

/**
 * TODO: Eventually we can get rid also from MasterAnswerPojo if we ensure, that MasterAnswerProperties has only PoJo Objects
 */
export type MasterAnswerPojo = DocumentPojo & {
	title: string;
	examples: string[];
	explanation: string;
	masterQuestion: string;
	formula: string;
	location: string;
};
