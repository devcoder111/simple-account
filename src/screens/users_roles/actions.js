import { USER } from 'constants/types';
import { authApi } from 'utils';

export const getRoleList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/user/getrole`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: USER.ROLE_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getModuleList = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/roleModule/getModuleListByRoleCode?roleCode=${id}`,
		};

		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
