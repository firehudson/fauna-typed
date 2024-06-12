import type { PageLoad } from './$types';

export const load = (async (params) => {
	return { props: { collection: params.slug } };
	return {};
}) satisfies PageLoad;
