import { TimeStub, DocumentReference, Module, type QueryValue } from 'fauna';

import { z } from 'zod';
import type { Ordering } from '../stores/_shared/order';

export type DocumentPojo = {
	id: string;
	coll?: string;
	ts?: Date;
	ttl?: Date;
};

export type DocumentProperties = Partial<Document>;

export class Document {
	id!: string;
	coll?: string;
	ts!: Date;
	ttl?: Date;

	// constructor(doc: Partial<Document> & Pick<Document, 'id'>) {
	constructor(doc: Partial<Document>) {
		this.coll = doc.coll;
		if (doc.ttl) {
			this.ttl = new Date(doc.ttl);
		}
		if (doc.id) {
			this.id = doc.id;
		} else {
			this.id = 'TEMP_' + crypto.randomUUID();
		}
		if (doc.ts) {
			this.ts = new Date(doc.ts);
		} else {
			this.ts = new Date();
		}
	}

	// toObject(): DocumentPojo {
	// 	return {
	// 		id: this.id,
	// 		coll: this.coll,
	// 		ts: this.ts,
	// 		ttl: this.ttl ? this.ttl : undefined
	// 	};
	// }
}

/**
 * Client Version of Fauna Document. In the client version are all fields optional to support also creating documents (With the Fauna Document class it's not possible because the fields `coll` and `ts` are not optional but Fauna is not accepting them if you pass it).
 */
// export type L_Document = {
// 	id: string;
// 	coll?: Module;
// 	ts?: TimeStub;
// 	ttl?: TimeStub;
// };

// export type Page<T extends L_Document> = {
// 	data: T[];
// 	after?: string;
// };

export class Page<T extends Document> {
	data: T[];
	after?: string;

	constructor(data: T[], after?: string) {
		this.data = data;
		if (after) {
			this.after = after;
		}
	}

	/**
	 * Sorts the Page data based on provided orderings. The first entry in the Ordering has the highest sorting priority, with priority decreasing with each following entry.
	 * @param orderings - A list of ordering functions, created by `asc` or `desc`.
	 * @example
	 * import { asc, desc } from 'fauna-typed/stores';
	 * User.all().order(asc((u) => u.firstName), desc((u) => u.lastName)))
	 */
	order(...orderings: Ordering<T>[]): Page<T> {
		this.data.sort((a: T, b: T) => {
			for (const ordering of orderings) {
				const result = ordering(a, b);
				if (result !== 0) return result;
			}
			return 0;
		});
		return this;
	}
}

export type Predicate<T> = (item: T) => boolean;

export type id = string;

/**
 * *************************
 * ZOD
 * *************************
 */

export const timeStub = z.custom<TimeStub>((arg) => arg instanceof TimeStub);

/**
 * Zod Validator for Fauna Document
 */
export const d_v_Document = z.instanceof(Document);

/**
 * Zod Validator for the client version of Fauna Document (aka. ClientDocument). In the client version are all fields optional to support also creating documents (With the Fauna Document class it's not possible because the fields `coll` and `ts` are not optional but Fauna is not accepting them if you pass it).
 */
export const l_v_Document: z.ZodType<L_Document> = z.object({
	id: z.string(),
	coll: z.instanceof(Module).optional(),
	ts: timeStub.optional(),
	ttl: timeStub.optional()
});

export function d_v_Page<T>(itemSchema: z.ZodType<T>) {
	return z.object({
		data: z.array(itemSchema),
		after: z.string().optional()
	});
}

export const d_v_DocumentReference = z.instanceof(DocumentReference);
