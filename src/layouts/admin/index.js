import React, { Suspense } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Container } from 'reactstrap';
import {
	AppAside,
	AppBreadcrumb,
	AppFooter,
	AppHeader,
	AppSidebar,
	AppSidebarFooter,
	AppSidebarForm,
	AppSidebarHeader,
	AppSidebarMinimizer,
	AppSidebarNav,
} from '@coreui/react';
import { ToastContainer, toast } from 'react-toastify';

import { adminRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';

import PrivateRoute from '../private';

import navigation from 'constants/navigation';

import { Aside, Header, Footer, Loading } from 'components';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		user_list: state.user.user_list,
		version: state.common.version,
		user_role_list: state.common.user_role_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class AdminLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		if (!window['localStorage'].getItem('accessToken')) {
			this.props.history.push('/login');
		} else {
			this.props.authActions
				.checkAuthStatus()
				.then((response) => {
					this.props.commonActions.getRoleList(response.data.role.roleCode);
				})
				.catch((err) => {
					this.props.authActions.logOut();
					this.props.history.push('/login');
				});
			this.props.commonActions.getSimpleVATVersion();
			this.props.commonActions.getCurrencyList();
			const toastifyAlert = (status, message) => {
				if (!message) {
					message = 'Unexpected Error';
				}
				if (status === 'success') {
					toast.success(message, {
						position: toast.POSITION.TOP_RIGHT,
					});
				} else if (status === 'error') {
					toast.error(message, {
						position: toast.POSITION.TOP_RIGHT,
					});
				} else if (status === 'warn') {
					toast.warn(message, {
						position: toast.POSITION.TOP_RIGHT,
					});
				} else if (status === 'info') {
					toast.info(message, {
						position: toast.POSITION.TOP_RIGHT,
					});
				}
			};
			this.props.commonActions.setTostifyAlertFunc(toastifyAlert);
		}
	}

	render() {
		const containerStyle = {
			zIndex: 1999,
			closeOnClick: true,
			draggable: true,
			
		};
		const { user_role_list, user_list } = this.props;
		var arr = [];

		function parentPathPresent(arr, name) {
			return arr.items.find((path) => path.name == name);
		}

		function filterPaths(arr, moduleName) {

			navigation.items.forEach((item) => {
			 	if (item.children) {
			 		var childPath = item.children.find((child) => {
			 			return child.path == moduleName;
					 });
					 
			 		if (childPath) {
			 			var existingPath = parentPathPresent(arr, item.name);
			 			if (existingPath) {
			 				existingPath['children'].push(childPath);
			 			} else {
			 				arr.items.push({
			 					name: item.name,
			 					url: item.url,
			 					icon: item.icon,
			 					children: [childPath],
			 				});
			 			}
			 		}
			 	}
			 	if (moduleName === 'Dashboard' && item.name === 'Dashboard') {
					arr.items.push({
			 			name: item.name,
			 			url: item.url,
			 			icon: item.icon,
			 		});
				 }
				 if (moduleName === 'Inventory' && item.name === 'Inventory') {
					arr.items.push({
			 			name: item.name,
			 			url: item.url,
			 			icon: item.icon,
			 		});
				 }
				 if (moduleName === 'Template' && item.name === 'Template') {
					arr.items.push({
			 			name: item.name,
			 			url: item.url,
			 			icon: item.icon,
			 		});
				 }
				 
			});
		}

		var finalArray = { items: [] };

		user_role_list.forEach((p) => {
			filterPaths(finalArray, p.moduleName);
		});

		var correctSequence = navigation.items.map(item => item.name)
		finalArray.items = correctSequence.reduce((arr, name) => {
			let ele = finalArray.items.find(item => item.name == name)
			if (ele) arr.push(ele);
			return arr;
		}, [])
	

		return (
			<div className="admin-container">
				<div className="app">
					<AppHeader fixed>
						<Suspense fallback={Loading()}>
							<Header {...this.props} />
						</Suspense>
					</AppHeader>
					<div className="app-body">
						<AppSidebar fixed display="lg">
							<AppSidebarHeader />
							<AppSidebarForm />
							<Suspense fallback={Loading()}>
								<AppSidebarNav navConfig={finalArray} {...this.props} />
							</Suspense>
							<AppSidebarMinimizer />
							<AppSidebarFooter />
						</AppSidebar>
						<main className="main">
							<div className="breadcrumb-container">
								<AppBreadcrumb appRoutes={adminRoutes} />
							</div>
							<Container fluid className="p-20">
								<Suspense fallback={Loading()}>
									<ToastContainer
										position="top-right"
										autoClose={1700}
										style={containerStyle}
										closeOnClick
            							draggable
									/>
									<Switch>
										{adminRoutes.map((prop, key) => {
											if (prop.redirect){
												return (
													<Redirect
														from={prop.path}
														to={prop.pathTo}
														key={key}
													/>
												);
											}
											return (
												<PrivateRoute
													path={prop.path}
													name={prop.name}
													node={user_role_list}
													component={prop.component}
													key={key}
													exact
												/>
											);
										})}
									</Switch>
								</Suspense>
							</Container>
						</main>
						<AppAside>
							<Suspense fallback={Loading()}>
								<Aside />
							</Suspense>
						</AppAside>
					</div>
					<AppFooter>
						<Suspense fallback={Loading()}>
							<Footer {...this.props} />
						</Suspense>
					</AppFooter>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLayout);
