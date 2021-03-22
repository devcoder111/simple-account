import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Card,
	CardBody,
	CardGroup,
	Col,
	Container,
	Form,
	Input,
	FormGroup,
	Label,
	Row,
} from 'reactstrap';

import { AuthActions, CommonActions } from 'services/global';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Formik } from 'formik';
import * as Yup from 'yup';
import './style.scss';
import logo from 'assets/images/brand/logo.png';


const mapStateToProps = (state) => {
	return {
		version: state.common.version,
	};
};

const eye = require('assets/images/settings/eye.png');
const noteye = require('assets/images/settings/noteye.png')
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class LogIn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPasswordShown: false,
			initValue: {
				username: '',
				password: '',
			},
			alert: null,
			openForgotPasswordModal: false,
			companyCount: 1,
			loading: false,
		};
	}

	componentDidMount = () => {
		this.getInitialData();
	};

	getInitialData = () => {
		this.props.authActions.getCompanyCount().then((response) => {
			//console.log(response.data);
			if (response.data < 1) {
				this.props.history.push('/register');
			}
			this.setState({ companyCount: response.data }, () => {});
		});
	};

	handleChange = (key, val) => {
		this.setState({
			[key]: val,
		});
	};

	// togglePasswordVisiblity = () => {
	// 	this.setState({
	// 		passwordShown: !this.state.passwordShown,
	// 	});
	// };

	togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	  };

	handleSubmit = (data, resetForm) => {
		this.setState({ loading: true });
		const { username, password } = data;
		let obj = {
			username,
			password,
		};
		this.props.authActions
			.logIn(obj)
			.then((res) => {
				toast.success('Log in Succesfully', {
					position: toast.POSITION.TOP_RIGHT,
				});

				this.props.history.push('/admin');
				this.setState({ loading: false });
			})
			.catch((err) => {
				this.setState({ loading: false });
				toast.error(
					err && err.data
						? 'Log in failed. '
						: 'Something Went Wrong',
					{
						position: toast.POSITION.TOP_RIGHT,
					},
				);
			});
	};

	openForgotPasswordModal = () => {
		this.setState({ openForgotPasswordModal: true });
	};

	closeForgotPasswordModal = (res) => {
		this.setState({ openForgotPasswordModal: false });
	};

	render() {
		const { isPasswordShown } = this.state;
		const { initValue } = this.state;
		return (
			<div className="log-in-screen">
				<ToastContainer 	
				 position="top-right"
				 autoClose={1700}									
				closeOnClick
            	draggable/>
				<div className="animated fadeIn ">
				<div className="main-banner_container col-md-12 flex">
													{/* <img src={login_bg} alt="login_bg" className="login_bg" /> */}
													{/* <img src={login_banner} alt="login_banner" className="login_banner"/> */}
												</div>
					<div className="app flex-row align-items-center ">
						<Container>
							<Row className="justify-content-center">
								<Col md="6">{this.state.alert}</Col>
							</Row>
							<Row className="justify-content-center ">
								<Col md="6">
								<CardGroup>
										<Card className="p-4">
											<CardBody>
										<div>
											
												<div className="logo-container">
													<img src={logo} alt="logo" />
												</div>
												<Formik
													initialValues={initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values, resetForm);
													}}
													validationSchema={Yup.object().shape({
														username: Yup.string().required(
															'Email is Required',
														),
														password: Yup.string().required(
															'Please Enter your password',
														),
													})}
												>
													{(props) => {
														return (
															<Form onSubmit={props.handleSubmit}>
																{/* <h1>Log In</h1> */}
																<div className="registerScreen">
																	<h2 className="">Login</h2>
											  						<p>Enter your details below to continue</p>
																</div>
																<Row>
																	<Col lg={12}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="username"><b>
																				Email</b>
																			</Label>
																			<Input
																				type="text"
																				id="username"
																				name="username"
																				placeholder="Enter Email Id"
																				value={props.values.username}
																				onChange={(option) => {
																					props.handleChange('username')(
																						option,
																					);
																				}}
																				className={
																					props.errors.username &&
																					props.touched.username
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.username &&
																				props.touched.username && (
																					<div className="invalid-feedback">
																						{props.errors.username}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col lg={12}>
																
																		<FormGroup className="mb-3">
																	
																			<Label htmlFor="email">
																			<b>	Password</b>
																			</Label>
																		<div>	
																			<Input
																				type={
																					this.state.isPasswordShown
																						? 'text'
																						: 'password'
																				}
																				id="password"
																				name="password"
																				placeholder="Enter password"
																				value={props.values.password}
																				onChange={(option) => {
																					props.handleChange('password')(
																						option,
																					);
																				}}
																				className={
																					props.errors.password &&
																					props.touched.password
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		<i   className={`fa ${ isPasswordShown ? "fa-eye-slash" : "fa-eye" } password-icon fa-lg`}
																		onClick={this.togglePasswordVisiblity}
																	>
																		{/* <img 
																			src={eye}
																			style={{ width: '20px' }}
																		/> */}
																		</i>
																		</div>	
																			{props.errors.password &&
																				props.touched.password && (
																					<div className="invalid-feedback">
																						{props.errors.password}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col>
																		<Button
																			type="button"
																			color="link"
																			className="px-0"
																			onClick={() => {
																				this.props.history.push(
																					'/reset-password',
																				);
																			}}
																			style={{ marginTop: '-10px' }}
																		>
																			Forgot password?
																		</Button>
																	</Col>
																</Row>
																<Row>
																	<Col className="text-center">
																		<Button
																			color="primary"
																			type="submit"
																			className="px-4 btn-square mt-3"
																			style={{ width: '200px' }}
																			disabled={this.state.loading}
																		>
																			<i className="fa fa-sign-in" /> Log In
																		</Button>
																	</Col>
																</Row>
																{this.state.companyCount < 1 && (
																	<Row>
																		<Col className="mt-3">
																			<p className="r-btn">
																				Don't have an account?{' '}
																				<span
																					onClick={() => {
																						this.props.history.push(
																							'/register',
																						);
																					}}
																				>
																					Register Here
																				</span>
																			</p>
																		</Col>
																	</Row>
																)}
															</Form>
														);
													}}
												</Formik>
											
										</div>
										</CardBody>
										</Card>
									</CardGroup>
								</Col>
							</Row>
						</Container>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
