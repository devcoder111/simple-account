import { authApi } from 'utils';

export const getProfitAndLossReport = (postData) => {
	const { startDate, endDate } = postData;
	let url = `/rest/financialReport/profitandloss?startDate=${startDate}&endDate=${endDate}`;

	return (dispatch) => {
		let data = {
			method: 'get',
			url,
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

export const getTrialBalanceReport = (postData) => {
	const { startDate, endDate } = postData;
	let url = `/rest/financialReport/trialBalanceReport?endDate=${endDate}`;

	return (dispatch) => {
		let data = {
			method: 'get',
			url,
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

export const getBalanceReport = (postData) => {
	const { startDate, endDate } = postData;
	let url = `/rest/financialReport/balanceSheet?endDate=${endDate}`;

	return (dispatch) => {
		let data = {
			method: 'get',
			url,
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
	export const getVatReturnsReport = (postData) => {
		const { startDate, endDate } = postData;
		let url = `/rest/financialReport/vatReturnReport?startDate=${startDate}&endDate=${endDate}`;
	
		return (dispatch) => {
			let data = {
				method: 'get',
				url,
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

