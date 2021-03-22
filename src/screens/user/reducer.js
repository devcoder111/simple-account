import { USER } from 'constants/types';

const initState = {
	user_list: [],
	role_list: [],
	company_type_list: [],
};

const UserReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case USER.USER_LIST:
			return {
				...state,
				user_list: Object.assign([], payload),
			};

		case USER.ROLE_LIST:
			return {
				...state,
				role_list: Object.assign([], payload),
			};

		case USER.COMPANY_TYPE_LIST:
			return {
				...state,
				company_type_list: Object.assign([], payload),
			};

		default:
			return state;
	}
};

export default UserReducer;
