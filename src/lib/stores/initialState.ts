import type { ConsequencePojo } from '$lib/types/consequence';
import type { EventPojo } from '$lib/types/event';
import type { MasterAnswerPojo } from '$lib/types/masterAnswer';
import type { MasterChapterPojo } from '$lib/types/masterChapter';
import type { MasterQuestionPojo } from '$lib/types/masterQuestion';
import type { UserPojo } from '$lib/types/user';

const initialConsequence: ConsequencePojo = {
	id: '',
	ttl: new Date(),
	actions: '',
	event: '',
	location: '',
	masterAnswer: '',
	masterChapter: '',
	name: '',
	nextEvents: []
};

const initialUser: UserPojo = {
	id: '',
	ttl: new Date(),
	firstName: '',
	lastName: '',
	account: ''
};

const initialEvent: EventPojo = {
	id: '',
	ttl: new Date(),
	name: '',
	masterQuestion: '',
	consequences: [],
	masterChapter: '',
	multipleReference: '',
	type: '',
	location: ''
};

const initialMasterQuestion: MasterQuestionPojo = {
	id: '',
	ttl: new Date(),
	title: '',
	explanation: '',
	answers: [],
	type: '',
	location: ''
};

const initialMasterAnswer: MasterAnswerPojo = {
	id: '',
	ttl: new Date(),
	title: '',
	examples: [],
	explanation: '',
	masterQuestion: '',
	formula: '',
	location: ''
};

const initialMasterChapter: MasterChapterPojo = {
	id: '',
	ttl: new Date(),
	title: '',
	parent: '',
	children: [],
	before: '',
	after: '',
	position: '',
	location: ''
};

export const initialState = {
	Consequence: initialConsequence,
	Event: initialEvent,
	User: initialUser,
	MasterQuestion: initialMasterQuestion,
	MasterAnswer: initialMasterAnswer,
	MasterChapter: initialMasterChapter
};
