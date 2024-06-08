import { d_v_Document, d_v_DocumentReference, d_v_Page, l_v_Document } from './fauna';
import { create_d_v_Account, create_l_v_Account } from './account';
import { base_d_v_User, create_d_v_User, base_l_v_User, create_l_v_User } from './user';

const d_v_Account = create_d_v_Account(base_d_v_User, d_v_Document);
const d_v_User = create_d_v_User(d_v_Account, d_v_Document);

const s_v_Account = create_l_v_Account(base_l_v_User, l_v_Document);
const s_v_User = create_l_v_User(s_v_Account, l_v_Document);

/**
 * Runtime type validators.
 *
 * `l` has validators, to check the `loose` documents
 *
 * `d` has validators, to check the `database` documents
 */
export const v = {
	s: {
		user: s_v_User,
		account: s_v_Account
	},
	d: {
		page: d_v_Page,
		documentReference: d_v_DocumentReference,
		user: d_v_User,
		account: d_v_Account
	}
};
