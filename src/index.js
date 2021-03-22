import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import 'assets/css/global.scss';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import App from 'app';
import * as serviceWorker from 'serviceWorker';
const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#2064d8', // This is an orange looking color
		},
		secondary: {
			main: '#2064d8', //Another orange-ish color
		},
	},
});
ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<App />
	</MuiThemeProvider>,
	document.getElementById('root'),
);

serviceWorker.unregister();
