import { authFileUploadApi } from 'utils';
import {
	// api,
	authApi,
} from 'utils';

export const createTransaction = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transaction/save',
			data: obj,
		};
		return authFileUploadApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTransactionCategoryListForExplain = (id, bankId) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/reconsile/getTransactionCat?chartOfAccountCategoryId=${id}&bankId=${bankId}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
