import axios from 'axios';
import config from 'constants/config';

const authApi = axios.create({
	baseURL: config.API_ROOT_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

authApi.interceptors.request.use(
	(config) => {
		config.headers.Authorization = `Bearer ${window['localStorage'].getItem(
			'accessToken',
		)}`;
		return config;
	},
	(error) => {
		return Promise.reject(error.response);
	},
);

authApi.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response && error.response.status === 401) {
			window['localStorage'].clear();
			window['location'] = '/login';
		} else {
			return Promise.reject(error.response);
		}
	},
);

export default authApi;
