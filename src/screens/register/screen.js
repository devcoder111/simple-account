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
	Row,
	FormGroup,
	Label,
} from 'reactstrap';
import Select from 'react-select';
import { Message } from 'components';
import { selectCurrencyFactory } from 'utils';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthActions, CommonActions } from 'services/global';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './style.scss';
import logo from 'assets/images/brand/logo.png';

const mapStateToProps = (state) => {
	return {
		version: state.common.version,
		universal_currency_list :state.common.universal_currency_list,
	};
};
const eye = require('assets/images/settings/eye.png');
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
const options = [
	{ value: 'chocolate', label: 'Chocolate' },
	{ value: 'strawberry', label: 'Strawberry' },
	{ value: 'vanilla', label: 'Vanilla' },
];
class Register extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPasswordShown: false,
			alert: null,
			currencyList: [
			],
			success: false,
			initValue: {
				companyName: '',
				currencyCode: 150,
				companyTypeCode: '',
				industryTypeCode: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
				timeZone: '',
			},
			userDetail: false,
			show: false,
			togglePassword: '***********',
			loading: false,
			timezone: [],
		};
	}

	componentDidMount = () => {
		this.getInitialData();
	};

	getInitialData = () => {
		this.props.authActions.getTimeZoneList().then((response) => {
			let output = response.data.map(function (value) {
				return { label: value, value: value };
			});
			this.setState({ timezone: output });
		});
		this.props.authActions.getCurrencyList();
		this.props.authActions.getCompanyCount().then((response) => {
			if (response.data > 0) {
				this.props.history.push('/login');
			}
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
	handleChange = (key, val) => {
		this.setState({
			[key]: val,
		});
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ loading: true });
		const {
			companyName,
			currencyCode,
			companyTypeCode,
			industryTypeCode,
			firstName,
			lastName,
			email,
			password,
			timezone,
		} = data;
		let obj = {
			companyName: companyName,
			currencyCode: currencyCode ? currencyCode : '',
			companyTypeCode: companyTypeCode,
			industryTypeCode: industryTypeCode,
			firstName: firstName,
			lastName: lastName,
			email: email,
			password: password,
			timeZone: timezone,
		};
		let formData = new FormData();
		for (var key in this.state.initValue) {
			formData.append(key, data[key]);
		}
		this.props.authActions
			.register(formData)
			.then((res) => {
				this.setState({ loading: true });
				toast.success('Register Successfully please log in to continue', {
					position: toast.POSITION.TOP_RIGHT,
				});
				console.log(this.state.initValue.email);
				this.setState({
					userDetail: true,
					userName: email,
					password: password,
				});
				// setTimeout(() => {
				// 	this.props.history.push('/login');
				// }, 3000);
			})
			.catch((err) => {
				this.setState({ loading: true });
				toast.error(
					err && err.data
						? 'Log in failed. Please try again'
						: 'Something Went Wrong',
					{
						position: toast.POSITION.TOP_RIGHT,
					},
				);
			});
	};

	render() {
		const { isPasswordShown } = this.state;
		const customStyles = {
			control: (base, state) => ({
				...base,
				flex: '1 1 auto',
				borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
				boxShadow: state.isFocused ? null : null,
				'&:hover': {
					borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
				},
			}),
		};
		const { initValue, currencyList, userDetail, timezone } = this.state;
		const {universal_currency_list} = this.props;
		return (
			<div className="log-in-screen">
				<ToastContainer
				 autoClose={1700} 
				closeOnClick
            	draggable				
				/>
				<div className="animated fadeIn">
					<div className="app flex-row align-items-center">
						<Container>
							{userDetail === false && (
								<Row className="justify-content-center">
									<Col md="8">
										<CardGroup>
											<Card className="p-4">
												<CardBody>
													<div className="logo-container">
														<img
															src={logo}
															alt="logo"
															style={{ width: '226px' }}
														/>
													</div>
													<Formik
														initialValues={initValue}
														onSubmit={(values, { resetForm }) => {
															this.handleSubmit(values, resetForm);
														}}
														validationSchema={Yup.object().shape({
															companyName: Yup.string().required(
																'Company name is required',
															),
															currencyCode: Yup.string().required(
																'Currency is required',
															),
															firstName: Yup.string().required(
																'First Name is required',
															),
															lastName: Yup.string().required(
																'Last Name is required',
															),
															email: Yup.string()
																.required('Email is Required')
																.email('Invalid Email'),
															timeZone: Yup.string().required(
																'Time Zone is Required',
															),
															password: Yup.string()
																.required('Please Enter your password')
																.matches(
																	/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
																	'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character',
																),
															confirmPassword: Yup.string()
																.required('Please Confirm Password')
																.oneOf(
																	[Yup.ref('password'), null],
																	'Passwords must match',
																),
														})}
													>
														{(props) => {
															return (
																<Form onSubmit={props.handleSubmit}>
																	{/* <h1>Log In</h1> */}
																	<div className="registerScreen">
																		<h2 className="">Register</h2>
																		<p>Enter your details below to register</p>
																	</div>
																	<Row>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="companyName">
																					<span className="text-danger">*</span>
																					Company Name
																				</Label>
																				<Input
																					type="text"
																					maxLength="50"
																					id="companyName"
																					name="companyName"
																					placeholder="Enter Company Name"
																					value={props.values.account_name}
																					onChange={(option) => {
																						props.handleChange('companyName')(
																							option,
																						);
																					}}
																					className={
																						props.errors.companyName &&
																						props.touched.companyName
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.companyName &&
																					props.touched.companyName && (
																						<div className="invalid-feedback">
																							{props.errors.companyName}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="currencyCode">
																					<span className="text-danger">*</span>
																					Currency
																				</Label>
																				<Select
																					styles={customStyles}
																					id="currencyCode"
																					name="currencyCode"
																					options={
																						universal_currency_list
																							? selectCurrencyFactory.renderOptions(
																									'currencyName',
																									'currencyCode',
																									universal_currency_list,
																									'Currency',
																							  )
																							: []
																					}
																					value={
																						universal_currency_list &&
																						selectCurrencyFactory
																							.renderOptions(
																								'currencyName',
																								'currencyCode',
																								universal_currency_list,
																								'Currency',
																							)
																							.find(
																								(option) =>
																									option.value ===
																									+props.values.currencyCode,
																							)
																					}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange(
																								'currencyCode',
																							)(option.value);
																						} else {
																							props.handleChange(
																								'currencyCode',
																							)('');
																						}
																					}}
																					className={
																						props.errors.currencyCode &&
																						props.touched.currencyCode
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.currencyCode &&
																					props.touched.currencyCode && (
																						<div className="invalid-feedback">
																							{props.errors.currencyCode}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="firstName">
																					<span className="text-danger">*</span>
																					First Name
																				</Label>
																				<Input
																					type="text"
																					maxLength="50"
																					id="firstName"
																					name="firstName"
																					placeholder="Enter First Name"
																					value={props.values.firstName}
																					onChange={(option) => {
																						props.handleChange('firstName')(
																							option,
																						);
																					}}
																					className={
																						props.errors.firstName &&
																						props.touched.firstName
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.firstName &&
																					props.touched.firstName && (
																						<div className="invalid-feedback">
																							{props.errors.firstName}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="lastName">
																					<span className="text-danger">*</span>
																					Last Name
																				</Label>
																				<Input
																					type="text"
																					maxLength="50"
																					id="lastName"
																					name="lastName"
																					placeholder="Enter Last Name"
																					value={props.values.lastName}
																					onChange={(option) => {
																						props.handleChange('lastName')(
																							option,
																						);
																					}}
																					className={
																						props.errors.lastName &&
																						props.touched.lastName
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.lastName &&
																					props.touched.lastName && (
																						<div className="invalid-feedback">
																							{props.errors.lastName}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="email">
																					<span className="text-danger">*</span>
																					Email Address
																				</Label>
																				<Input
																					type="text"
																					id="email"
																					name="email"
																					placeholder="Enter Email Address"
																					value={props.values.email}
																					onChange={(option) => {
																						props.handleChange('email')(option);
																					}}
																					className={
																						props.errors.email &&
																						props.touched.email
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.email &&
																					props.touched.email && (
																						<div className="invalid-feedback">
																							{props.errors.email}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="timeZone">
																					<span className="text-danger">*</span>
																					Time Zone Preference
																				</Label>
																				<Select
																					styles={customStyles}
																					id="timeZone"
																					name="timeZone"
																					options={timezone ? timezone : []}
																					value={props.values.timezone}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('timeZone')(
																								option.value,
																							);
																						} else {
																							props.handleChange('timeZone')(
																								'',
																							);
																						}
																					}}
																					className={
																						props.errors.timeZone &&
																						props.touched.timeZone
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.timeZone &&
																					props.touched.timeZone && (
																						<div className="invalid-feedback">
																							{props.errors.timeZone}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="email">
																					<span className="text-danger">*</span>
																					Password
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
																			props.touched.password ? (
																				<div className="invalid-feedback">
																					{props.errors.password}
																				</div>
																			) : (
																				<span className="password-msg">
																					Must Contain 8 Characters, One
																					Uppercase, One Lowercase, One Number
																					and one special case Character.
																				</span>
																			)}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="email">
																					<span className="text-danger">*</span>
																					Confirm Password
																				</Label>
																				<Input
																					type="password"
																					id="confirmPassword"
																					name="confirmPassword"
																					placeholder="Confirm Password"
																					onChange={(option) => {
																						props.handleChange(
																							'confirmPassword',
																						)(option);
																					}}
																					value={props.values.confirmPassword}
																					className={
																						props.errors.confirmPassword &&
																						props.touched.confirmPassword
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.confirmPassword &&
																					props.touched.confirmPassword && (
																						<div className="invalid-feedback">
																							{props.errors.confirmPassword}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row>
																		<Col className="text-center">
																			<Button
																				type="submit"
																				name="submit"
																				color="primary"
																				disabled={this.state.loading}
																				className="btn-square mr-3 mt-3 "
																				style={{ width: '200px' }}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				{this.state.loading
																					? 'Creating...'
																					: 'Register'}
																			</Button>
																		</Col>
																	</Row>
																	{/* <Row>
																		<Col>
																			<Button
																				type="button"
																				color="link"
																				className="px-0"
																				onClick={() => {
																					this.props.history.push('/login');
																				}}
																				style={{ marginTop: '-10px' }}
																			>
																				Back
																			</Button>
																		</Col>
																	</Row> */}
																</Form>
															);
														}}
													</Formik>
												</CardBody>
											</Card>
										</CardGroup>
									</Col>
								</Row>
							)}
							{userDetail === true &&
								// <Row className="justify-content-center">
								// 	<Col md="8">
								// 		<CardGroup>
								// 			<Card className="p-4">
								// 				<CardBody>
								// 					<div className="logo-container">
								// 						<img
								// 							src={logo}
								// 							alt="logo"
								// 							style={{ width: '226px' }}
								// 						/>
								// 					</div>
								// 					<div className="registerScreen">
								// 						<h2 className="">Login Details</h2>
								// 						<p>Please save Username and Password to login</p>
								// 					</div>
								// 					<Row>
								// 						<Col md="12">
								// 							<FormGroup className="mb-3">
								// 								<Label htmlFor="lastName">User Name</Label>
								// 								<div style={{ fontWeight: 'bold' }}>
								// 									{this.state.userName}
								// 								</div>
								// 							</FormGroup>
								// 						</Col>
								// 						<Col md="12">
								// 							<FormGroup className="mb-3">
								// 								<Label htmlFor="lastName">Password</Label>
								// 								<div
								// 									style={{ fontWeight: 'bold' }}
								// 									className="d-flex align-items-center"
								// 								>
								// 									{this.state.show
								// 										? this.state.password
								// 										: this.state.togglePassword}
								// 									<span
								// 										className="ml-1"
								// 										style={{ cursor: 'pointer' }}
								// 									>
								// 										<i
								// 											className="fa fa-eye"
								// 											onClick={() => {
								// 												this.setState({
								// 													show: !this.state.show,
								// 												});
								// 											}}
								// 											aria-hidden="true"
								// 										></i>
								// 									</span>
								// 								</div>
								// 							</FormGroup>
								// 						</Col>
								// 					</Row>
								// 					<Row>
								// 						<Col className="mt-3">
								// 							<p className="r-btn">
								// 								Saved Credentials? Now{' '}
								// 								<span
								// 									onClick={() => {
								// 										this.props.history.push('/login');
								// 									}}
								// 								>
								// 									Login
								// 								</span>
								// 							</p>
								// 						</Col>
								// 					</Row>
								// 				</CardBody>
								// 			</Card>
								// 		</CardGroup>
								// 	</Col>
								// </Row>
								this.props.history.push('/login')}
						</Container>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
