import { Document, type DocumentPojo, type DocumentProperties } from './fauna';
import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'MasterChapter';
const STORE_NAME = 'MASTER_CHAPTER_STORE';

/**
 * MasterChapter without Functions
 */
type MasterChapterBaseProperties = {
	[K in keyof MasterChapter as MasterChapter[K] extends Function ? never : K]: MasterChapter[K];
};
export type MasterChapterProperties = Omit<MasterChapterBaseProperties, 'ts'> &
	DocumentProperties & {};

export class MasterChapter extends Document {
	title!: string;
	parent!: string;
	children!: string[];
	before!: string;
	after!: string;
	position!: string;
	location!: string;

	constructor(doc: MasterChapterProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { id, ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(masterChapter: Omit<Partial<MasterChapterProperties>, 'id' | 'coll'>): void {
		updateObject(this.id, masterChapter);
	}

	replace(masterChapter: Omit<MasterChapterProperties, 'id' | 'coll'>): void {
		replaceObject(this.id, masterChapter);
	}

	delete(): void {
		deleteObject(this.id);
	}

	toObject(): MasterChapterPojo {
		const masterChapterPojo: MasterChapterPojo = {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			after: this.after,
			before: this.before,
			children: this.children,
			location: this.location,
			parent: this.parent,
			position: this.position,
			title: this.title
		};

		return masterChapterPojo;
	}
}

/**
 * TODO: Eventually we can get rid also from MasterChapterPojo if we ensure, that MasterChapterProperties has only PoJo Objects
 */
export type MasterChapterPojo = DocumentPojo & {
	title: string;
	parent: string;
	children: string[];
	before: string;
	after: string;
	position: string;
	location: string;
};
