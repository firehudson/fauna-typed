import { Client, fql, type DocumentT, type QueryValueObject } from 'fauna';
// import { FAUNA_ADMIN_KEY } from '$env/static/private';
// import { PUBLIC_FAUNA_ADMIN_KEY } from '$env/static/public';

/**
 * TODO: Initialize client
 * - set API secret
 * - activate if we should persist the store as local storage
 */

const client = new Client({
	// secret: FAUNA_ADMIN_KEY
	secret: ''
});

// Get a unique string-encoded 64-bit integer as string that is unique across all Fauna databases.
const newId = async (): Promise<string> => {
	try {
		const { data } = await client.query<string>(fql`newId()`);
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Fetches a document from Fauna and returns it.
 * @param {string} collection
 * @param {string} id
 * @returns {T}
 * @example
 * ```ts
 * await fetchDocument<User>('User', '4122431124')
 * ```
 */
export async function fetchDocument<T extends QueryValueObject>(
	collection: string,
	id: string
): Promise<T | undefined> {
	const query = fql`Collection(${collection}).byId(${id})`;

	return (await client.query<DocumentT<T>>(query)).data;
}

export { client, newId, fql };
