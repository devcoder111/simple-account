import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
} from 'reactstrap';
import Select from 'react-select';
// import ImagesUploader from 'react-images-uploader'
import { Loader, ImageUploader } from 'components';
import {
	selectOptionsFactory,
	cryptoService,
	selectCurrencyFactory,
} from 'utils';

import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ProfileActions from './actions';
import { CommonActions, AuthActions } from 'services/global';
import './style.scss';

import 'react-datepicker/dist/react-datepicker.css';
// import 'react-images-uploader/styles.css'
// import 'react-images-uploader/font.css'

import './style.scss';
import PhoneInput from 'react-phone-number-input';

const mapStateToProps = (state) => {
	return {
		currency_list: state.profile.currency_list,
		country_list: state.profile.country_list,
		industry_type_list: state.profile.industry_type_list,
		company_type_list: state.profile.company_type_list,
		role_list: state.profile.role_list,
		invoicing_state_list: state.profile.invoicing_state_list,
		company_state_list: state.profile.company_state_list,
	};
};
const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

const mapDispatchToProps = (dispatch) => {
	return {
		profileActions: bindActionCreators(ProfileActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			activeTab: new Array(2).fill('1'),
			userPhotoFile: [],
			userPhoto: [],
			companyLogo: [],
			companyLogoFile: [],
			initUserData: {},
			initCompanyData: {
				companyName: '',
				companyRegistrationNumber: '',
				vatRegistrationNumber: '',
				companyTypeCode: '',
				industryTypeCode: '',
				phoneNumber: '',
				emailAddress: '',
				website: '',
				invoicingAddressLine1: '',
				invoicingAddressLine2: '',
				invoicingAddressLine3: '',
				invoicingCity: '',
				invoicingStateRegion: '',
				invoicingPostZipCode: '',
				invoicingPoBoxNumber: '',
				invoicingCountryCode: '',
				currencyCode: '',
				companyAddressLine1: '',
				companyAddressLine2: '',
				companyAddressLine3: '',
				companyCity: '',
				companyStateRegion: '',
				companyPostZipCode: '',
				companyPoBoxNumber: '',
				companyCountryCode: '',
				companyExpenseBudget: '',
				companyRevenueBudget: '',
				dateFormat: '',
			},
			// companyId: '',
			imageState: true,
			flag: true,
			selectedStatus: false,
			isSame: false,
			companyAddress: {
				companyAddressLine1: '',
				companyAddressLine2: '',
				companyAddressLine3: '',
				companyCity: '',
				companyStateRegion: '',
				companyPostZipCode: '',
				companyPoBoxNumber: '',
				companyCountryCode: '',
			},
			timezone: [],
		};

		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			activeTab: newArray,
		});
		if (tab === '1') {
			if (
				this.state.userPhoto[0] &&
				this.state.userPhoto[0].indexOf('data') < 0
			) {
				this.setState({ imageState: true });
			} else {
				this.setState({ imageState: false });
			}
		} else {
			this.setState({ loading: true });
			this.getCompanyData();
		}
	};
	componentDidMount = () => {
		this.getUserData();
	};

	uploadUserImage = (picture, file) => {
		this.setState({
			userPhoto: picture,
			userPhotoFile: file,
			imageState: false,
		});
	};

	uploadCompanyImage = (picture, file) => {
		this.setState({
			companyLogo: picture,
			companyLogoFile: file,
			imageState: false,
		});
	};

	stopLoading = () => {
		this.setState({ loading: false });
	};

	getUserData = () => {
		this.props.authActions.getTimeZoneList().then((response) => {
			let output = response.data.map(function (value) {
				return { label: value, value: value };
			});
			this.setState({ timezone: output });
		});
		const userId = cryptoService.decryptService('userId');
		this.setState({
			loading: true,
		});
		if (userId) {
			this.props.profileActions
				.getUserById(userId)
				.then((res) => {
					// this.props.userActions.getRoleList();
					this.props.profileActions.getCurrencyList();
					this.props.profileActions.getCountryList();
					//this.props.profileActions.getIndustryTypeList();
					this.props.profileActions.getCompanyTypeList();
					this.props.profileActions.getRoleList();

					if (res.status === 200) {
						this.setState({
							initUserData: {
								firstName: res.data.firstName ? res.data.firstName : '',
								lastName: res.data.lastName ? res.data.lastName : '',
								email: res.data.email ? res.data.email : '',
								password: '',
								dob: res.data.dob
									? moment(res.data.dob, 'DD-MM-YYYY').toDate()
									: '',
								active: res.data.active ? res.data.active : '',
								// confirmPassword: '',
								roleId: res.data.roleId ? res.data.roleId : '',
								timezone: res.data.timeZone ? res.data.timeZone : '',
								// companyId: res.data.companyId ? res.data.companyId : '',
							},
							loading: false,
							selectedStatus: res.data.active ? true : false,
							userPhoto: res.data.profilePicByteArray
								? this.state.userPhoto.concat(res.data.profilePicByteArray)
								: [],
							// companyId: res.data.companyId ? res.data.companyId : ''
						});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.setState({ loading: false });
				});
		}
	};

	getStateList = (countryCode, type) => {
		this.props.profileActions.getStateList(countryCode, type);
	};

	handleUserSubmit = (data) => {
		const {
			firstName,
			lastName,
			email,
			dob,
			password,
			roleId,
			timezone,
		} = data;
		const { userPhotoFile } = this.state;
		const userId = cryptoService.decryptService('userId');

		let formData = new FormData();
		formData.append('id', userId);
		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		formData.append('dob', dob ? moment(dob).format('DD-MM-YYYY') : '');
		formData.append('active', this.state.selectedStatus);
		formData.append('timeZone', timezone ? timezone : '');
		formData.append('roleId', roleId ? roleId : '');

		if (password.length > 0) {
			formData.append('password ', password);
		}
		if (this.state.userPhotoFile.length > 0) {
			formData.append('profilePic', userPhotoFile[0]);
		}

		this.props.profileActions
			.updateUser(formData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'User Updated Successfully',
					);
					this.props.authActions.checkAuthStatus().catch((err) => {
						this.props.authActions.logOut();
						this.props.history.push('/login');
					});
					this.props.history.push('/admin/dashboard');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	getCompanyData = () => {
		// const {companyId} = this.state;
		this.props.profileActions
			.getCompanyById()
			.then((res) => {
				if (res.status === 200) {
					if (this.state.flag) {
						this.setState(
							{
								initCompanyData: {
									...this.state.initCompanyData,
									companyName: res.data.companyName ? res.data.companyName : '',
									companyRegistrationNumber: res.data.companyRegistrationNumber
										? res.data.companyRegistrationNumber
										: '',
									vatRegistrationNumber: res.data.vatRegistrationNumber
										? res.data.vatRegistrationNumber
										: '',
									companyTypeCode: res.data.companyTypeCode
										? res.data.companyTypeCode
										: '',
									industryTypeCode: res.data.industryTypeCode
										? res.data.industryTypeCode
										: '',
									phoneNumber: res.data.phoneNumber ? res.data.phoneNumber : '',
									emailAddress: res.data.emailAddress
										? res.data.emailAddress
										: '',
									website: res.data.website ? res.data.website : '',
									invoicingAddressLine1: res.data.invoicingAddressLine1
										? res.data.invoicingAddressLine1
										: '',
									invoicingAddressLine2: res.data.invoicingAddressLine2
										? res.data.invoicingAddressLine2
										: '',
									invoicingAddressLine3: res.data.invoicingAddressLine3
										? res.data.invoicingAddressLine3
										: '',
									invoicingCity: res.data.invoicingCity
										? res.data.invoicingCity
										: '',
									invoicingStateRegion: res.data.invoicingStateRegion
										? res.data.invoicingStateRegion
										: '',
									invoicingPostZipCode: res.data.invoicingPostZipCode
										? res.data.invoicingPostZipCode
										: '',
									invoicingPoBoxNumber: res.data.invoicingPoBoxNumber
										? res.data.invoicingPoBoxNumber
										: '',
									invoicingCountryCode: res.data.invoicingCountryCode
										? res.data.invoicingCountryCode
										: '',
									currencyCode: res.data.currencyCode
										? res.data.currencyCode
										: '',
									companyAddressLine1: res.data.companyAddressLine1
										? res.data.companyAddressLine1
										: '',
									companyAddressLine2: res.data.companyAddressLine2
										? res.data.companyAddressLine2
										: '',
									companyAddressLine3: res.data.companyAddressLine3
										? res.data.companyAddressLine3
										: '',
									companyCity: res.data.companyCity ? res.data.companyCity : '',
									companyStateRegion: res.data.companyStateRegion
										? res.data.companyStateRegion
										: '',
									companyPostZipCode: res.data.companyPostZipCode
										? res.data.companyPostZipCode
										: '',
									companyPoBoxNumber: res.data.companyPoBoxNumber
										? res.data.companyPoBoxNumber
										: '',
									companyCountryCode: res.data.companyCountryCode
										? res.data.companyCountryCode
										: '',
									companyExpenseBudget: res.data.companyExpenseBudget
										? res.data.companyExpenseBudget
										: '',
									companyRevenueBudget: res.data.companyRevenueBudget
										? res.data.companyRevenueBudget
										: '',
									dateFormat: res.data.dateFormat ? res.data.dateFormat : '',
								},
								companyLogo: res.data.companyLogoByteArray
									? this.state.companyLogo.concat(res.data.companyLogoByteArray)
									: [],
								loading: false,
								flag: false,
								isSame: res.data.isSame ? res.data.isSame : false,
							},
							() => {
								if (res.data.invoicingCountryCode) {
									this.getStateList(res.data.invoicingCountryCode, 'invoicing');
								}
								if (res.data.companyCountryCode) {
									this.getStateList(res.data.companyCountryCode, 'company');
								}
								if (this.state.isSame) {
									this.setState({
										companyAddress: {
											companyAddressLine1: res.data.invoicingAddressLine1
												? res.data.invoicingAddressLine1
												: '',
											companyAddressLine2: res.data.invoicingAddressLine2
												? res.data.invoicingAddressLine2
												: '',
											companyAddressLine3: res.data.invoicingAddressLine3
												? res.data.invoicingAddressLine3
												: '',
											companyCity: res.data.invoicingCity
												? res.data.invoicingCity
												: '',
											companyStateRegion: res.data.invoicingStateRegion
												? res.data.invoicingStateRegion
												: '',
											companyPostZipCode: res.data.invoicingPostZipCode
												? res.data.invoicingPostZipCode
												: '',
											companyPoBoxNumber: res.data.invoicingPoBoxNumber
												? res.data.invoicingPoBoxNumber
												: '',
											companyCountryCode: res.data.invoicingCountryCode
												? res.data.invoicingCountryCode
												: '',
										},
									});
								}
							},
						);
					} else {
						this.setState({
							loading: false,
						});
					}

					if (
						this.state.companyLogo[0] &&
						this.state.companyLogo[0].indexOf('data') < 0
					) {
						this.setState({
							imageState: true,
						});
					} else {
						this.setState({
							imageState: false,
						});
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({
					loading: false,
				});
			});
	};
	handleCompanySubmit = (data) => {
		const {
			companyName,
			companyRegistrationNumber,
			vatRegistrationNumber,
			companyTypeCode,
			industryTypeCode,
			phoneNumber,
			emailAddress,
			website,
			invoicingAddressLine1,
			invoicingAddressLine2,
			invoicingAddressLine3,
			invoicingCity,
			invoicingStateRegion,
			invoicingPostZipCode,
			invoicingPoBoxNumber,
			invoicingCountryCode,
			currencyCode,
			companyAddressLine1,
			companyAddressLine2,
			companyAddressLine3,
			companyCity,
			companyStateRegion,
			companyPostZipCode,
			companyPoBoxNumber,
			companyCountryCode,
			companyExpenseBudget,
			companyRevenueBudget,
			dateFormat,
		} = data;
		const { companyAddress, isSame } = this.state;
		let formData = new FormData();
		// formData.append("id", companyId);
		formData.append('companyName', companyName ? companyName : '');
		formData.append(
			'companyRegistrationNumber',
			companyRegistrationNumber ? companyRegistrationNumber : '',
		);
		formData.append(
			'vatRegistrationNumber',
			vatRegistrationNumber ? vatRegistrationNumber : '',
		);
		formData.append('companyTypeCode', companyTypeCode ? companyTypeCode : '');
		formData.append(
			'industryTypeCode',
			industryTypeCode ? industryTypeCode : '',
		);
		formData.append('phoneNumber', phoneNumber ? phoneNumber : '');
		formData.append('emailAddress', emailAddress ? emailAddress : '');
		formData.append('website', website ? website : '');
		formData.append(
			'companyExpenseBudget',
			companyExpenseBudget ? companyExpenseBudget : '',
		);
		formData.append(
			'companyRevenueBudget',
			companyRevenueBudget ? companyRevenueBudget : '',
		);
		formData.append(
			'invoicingAddressLine1',
			invoicingAddressLine1 ? invoicingAddressLine1 : '',
		);
		formData.append(
			'invoicingAddressLine2',
			invoicingAddressLine2 ? invoicingAddressLine2 : '',
		);
		formData.append(
			'invoicingAddressLine3',
			invoicingAddressLine3 ? invoicingAddressLine3 : '',
		);
		formData.append('invoicingCity', invoicingCity ? invoicingCity : '');
		formData.append(
			'invoicingStateRegion',
			invoicingStateRegion ? invoicingStateRegion : '',
		);
		formData.append(
			'invoicingPostZipCode',
			invoicingPostZipCode ? invoicingPostZipCode : '',
		);
		formData.append(
			'invoicingPoBoxNumber',
			invoicingPoBoxNumber ? invoicingPoBoxNumber : '',
		);
		formData.append(
			'invoicingCountryCode',
			invoicingCountryCode ? invoicingCountryCode : '',
		);
		formData.append('currencyCode', currencyCode ? currencyCode : '');
		formData.append('dateFormat', dateFormat ? dateFormat : '');
		formData.append(
			'companyAddressLine1',
			isSame ? companyAddress.companyAddressLine1 : companyAddressLine1,
		);
		formData.append(
			'companyAddressLine2',
			isSame ? companyAddress.companyAddressLine2 : companyAddressLine2,
		);
		formData.append(
			'companyAddressLine3',
			isSame ? companyAddress.companyAddressLine3 : companyAddressLine3,
		);
		formData.append(
			'companyCity',
			isSame ? companyAddress.companyCity : companyCity,
		);
		formData.append(
			'companyStateRegion',
			isSame ? companyAddress.companyStateRegion : companyStateRegion,
		);
		formData.append(
			'companyPostZipCode',
			isSame ? companyAddress.companyPostZipCode : companyPostZipCode,
		);
		formData.append(
			'companyPoBoxNumber',
			isSame ? companyAddress.companyPoBoxNumber : companyPoBoxNumber,
		);
		formData.append(
			'companyCountryCode',
			isSame ? companyAddress.companyCountryCode : companyCountryCode,
		);
		// formData.append("isSame", isSame);

		if (this.state.companyLogoFile.length > 0) {
			formData.append('companyLogo', this.state.companyLogoFile[0]);
		}
		this.props.profileActions
			.updateCompany(formData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Company Updated Successfully',
					);
					this.props.history.push('/admin/dashboard');
					this.props.commonActions.getCurrencyList();
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	render() {
		const { loading, isSame, timezone } = this.state;
		const {
			currency_list,
			country_list,
			industry_type_list,
			company_type_list,
			role_list,
			invoicing_state_list,
			company_state_list,
		} = this.props;
		return (
			<div className="profile-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-user" />
												<span className="ml-2">Profile</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Nav tabs>
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '1'}
												onClick={() => {
													this.toggle(0, '1');
												}}
											>
												Account
											</NavLink>
										</NavItem>
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '2'}
												onClick={() => {
													this.toggle(0, '2');
												}}
											>
												Company Profile
											</NavLink>
										</NavItem>
									</Nav>
									<TabContent activeTab={this.state.activeTab[0]}>
										<TabPane tabId="1">
											<Row>
												<Col lg={12}>
													{loading ? (
														<Loader />
													) : (
															<Formik
																initialValues={this.state.initUserData}
																onSubmit={(values, { resetForm }) => {
																	this.handleUserSubmit(values);
																	// resetForm(this.state.initValue)

																	// this.setState({
																	//   selectedContactCurrency: null,
																	//   selectedCurrency: null,
																	//   selectedInvoiceLanguage: null
																	// })
																}}
																validationSchema={Yup.object().shape({
																	firstName: Yup.string().required(
																		'First Name is Required',
																	),
																	lastName: Yup.string().required(
																		'Last Name is Required',
																	),
																	email: Yup.string()
																		.required('Email is Required')
																		.email('Invalid Email'),
																	password: Yup.string()
																		// .required("Password is Required")
																		// .min(8, "Password Too Short")
																		.matches(
																			/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
																			'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character',
																		),
																	confirmPassword: Yup.string()
																		// .required('Confirm Password is Required')
																		.oneOf(
																			[Yup.ref('password'), null],
																			'Passwords must match',
																		),
																	dob: Yup.string().required('DOB is Required'),
																})}
															>
																{(props) => (
																	<Form
																		onSubmit={props.handleSubmit}
																		encType="multipart/form-data"
																	>

																		<Row>
																			<Col lg={10}>
																				<Row>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="select">
																								<span className="text-danger">
																									*
																							</span>
																							First Name
																						</Label>
																							<Input
																								type="text"
																								id="firstName"
																								name="firstName"
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExAlpha.test(
																											option.target.value,
																										)
																									) {
																										props.handleChange(
																											'firstName',
																										)(option);
																									}
																								}}
																								value={props.values.firstName}
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
																						<FormGroup>
																							<Label htmlFor="select">
																								<span className="text-danger">
																									*
																							</span>
																							Last Name
																						</Label>
																							<Input
																								type="text"
																								id="lastName"
																								name="lastName"
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExAlpha.test(
																											option.target.value,
																										)
																									) {
																										props.handleChange(
																											'lastName',
																										)(option);
																									}
																								}}
																								value={props.values.lastName}
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
																				</Row>
																				<Row>
																					<Col lg={6}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="email">
																								<span className="text-danger">
																									*
																							</span>
																							Email ID
																						</Label>
																							<Input
																								type="text"
																								id="email"
																								name="email"
																								placeholder="Enter Email ID"
																								value={props.values.email}
																								onChange={(value) => {
																									props.handleChange('email')(
																										value,
																									);
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
																							<Label htmlFor="date">
																								<span className="text-danger">
																									*
																							</span>
																							Date Of Birth
																						</Label>
																							<DatePicker
																								className={`form-control ${props.errors.dob &&
																										props.touched.dob
																										? 'is-invalid'
																										: ''
																									}`}
																								id="dob "
																								name="dob "
																								showMonthDropdown
																								showYearDropdown
																								dateFormat="dd/MM/yyyy"
																								dropdownMode="select"
																								placeholderText="Enter Date of Birth"
																								maxDate={new Date()}
																								autoComplete="off"
																								// selected={props.values.dob}
																								value={
																									props.values.dob
																										? moment(
																											props.values.dob,
																										).format('DD-MM-YYYY')
																										: ''
																								}
																								onChange={(value) => {
																									props.handleChange('dob')(
																										value,
																									);
																								}}
																							/>
																							{props.errors.dob &&
																								props.touched.dob && (
																									<div className="invalid-feedback">
																										{props.errors.dob}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																				</Row>
																				<Row>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="roleId">Role</Label>
																							<Select
																								styles={customStyles}
																								options={
																									role_list
																										? selectOptionsFactory.renderOptions(
																											'roleName',
																											'roleCode',
																											role_list,
																											'Role',
																										)
																										: []
																								}
																								value={
																									role_list &&
																									selectOptionsFactory
																										.renderOptions(
																											'roleName',
																											'roleCode',
																											role_list,
																											'Role',
																										)
																										.find(
																											(option) =>
																												option.value ===
																												+props.values.roleId,
																										)
																								}
																								onChange={(option) => {
																									if (option.value) {
																										props.handleChange('roleId')(
																											option.value,
																										);
																									} else {
																										props.handleChange('roleId')(
																											'',
																										);
																									}
																								}}
																								placeholder="Select Role"
																								id="roleId"
																								name="roleId"
																								className={
																									props.errors.roleId &&
																										props.touched.roleId
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.roleId &&
																								props.touched.roleId && (
																									<div className="invalid-feedback">
																										{props.errors.roleId}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="roleId">
																								<span className="text-danger">
																									*
																							</span>
																							Time Zone Preference
																						</Label>
																							<Select
																								styles={customStyles}
																								options={timezone ? timezone : []}
																								value={
																									timezone &&
																									timezone.find(
																										(option) =>
																											option.value ===
																											props.values.timezone,
																									)
																								}
																								onChange={(option) => {
																									if (option.value) {
																										props.handleChange(
																											'timezone',
																										)(option.value);
																									} else {
																										props.handleChange(
																											'timezone',
																										)('');
																									}
																								}}
																								placeholder="Select TimeZOne"
																								id="timezone"
																								name="timezone"
																								className={
																									props.errors.timezone &&
																										props.touched.timezone
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.timezone &&
																								props.touched.timezone && (
																									<div className="invalid-feedback">
																										{props.errors.timezone}
																									</div>
																								)}
																						</FormGroup>
																					</Col>

																					{/* <FormGroup>
                                          <Label htmlFor="companyId">Company</Label>
                                          <Select
                                            className="select-default-width"
                                            options={company_type_list ? selectOptionsFactory.renderOptions('label', 'value', company_type_list , 'Company') : []}
                                            value={props.values.companyId}
                                            onChange={(option) => props.handleChange('companyId')(option.value)}
                                            placeholder="Select Company"
                                            id="companyId"
                                            name="companyId"
                                            className={
                                              props.errors.companyId && props.touched.companyId
                                                ? "is-invalid"
                                                : ""
                                            }
                                          />
                                          {props.errors.companyId && props.touched.companyId && (
                                            <div className="invalid-feedback">{props.errors.companyId}</div>
                                          )}
      
                                        </FormGroup> */}

																				</Row>
																				<Row>
																					{/* <Col lg={6}>
                                        <FormGroup className="mb-3">
                                          <Label htmlFor="active">Status</Label>
                                          <div>
                                            <FormGroup check inline>
                                              <div className="custom-radio custom-control">
                                                <input
                                                  className="custom-control-input"
                                                  type="radio"
                                                  id="inline-radio1"
                                                  name="active"
                                                  checked={this.state.selectedStatus}
                                                  value={true}
                                                  onChange={(e) => {
                                                    if(e.target.value) {
                                                      this.setState({selectedStatus: true},() => {
                                                      })
                                                    }
                                                  }}
                                                />
                                                <label className="custom-control-label" htmlFor="inline-radio1">Active</label>
                                              </div>
                                            </FormGroup>
                                            <FormGroup check inline>
                                              <div className="custom-radio custom-control">
                                                <input
                                                  className="custom-control-input"
                                                  type="radio"
                                                  id="inline-radio2"
                                                  name="active"
                                                  value={false}
                                                  checked={!this.state.selectedStatus}
                                                  onChange={(e) => {
                                                    if(e.target.value === 'false') {
                                                      this.setState({selectedStatus: false})
                                                    }
                                                  }}
                                                />
                                                <label className="custom-control-label" htmlFor="inline-radio2">Inactive</label>
                                              </div>
                                            </FormGroup>
                                          </div>
                                        </FormGroup>
                                      </Col> */}
																				</Row>
																				<Row>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="select">
																								Password
																						</Label>
																							<Input
																								type="password"
																								id="password"
																								name="password"
																								autoComplete="new-password"
																								placeholder="Enter the Password"
																								onChange={(value) => {
																									props.handleChange('password')(
																										value,
																									);
																								}}
																								className={
																									props.errors.password &&
																										props.touched.password
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.password &&
																								props.touched.password ? (
																									<div className="invalid-feedback">
																										{props.errors.password}
																									</div>
																								) : (
																									<span className="password-msg">
																										Must Contain 8 Characters, One
																										Uppercase, One Lowercase, One
																										Number and one special case
																										Character.
																									</span>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="select">
																								Confirm Password
																						</Label>
																							<Input
																								type="password"
																								id="confirmPassword"
																								name="confirmPassword"
																								placeholder="Enter the Confirm Password"
																								onChange={(value) => {
																									props.handleChange(
																										'confirmPassword',
																									)(value);
																								}}
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
																				{/* {this.state.userId !== 1 &&
																				(
																				<Row>
																					<Col lg={6}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="active">
																								Status
																						</Label>
																							<div>
																								<FormGroup check inline>
																									<div className="custom-radio custom-control">
																										<input
																											className="custom-control-input"
																											type="radio"
																											id="inline-radio1"
																											name="active"
																											checked={
																												this.state.selectedStatus
																											}
																											value={true}
																											onChange={(e) => {
																												if (e.target.value) {
																													this.setState(
																														{
																															selectedStatus: true,
																														},
																														() => { },
																													);
																												}
																											}}
																										/>
																										<label
																											className="custom-control-label"
																											htmlFor="inline-radio1"
																										>
																											Active
																									</label>
																									</div>
																								</FormGroup>
																								<FormGroup check inline>
																									<div className="custom-radio custom-control">
																										<input
																											className="custom-control-input"
																											type="radio"
																											id="inline-radio2"
																											name="active"
																											value={false}
																											checked={
																												!this.state.selectedStatus
																											}
																											onChange={(e) => {
																												if (
																													e.target.value ===
																													'false'
																												) {
																													this.setState({
																														selectedStatus: false,
																													});
																												}
																											}}
																										/>
																										<label
																											className="custom-control-label"
																											htmlFor="inline-radio2"
																										>
																											Inactive
																									</label>
																									</div>
																								</FormGroup>
																							</div>
																						</FormGroup>
																					</Col>
																				</Row>
																				)} */}
																			</Col>
																			<Col xs="12" md="4" lg={2}>
																				<FormGroup className="mb-3 text-center">
																					<ImageUploader
																						// withIcon={true}
																						buttonText="Choose images"
																						onChange={this.uploadUserImage}
																						imgExtension={[
																							'jpg',
																							'gif',
																							'png',
																							'jpeg',
																						]}
																						maxFileSize={40000}
																						withPreview={true}
																						singleImage={true}
																						// withIcon={this.state.showIcon}
																						withIcon={false}
																						// buttonText="Choose Profile Image"
																						flipHeight={
																							this.state.userPhoto.length > 0
																								? { height: 'inherit' }
																								: {}
																						}
																						label="'Max file size: 40kb"
																						labelClass={
																							this.state.userPhoto.length > 0
																								? 'hideLabel'
																								: 'showLabel'
																						}
																						buttonClassName={
																							this.state.userPhoto.length > 0
																								? 'hideButton'
																								: 'showButton'
																						}
																						defaultImages={this.state.userPhoto}
																						imageState={this.state.imageState}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col
																				lg={12}
																				className="mt-5 d-flex flex-wrap align-items-center  justify-content-end"
																			>
																				<FormGroup className="text-right">
																					<Button
																						type="submit"
																						color="primary"
																						className="btn-square mr-3"
																					>
																						<i className="fa fa-dot-circle-o"></i>{' '}
																					Update
																				</Button>
																					<Button
																						color="secondary"
																						className="btn-square"
																						onClick={() => {
																							this.props.history.push(
																								'/admin/dashboard',
																							);
																						}}
																					>
																						<i className="fa fa-ban"></i> Cancel
																				</Button>
																				</FormGroup>
																			</Col>
																		</Row>
																	</Form>
																)}
															</Formik>
														)}
												</Col>
											</Row>
										</TabPane>
										<TabPane tabId="2">
											{loading ? (
												<Loader></Loader>
											) : (
													<Row>
														<Col lg="12">
															<Formik
																initialValues={this.state.initCompanyData}
																onSubmit={(values, { resetForm }) => {
																	this.handleCompanySubmit(values);
																	// resetForm(this.state.initValue)

																	// this.setState({
																	//   selectedContactCurrency: null,
																	//   selectedCurrency: null,
																	//   selectedInvoiceLanguage: null
																	// })
																}}
															// validationSchema={Yup.object().shape({
															//   firstName: Yup.()
															//     .required("First Name is Required"),
															//   lastName: Yup.()
															//     .required("Last Name is Required"),
															// })}
															>
																{(props) => (
																	<Form onSubmit={props.handleSubmit}>
																		<h5 className="mt-3 mb-3">Company Detail</h5>
																		<Row>
																			<Col lg={2} md={4}>
																				<FormGroup className="mb-3 text-center">
																					{/* <ImagesUploader
                                    url="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                    optimisticPreviews
                                    multiple={false}
                                    onLoadEnd={(err) => {
                                      if (err) {
                                        console.error(err);
                                      }
                                    }}
                                  /> */}
																					<ImageUploader
																						// withIcon={true}
																						buttonText="Choose images"
																						onChange={this.uploadCompanyImage}
																						imgExtension={[
																							'jpg',
																							'gif',
																							'png',
																							'jpeg',
																						]}
																						maxFileSize={40000}
																						withPreview={true}
																						singleImage={true}
																						// withIcon={this.state.showIcon}
																						withIcon={false}
																						// buttonText="Choose Profile Image"
																						flipHeight={
																							this.state.companyLogo.length > 0
																								? { height: 'inherit' }
																								: {}
																						}
																						label="'Max file size: 40kb"
																						labelClass={
																							this.state.companyLogo.length > 0
																								? 'hideLabel'
																								: 'showLabel'
																						}
																						buttonClassName={
																							this.state.companyLogo.length > 0
																								? 'hideButton'
																								: 'showButton'
																						}
																						defaultImages={this.state.companyLogo}
																						imageState={this.state.imageState}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={10}>
																				<Row>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="product_code">
																								Company Name
																						</Label>
																							<Input
																								type="text"
																								id="companyName"
																								name="companyName"
																								placeholder="Enter Company Name"
																								value={props.values.companyName}
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExAlpha.test(
																											option.target.value,
																										)
																									) {
																										props.handleChange(
																											'companyName',
																										)(option);
																									}
																								}}
																							/>
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="product_code">
																								Company Registration No
																						</Label>
																							<Input
																								type="text"
																								id="companyRegistrationNumber"
																								name="companyRegistrationNumber"
																								placeholder="Enter Company Registration No"
																								value={
																									props.values
																										.companyRegistrationNumber
																								}
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExBoth.test(
																											option.target.value,
																										)
																									) {
																										props.handleChange(
																											'companyRegistrationNumber',
																										)(option);
																									}
																								}}
																							/>
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="product_code">
																								VAT Registration No
																						</Label>
																							<Input
																								type="text"
																								id="vatRegistrationNumber"
																								name="vatRegistrationNumber"
																								placeholder="Enter VAT Registration No"
																								value={
																									props.values
																										.vatRegistrationNumber
																								}
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExBoth.test(
																											option.target.value,
																										)
																									) {
																										props.handleChange(
																											'vatRegistrationNumber',
																										)(option);
																									}
																								}}
																							/>
																						</FormGroup>
																					</Col>
																				</Row>
																				<Row>
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="companyId">
																								Company Type Code
																						</Label>
																							<Select
																								options={
																									company_type_list
																										? selectOptionsFactory.renderOptions(
																											'label',
																											'value',
																											company_type_list,
																											'Company Type Code',
																										)
																										: []
																								}
																								value={
																									company_type_list &&
																									company_type_list.find(
																										(option) =>
																											option.value ===
																											+props.values
																												.companyTypeCode,
																									)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange(
																											'companyTypeCode',
																										)(option.value);
																									} else {
																										props.handleChange(
																											'companyTypeCode',
																										)('');
																									}
																								}}
																								placeholder="Select Company"
																								id="companyTypeCode"
																								name="companyTypeCode"
																								className={
																									props.errors.companyTypeCode &&
																										props.touched.companyTypeCode
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.companyTypeCode &&
																								props.touched.companyTypeCode && (
																									<div className="invalid-feedback">
																										{props.errors.companyTypeCode}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="industryTypeCode">
																								Industry Type Code
																						</Label>
																							<Select
																								options={
																									industry_type_list
																										? selectOptionsFactory.renderOptions(
																											'label',
																											'value',
																											industry_type_list,
																											'Industry Type',
																										)
																										: []
																								}
																								value={
																									industry_type_list &&
																									industry_type_list.find(
																										(option) =>
																											option.value ===
																											+props.values
																												.industryTypeCode,
																									)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange(
																											'industryTypeCode',
																										)(option.value);
																									} else {
																										props.handleChange(
																											'industryTypeCode',
																										)('');
																									}
																								}}
																								placeholder="Select Industry Type Code"
																								id="industryTypeCode"
																								name="industryTypeCode"
																								className={
																									props.errors.industryTypeCode &&
																										props.touched.industryTypeCode
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.industryTypeCode &&
																								props.touched
																									.industryTypeCode && (
																									<div className="invalid-feedback">
																										{
																											props.errors
																												.industryTypeCode
																										}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="currencyCode">
																								Currency Code
																						</Label>
																							<Select
																								isDisabled
																								options={
																									currency_list
																										? selectCurrencyFactory.renderOptions(
																											'currencyName',
																											'currencyCode',
																											currency_list,
																											'Currency',
																										)
																										: []
																								}
																								value={
																									currency_list &&
																									selectCurrencyFactory
																										.renderOptions(
																											'currencyName',
																											'currencyCode',
																											currency_list,
																											'Currency',
																										)
																										.find(
																											(option) =>
																												option.value ===
																												+props.values
																													.currencyCode,
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
																								placeholder="Select Currency"
																								id="currencyCode"
																								name="currencyCode"
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
																				</Row>
																				<Row>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="product_code">
																								Website
																						</Label>
																							<Input
																								type="text"
																								id="website"
																								name="website"
																								placeholder="Enter Website"
																								value={props.values.website}
																								onChange={(option) => {
																									props.handleChange('website')(
																										option,
																									);
																								}}
																							/>
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="product_code">
																								Email Address
																						</Label>
																							<Input
																								type="text"
																								id="emailAddress"
																								name="emailAddress"
																								placeholder="Enter Email"
																								value={props.values.emailAddress}
																								onChange={(option) => {
																									props.handleChange(
																										'emailAddress',
																									)(option);
																								}}
																							/>
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="phoneNumber">
																							Mobile Number
																						</Label>
																							<PhoneInput
																								defaultCountry="AE"
																								international
																								value={props.values.phoneNumber}
																								placeholder="Enter Mobile Number"
																								onChange={(option) => {
																									props.handleChange(
																										'phoneNumber',
																									)(option);
																								}}
																								className={
																									props.errors.phoneNumber &&
																										props.touched.phoneNumber
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.phoneNumber &&
																								props.touched.phoneNumber && (
																									<div className="invalid-feedback">
																										{props.errors.phoneNumber}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																				</Row>
																			</Col>
																		</Row>

																		<h5 className="mt-3 mb-3">Company Cost</h5>
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						Expense Budget
																				</Label>
																					<Input
																						type="text"
																						id="companyExpenseBudget"
																						name="companyExpenseBudget"
																						placeholder="Enter Expense Budget"
																						value={
																							props.values.companyExpenseBudget
																						}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange(
																									'companyExpenseBudget',
																								)(option);
																							}
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						Revenue Budget
																				</Label>
																					<Input
																						type="text"
																						id="companyRevenueBudget"
																						name="companyRevenueBudget"
																						placeholder="Enter Revenue Budget"
																						value={
																							props.values.companyRevenueBudget
																						}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange(
																									'companyRevenueBudget',
																								)(option);
																							}
																						}}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>

																		<h5 className="mt-3 mb-3">
																			Invoicing Address
																	</h5>
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						Invoicing Address Line 1
																				</Label>
																					<Input
																						type="textarea"
																						id="invoicingAddressLine1"
																						name="invoicingAddressLine1"
																						placeholder="Enter Invoicing Address Line1"
																						rows="5"
																						value={
																							props.values.invoicingAddressLine1
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'invoicingAddressLine1',
																							)(option);
																							this.setState({
																								companyAddress: {
																									...this.state.companyAddress,
																									...{
																										companyAddressLine1:
																											option.target.value,
																									},
																								},
																							});
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						Invoicing Address Line 2
																				</Label>
																					<Input
																						type="textarea"
																						id="categoryDiscription"
																						name="categoryDiscription"
																						placeholder="Enter Invoicing Address Line2"
																						rows="5"
																						value={
																							props.values.invoicingAddressLine2
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'invoicingAddressLine2',
																							)(option);
																							this.setState({
																								companyAddress: {
																									...this.state.companyAddress,
																									...{
																										companyAddressLine2:
																											option.target.value,
																									},
																								},
																							});
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						Invoicing Address Line 3
																				</Label>
																					<Input
																						type="textarea"
																						id="categoryDiscription"
																						name="categoryDiscription"
																						placeholder="Enter Invoicing Address Line3"
																						rows="5"
																						value={
																							props.values
																								.invoicingAddressLine3 || ''
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'invoicingAddressLine3',
																							)(option);
																							this.setState({
																								companyAddress: {
																									...this.state.companyAddress,
																									...{
																										companyAddressLine3:
																											option.target.value,
																									},
																								},
																							});
																						}}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>

																		<Row>
																			<Col lg={4}>
																				<FormGroup>
																					<Label htmlFor="invoicingCountryCode">
																						Country Code
																				</Label>
																					<Select
																						options={
																							country_list
																								? selectOptionsFactory.renderOptions(
																									'countryName',
																									'countryCode',
																									country_list,
																									'Country',
																								)
																								: []
																						}
																						value={
																							country_list &&
																							selectOptionsFactory
																								.renderOptions(
																									'countryName',
																									'countryCode',
																									country_list,
																									'Country',
																								)
																								.find(
																									(option) =>
																										option.value ===
																										+props.values
																											.invoicingCountryCode,
																								)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange(
																									'invoicingCountryCode',
																								)(option.value);
																								props.handleChange(
																									'invoicingStateRegion',
																								)('');
																								this.getStateList(
																									option.value,
																									'invoicing',
																								);
																								this.setState({
																									companyAddress: {
																										...this.state.companyAddress,
																										...{
																											companyCountryCode:
																												option.value,
																											companyStateRegion: '',
																										},
																									},
																								});
																							} else {
																								props.handleChange(
																									'invoicingCountryCode',
																								)('');
																								props.handleChange(
																									'invoicingStateRegion',
																								)('');
																								this.setState({
																									companyAddress: {
																										...this.state.companyAddress,
																										...{
																											companyCountryCode: '',
																											companyStateRegion: '',
																										},
																									},
																								});
																							}
																						}}
																						placeholder="Select Currency"
																						id="invoicingCountryCode"
																						name="invoicingCountryCode"
																						className={
																							props.errors.invoicingCountryCode &&
																								props.touched.invoicingCountryCode
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.invoicingCountryCode &&
																						props.touched
																							.invoicingCountryCode && (
																							<div className="invalid-feedback">
																								{
																									props.errors
																										.invoicingCountryCode
																								}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						State Region
																				</Label>
																					{/* <Input
                                            type="text"
                                            id="invoicingStateRegion"
                                            name="invoicingStateRegion"
                                            placeholder="Enter State Region"
                                            value={props.values.invoicingStateRegion || ''}
                                            onChange={(option) => {
                                              props.handleChange('invoicingStateRegion')(option)
                                              this.setState({
                                                companyAddress: {
                                                  ...this.state.companyAddress, ...{
                                                    companyStateRegion: option.target.value
                                                  }
                                                }
                                              })
                                            }}
                                          /> */}
																					<Select
																						options={
																							invoicing_state_list
																								? selectOptionsFactory.renderOptions(
																									'label',
																									'value',
																									invoicing_state_list,
																									'State',
																								)
																								: []
																						}
																						value={
																							invoicing_state_list &&
																							invoicing_state_list.find(
																								(option) =>
																									option.value ===
																									+props.values
																										.invoicingStateRegion,
																							)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange(
																									'invoicingStateRegion',
																								)(option.value);
																								// props.handleChange('companyStateRegion')(option.value)
																								this.setState({
																									companyAddress: {
																										...this.state.companyAddress,
																										...{
																											companyStateRegion:
																												option.value,
																										},
																									},
																								});
																							} else {
																								props.handleChange(
																									'invoicingStateRegion',
																								)('');
																								// props.handleChange('companyStateRegion')('')
																								this.setState({
																									companyAddress: {
																										...this.state.companyAddress,
																										...{
																											companyStateRegion: '',
																										},
																									},
																								});
																							}
																						}}
																						placeholder="Select State"
																						id="invoicingStateRegion"
																						name="invoicingStateRegion"
																						className={
																							props.errors.invoicingStateRegion &&
																								props.touched.invoicingStateRegion
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.invoicingStateRegion &&
																						props.touched
																							.invoicingStateRegion && (
																							<div className="invalid-feedback">
																								{
																									props.errors
																										.invoicingStateRegion
																								}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						City
																				</Label>
																					<Input
																						type="text"
																						id="invoicingCity"
																						name="invoicingCity"
																						placeholder="Enter City"
																						value={
																							props.values.invoicingCity || ''
																						}
																						onChange={(option) => {
																							props.handleChange('invoicingCity')(
																								option,
																							);
																							this.setState({
																								companyAddress: {
																									...this.state.companyAddress,
																									...{
																										companyCity:
																											option.target.value,
																									},
																								},
																							});
																						}}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="invoicingPoBoxNumber">
																						PO Box No
																				</Label>
																					<Input
																						type="text"
																						id="invoicingPoBoxNumber"
																						name="invoicingPoBoxNumber"
																						placeholder="Enter PO Box No"
																						value={
																							props.values.invoicingPoBoxNumber ||
																							''
																						}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExBoth.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange(
																									'invoicingPoBoxNumber',
																								)(option);
																								this.setState({
																									companyAddress: {
																										...this.state.companyAddress,
																										...{
																											companyPoBoxNumber:
																												option.target.value,
																										},
																									},
																								});
																							}
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="invoicingPostZipCode">
																						Post Zip Code
																				</Label>
																					<Input
																						type="text"
																						id="invoicingPostZipCode"
																						name="invoicingPostZipCode"
																						placeholder="Enter Post Zip Code"
																						value={
																							props.values.invoicingPostZipCode ||
																							''
																						}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange(
																									'invoicingPostZipCode',
																								)(option);
																								this.setState({
																									companyAddress: {
																										...this.state.companyAddress,
																										...{
																											companyPostZipCode:
																												option.target.value,
																										},
																									},
																								});
																							}
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			{/* <Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="dateFormat">
																						Date Format
																				</Label>
																					<Input
																						type="text"
																						id="dateFormat"
																						name="dateFormat"
																						placeholder="Enter Date Format"
																						value={props.values.dateFormat}
																						showMonthDropdown
																						showYearDropdown
																						dateFormat="dd/MM/yyyy"
																						dropdownMode="select"
																						onChange={(option) => {
																							props.handleChange('dateFormat')(
																								option,
																							);
																						}}
																					/>
																				</FormGroup>
																			</Col> */}
																		</Row>

																		<h5 className="mt-3 mb-3">Company Address</h5>
																		<Row>
																			<Col lg={12}>
																				<FormGroup check inline className="mb-3">
																					<div>
																						<Input
																							// className="custom-control-input"
																							type="checkbox"
																							id="inline-radio1"
																							name="SMTP-auth"
																							checked={this.state.isSame}
																							onChange={(e) => {
																								this.setState({
																									isSame: !this.state.isSame,
																								});
																							}}
																						/>
																						<label htmlFor="inline-radio1">
																							Company Address is same as Invoicing
																							Address
																					</label>
																					</div>
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						Company Address Line1
																				</Label>
																					<Input
																						type="textarea"
																						id="companyAddressLine1"
																						name="companyAddressLine1"
																						placeholder="Enter Company Address Line1"
																						rows="5"
																						value={
																							isSame
																								? this.state.companyAddress
																									.companyAddressLine1
																								: props.values.companyAddressLine1
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'companyAddressLine1',
																							)(option);
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="companyAddressLine2">
																						Company Address Line2
																				</Label>
																					<Input
																						type="textarea"
																						id="companyAddressLine2"
																						name="companyAddressLine2"
																						placeholder="Enter Company Address Line2"
																						rows="5"
																						value={
																							isSame
																								? this.state.companyAddress
																									.companyAddressLine2
																								: props.values.companyAddressLine2
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'companyAddressLine2',
																							)(option);
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="companyAddressLine3">
																						Company Address Line3
																				</Label>
																					<Input
																						type="textarea"
																						id="companyAddressLine3"
																						name="companyAddressLine3"
																						placeholder="Enter Company Address Line3"
																						rows="5"
																						value={
																							isSame
																								? this.state.companyAddress
																									.companyAddressLine3
																								: props.values.companyAddressLine3
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'companyAddressLine3',
																							)(option);
																						}}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>

																		<Row>
																			<Col lg={4}>
																				<FormGroup>
																					<Label htmlFor="companyCountryCode">
																						Country Code
																				</Label>
																					<Select
																						options={
																							country_list
																								? selectOptionsFactory.renderOptions(
																									'countryName',
																									'countryCode',
																									country_list,
																									'Country',
																								)
																								: []
																						}
																						value={
																							isSame
																								? country_list &&
																								selectOptionsFactory
																									.renderOptions(
																										'countryName',
																										'countryCode',
																										country_list,
																										'Country',
																									)
																									.find(
																										(option) =>
																											option.value ===
																											+this.state.companyAddress
																												.companyCountryCode,
																									)
																								: country_list &&
																								selectOptionsFactory
																									.renderOptions(
																										'countryName',
																										'countryCode',
																										country_list,
																										'Country',
																									)
																									.find(
																										(option) =>
																											option.value ===
																											+props.values
																												.companyCountryCode,
																									)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange(
																									'companyCountryCode',
																								)(option.value, 'company');
																								props.handleChange(
																									'companyStateRegion',
																								)('');
																								this.getStateList(
																									option.value,
																									'company',
																								);
																							} else {
																								props.handleChange(
																									'companyCountryCode',
																								)('');
																								props.handleChange(
																									'companyStateRegion',
																								)('');
																							}
																						}}
																						placeholder="Select Country"
																						id="companyCountryCode"
																						name="companyCountryCode"
																						className={
																							props.errors.companyCountryCode &&
																								props.touched.companyCountryCode
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.companyCountryCode &&
																						props.touched.companyCountryCode && (
																							<div className="invalid-feedback">
																								{props.errors.companyCountryCode}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="product_code">
																						State Region
																				</Label>
																					{/* <Input
                                            type="text"
                                            id="companyStateRegion"
                                            name="companyStateRegion"
                                            placeholder="Enter State Region"
                                            value={isSame ? this.state.companyAddress.companyStateRegion : props.values.companyStateRegion}

                                            onChange={(option) => {
                                              props.handleChange('companyStateRegion')(option)
                                            }}
                                          /> */}
																					<Select
																						options={selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							isSame
																								? invoicing_state_list
																								: company_state_list,
																							'State',
																						)}
																						value={
																							isSame
																								? invoicing_state_list.find(
																									(option) =>
																										option.value ===
																										+this.state.companyAddress
																											.companyStateRegion,
																								)
																								: company_state_list.find(
																									(option) =>
																										option.value ===
																										+props.values
																											.companyStateRegion,
																								)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange(
																									'companyStateRegion',
																								)(option.value);
																							} else {
																								props.handleChange(
																									'companyStateRegion',
																								)('');
																							}
																						}}
																						placeholder="Select State"
																						id="companyStateRegion"
																						name="companyStateRegion"
																						className={
																							props.errors.companyStateRegion &&
																								props.touched.companyStateRegion
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.companyStateRegion &&
																						props.touched.companyStateRegion && (
																							<div className="invalid-feedback">
																								{props.errors.companyStateRegion}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="companyCity">
																						City
																				</Label>
																					<Input
																						type="text"
																						id="companyCity"
																						name="companyCity"
																						placeholder="Enter City"
																						value={
																							isSame
																								? this.state.companyAddress
																									.companyCity
																								: props.values.companyCity
																						}
																						onChange={(option) => {
																							props.handleChange('companyCity')(
																								option,
																							);
																						}}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="companyPoBoxNumber">
																						PO Box No
																				</Label>
																					<Input
																						type="text"
																						id="companyPoBoxNumber"
																						name="companyPoBoxNumber"
																						placeholder="Enter PO Box No"
																						value={
																							isSame
																								? this.state.companyAddress
																									.companyPoBoxNumber
																								: props.values.companyPoBoxNumber
																						}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExBoth.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange(
																									'companyRevenueBudget',
																								)(option);
																							}
																						}}
																					/>
																				</FormGroup>
																			</Col>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="companyPostZipCode">
																						Post Zip Code
																				</Label>
																					<Input
																						type="text"
																						id="companyPostZipCode"
																						name="companyPostZipCode"
																						placeholder="Enter Post Zip Code"
																						value={
																							isSame
																								? this.state.companyAddress
																									.companyPostZipCode
																								: props.values.companyPostZipCode
																						}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange(
																									'companyRevenueBudget',
																								)(option);
																							}
																						}}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>

																		<Row>
																			<Col lg={12} className="mt-5">
																				<FormGroup className="text-right">
																					<Button
																						type="submit"
																						color="primary"
																						className="btn-square mr-3"
																					>
																						<i className="fa fa-dot-circle-o"></i>{' '}
																					Update
																				</Button>
																					<Button
																						color="secondary"
																						className="btn-square"
																						onClick={() => {
																							this.props.history.push(
																								'/admin/dashboard',
																							);
																						}}
																					>
																						<i className="fa fa-ban"></i> Cancel
																				</Button>
																				</FormGroup>
																			</Col>
																		</Row>
																	</Form>
																)}
															</Formik>
														</Col>
													</Row>
												)}
										</TabPane>
									</TabContent>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
