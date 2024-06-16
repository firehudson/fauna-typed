import { DocumentReference, Module, TimeStub } from 'fauna';

import { z } from 'zod';
import { type } from 'arktype';
import type { Account, AccountPojo, AccountProperties } from './account';
import { Document, type DocumentPojo, type id, type DocumentProperties } from './fauna';
import { deleteObject, replaceObject, updateObject } from '../stores/store-document.svelte';

const COLL_NAME = 'User';
const STORE_NAME = 'USER_STORE';

/**
 * User without Functions
 */
type UserBaseProperties = {
	[K in keyof User as User[K] extends Function ? never : K]: User[K];
};
export type UserProperties = Omit<UserBaseProperties, 'account' | 'ts'> &
	DocumentProperties & {
		account?: AccountProperties | id;
	};

export class User extends Document {
	firstName!: string;
	lastName!: string;
	account?: Account;

	constructor(doc: UserProperties) {
		super(doc);
		// Assign the document properties to the instance
		const { id, ts, ttl, coll, ...remainingProps } = doc;
		Object.assign(this, remainingProps);
		this.coll = COLL_NAME;
	}

	update(user: Omit<Partial<UserProperties>, 'id' | 'coll'>): void {
		updateObject(this.id, user);
	}

	replace(user: Omit<UserProperties, 'id' | 'coll'>): void {
		replaceObject(this.id, user);
	}

	delete(): void {
		deleteObject(this.id);
	}

	toObject(): UserPojo {
		const userPojo: UserPojo = {
			id: this.id,
			coll: this.coll,
			ts: this.ts,
			ttl: this.ttl,
			firstName: this.firstName,
			lastName: this.lastName
		};

		if (this.account) {
			// userPojo.account = this.account.map((account) => account.toObject());
			userPojo.account = this.account.toObject();
		}

		return userPojo;
	}
}

/**
 * TODO: Eventually we can get rid also from UserPojo if we ensure, that UserProperties has only PoJo Objects
 */
export type UserPojo = DocumentPojo & {
	firstName?: string;
	lastName?: string;
	account?: AccountPojo;
};

/**
 * `Q` stand for `Query`
 *
 * Same as `User` but references can be of type Object or DocumentReference
 *
 * Should be used if there is a need to work with document references
 */
// export type Q_User = Omit<User, 'accounts'> & {
// 	accounts?: Account[] | DocumentReference[];
// };

/**
 * *************************
 * ZOD
 * *************************
 */

// Base User schema without the accounts property
export const base_d_v_User = z.object({
	name: z.string()
});

// Function to create full User schema with the accounts property
export const create_d_v_User = (
	d_v_AccountSchema: z.ZodType<any>,
	d_v_userSchema: z.ZodType<any>
) =>
	d_v_userSchema.and(
		base_d_v_User.extend({
			accounts: z.array(d_v_AccountSchema).optional()
		})
	);

// Base User schema without the accounts property
export const base_l_v_User = z.object({
	name: z.string().optional(),
	update: z.function().returns(z.promise(z.void())),
	replace: z.function().returns(z.promise(z.void()))
});

// Function to create full User schema with the accounts property
export const create_l_v_User = (
	l_v_AccountSchema: z.ZodType<any>,
	l_v_userSchema: z.ZodType<any>
) =>
	l_v_userSchema.and(
		base_l_v_User.extend({
			accounts: z.array(l_v_AccountSchema).optional()
		})
	);
