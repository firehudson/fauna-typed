import { DocumentReference, Document as DocumentFauna } from 'fauna';

import { type User, type UserProperties, type UserPojo } from './user';
import { Document, type DocumentPojo, type id, type DocumentProperties } from './fauna';
import { z } from 'zod';

/**
 * Account without Functions
 */
type AccountBaseProperties = {
	[K in keyof Account as Account[K] extends Function ? never : K]: Account[K];
};
export type AccountProperties = Omit<AccountBaseProperties, 'user' | 'id' | 'ts'> &
	DocumentProperties & {
		user: UserProperties | id;
	};

// export type AccountProperties = Omit<
// 	Account,
// 	'update' | 'replace' | 'delete' | 'toObject' | 'user'
// > & {
// 	user: UserProperties;
// };

export type AccountPojo = DocumentPojo & {
	user: UserPojo;
	provider: string;
	providerUserId: string;
};

// export type AccountPojo = DocumentPojo & {
// 	user: User;
// 	provider: string;
// 	providerUserId: string;
// };

export class Account extends Document {
	user!: User;
	provider!: string;
	providerUserId!: string;

	constructor(doc: AccountProperties) {
		super(doc);
		// Assign the document properties to the instance
		Object.assign(this, doc);
	}

	update(account: Partial<AccountProperties>): void {
		// updateAccount(this.id, u_account);
	}

	replace(account: AccountProperties): void {
		// replaceAccount(this.id, u_account);
	}

	delete(): void {
		// deleteAccount(this.id);
	}

	toObject(): AccountPojo {
		return {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			user: this.user.toObject(),
			provider: this.provider,
			providerUserId: this.providerUserId
		};
	}
}

/**
 * `U` stand for `Upsert` (Update or Insert (alias => Create))
 *
 * Used to create or update a Account in the store and in the database
 */
// export type U_Account = {
// 	id?: id;
// 	ttl?: Date;
// 	user: User;
// 	provider: string;
// 	providerUserId: string;
// };

// export type D_Account = DocumentFauna & {
// 	user: D_User | DocumentReference;
// 	provider: string;
// 	providerUserId: string;
// };

/**
 * `L` stand for `Loose`
 *
 * Treats all schema fields as optional except `id.`
 *
 * Use it everyhwere where you're not in need of strict schema enforcement. E.g. by querying only parts of the schema.
 */
// export type L_Account = L_Document & {
// 	user?: User;
// 	provider?: string;
// 	providerUserId?: string;
// };

/**
 * *************************
 * ZOD
 * *************************
 */

/**
 * d_v_Account
 * Base Account schema without the user property
 */
export const base_d_v_Account = z.object({
	provider: z.string(),
	providerUserId: z.string()
});

// Function to create full User schema with the accounts property
export const create_d_v_Account = (
	d_v_userSchema: z.ZodType<any>,
	d_documentSchema: z.ZodType<any>
) =>
	d_documentSchema.and(
		base_d_v_Account.extend({
			user: d_v_userSchema.or(z.instanceof(DocumentReference))
		})
	);

/**
 * l_v_Account
 * Base Account schema without the user property
 */
export const base_l_v_Account = z.object({
	provider: z.string(),
	providerUserId: z.string()
});

// Function to create full User schema with the accounts property
export const create_l_v_Account = (
	l_v_userSchema: z.ZodType<any>,
	l_v_documentSchema: z.ZodType<any>
) =>
	l_v_documentSchema.and(
		base_l_v_Account.extend({
			user: l_v_userSchema
		})
	);
