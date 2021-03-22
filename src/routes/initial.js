import { LogIn, ResetPassword, Register, LogInTwo } from 'screens';

const initialRoutes = [
	{
		path: '/login',
		name: 'LogIn',
		component: LogIn.screen,
	},
	{
		path: '/login-two',
		name: 'LogInTwo',
		component: LogInTwo,
	},
	{
		path: '/reset-password',
		name: 'Reset Password',
		component: ResetPassword.screen,
	},
	{
		path: '/register',
		name: 'Register',
		component: Register.screen,
	},
	{
		redirect: true,
		path: '/',
		pathTo: '/login',
		name: 'Initial',
	},
];

export default initialRoutes;
