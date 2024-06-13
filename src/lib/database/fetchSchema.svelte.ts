const schema = {
	data: [
		{
			name: 'User',
			fields: {
				firstName: {
					signature: 'String'
				},
				lastName: {
					signature: 'String'
				},
				account: {
					signature: 'Ref<Account>?'
				}
			}
		},
		{
			name: 'Account',
			fields: {
				user: {
					signature: 'Ref<User>'
				},
				provider: {
					signature: 'String?'
				},
				providerUserId: {
					signature: 'String?'
				}
			}
		}
	]
};

export const fetchSchema = async () => {
	const data = await schema.data;
	return data;
};
