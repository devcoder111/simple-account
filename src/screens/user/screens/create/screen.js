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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { ImageUploader } from 'components';

import * as UserActions from '../../actions';
import * as UserCreateActions from './actions';

import { CommonActions, AuthActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';

import './style.scss';


const eye = require('assets/images/settings/eye.png');
const mapStateToProps = (state) => {
	return {
		role_list: state.user.role_list,
		company_type_list: state.user.company_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		userCreateActions: bindActionCreators(UserCreateActions, dispatch),
		userActions: bindActionCreators(UserActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
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

class CreateUser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPasswordShown: false,
			loading: false,
			// passwordShown: false,
			createMore: false,
			initValue: {
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				dob: '',
				active: 'true',
				confirmPassword: '',
				roleId: '',
				timezone: '',
			},
			userPhoto: [],
			userPhotoFile: [],
			showIcon: false,
			exist: false,
			createDisabled: false,
			selectedStatus: false,
			useractive: false,
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.authActions.getTimeZoneList().then((response) => {
			let output = response.data.map(function (value) {
				return { label: value, value: value };
			});
			this.setState({ timezone: output });
		});
		this.props.userActions.getRoleList();
		this.props.userActions.getCompanyTypeList();
		this.setState({ showIcon: false });
	};

	uploadImage = (picture, file) => {
		this.setState({
			userPhoto: picture,
			userPhotoFile: file,
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
		this.setState({
			createDisabled: true,
		})

		const {
			firstName,
			lastName,
			email,
			dob,
			password,
			roleId,
			companyId,
			active,
			timezone,
		} = data;
		let formData = new FormData();
		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		//formData.append('dob', dob ? moment(dob).format('DD-MM-YYYY') : '');
		// formData.append(
		// 	'dob',
		// 	dob
		// 		? moment(
		// 				moment(dob).format('DD/MM/YYYY'),
		// 				'DD/MM/YYYY',
		// 		  ).toDate()
		// 		: null,
		// );
		formData.append('dob', dob ? dob : '');
		formData.append('roleId', roleId ? roleId.value : '');
		formData.append('active', this.state.useractive);
		formData.append('password', password ? password : '');
		formData.append('timeZone', timezone ? timezone.value : '');
		formData.append('companyId', companyId ? companyId : '');
		if (this.state.userPhotoFile.length > 0) {
			formData.append('profilePic ', this.state.userPhotoFile[0]);
		}

		this.props.userCreateActions
			.createUser(formData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'New User Created Successfully',
					);
					if (this.state.createMore) {
						this.setState({
							createMore: false,
							createDisabled: false
						});
						resetForm();
					} else {
						this.props.history.push('/admin/settings/user');
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({
					createDisabled: false,
				})
			});
	};
	validationCheck = (value) => {
		const data = {
			moduleType: 9,
			name: value,
		};
		this.props.userCreateActions.checkValidation(data).then((response) => {
			if (response.data === 'User already exists') {
				this.setState({
					exist: true,
					createDisabled: false,
				})
			} else {
				this.setState({
					exist: false,
				});
			}
		});
	};

	render() {
		const { role_list } = this.props;
		const { timezone } = this.state;
		const { isPasswordShown } = this.state;
		return (
			<div className="create-user-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-users" />
												<span className="ml-2">Create User</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
													// resetForm(this.state.initValue)

													// this.setState({
													//   selectedContactCurrency: null,
													//   selectedCurrency: null,
													//   selectedInvoiceLanguage: null
													// })
												}}
												validate={(values) => {
													// let status = false
													let errors = {};
													if (this.state.exist === true) {
														errors.email =
															'User already exists';
													}

													if ( errors.length ) {
														this.setState({
															createDisabled: false,
														})
													}

													return errors;
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
													roleId: Yup.string().required(
														'Role Name is Required',
													),
													timezone: Yup.string().required(
														'Time Zone is Required',
													),
													password: Yup.string()
														.required('Password is Required')
														// .min(8, "Password Too Short")
														.matches(
															/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
															'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character',
														),
													confirmPassword: Yup.string()
														.required('Confirm Password is Required')
														.oneOf(
															[Yup.ref('password'), null],
															'Passwords must match',
														),
													//	dob: Yup.date().required('DOB is Required'),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col xs="4" md="4" lg={2}>
																<FormGroup className="mb-3 text-center">
																	{/* <ImagesUploader
                                    // url="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                    optimisticPreviews
                                    multiple={false}
                                    onLoadEnd={(err) => {
                                      if (err) {
                                        console.error(err);
                                      }
                                    }}
                                    onChange={(e) => {}}
                                  /> */}
																	<ImageUploader
																		// withIcon={true}
																		buttonText="Choose images"
																		onChange={this.uploadImage}
																		imgExtension={['jpg', 'gif', 'png', 'jpeg']}
																		maxFileSize={11048576}
																		withPreview={true}
																		singleImage={true}
																		withIcon={this.state.showIcon}
																		// buttonText="Choose Profile Image"
																		flipHeight={
																			this.state.userPhoto.length > 0
																				? { height: 'inherit' }
																				: {}
																		}
																		label="'Max file size: 1mb"
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
																	/>
																</FormGroup>
															</Col>
															<Col lg={10}>
																<Row>
																	<Col lg={6}>
																		<FormGroup>
																			<Label htmlFor="select">
																				<span className="text-danger">*</span>
																				First Name
																			</Label>
																			<Input
																				type="text"
																				maxLength="26"
																				id="firstName"
																				name="firstName"
																				value={props.values.firstName}
																				placeholder="First Name"
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						this.regExAlpha.test(
																							option.target.value,
																						)
																					) {
																						props.handleChange('firstName')(
																							option,
																						);
																					}
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
																		<FormGroup>
																			<Label htmlFor="select">
																				<span className="text-danger">*</span>
																				Last Name
																			</Label>
																			<Input
																				type="text"
																				maxLength="26"
																				id="lastName"
																				name="lastName"
																				placeholder="Last Name"
																				value={props.values.lastName}
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						this.regExAlpha.test(
																							option.target.value,
																						)
																					) {
																						props.handleChange('lastName')(
																							option,
																						);
																					}
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
																</Row>
																<Row>
																	<Col lg={6}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="email">
																				<span className="text-danger">*</span>
																				Email ID
																			</Label>
																			<Input
																				type="text"
																				maxLength="80"
																				id="email"
																				name="email"
																				placeholder="Enter Email ID"
																				value={props.values.email}
																				onChange={(option) => {
																					props.handleChange('email')(option);
																					this.validationCheck(
																						option.target.value,
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
																				Date Of Birth
																			</Label>
																			<DatePicker
																				id="dob"
																				name="dob"
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd/MM/yyyy"
																				dropdownMode="select"
																				placeholderText="Enter Date of Birth"
																				maxDate={new Date()}
																				selected={props.values.dob}
																				//value={props.values.dob}
																				onChange={(value) => {
																					props.handleChange('dob')(value);
																					
																				}}
																				className={`form-control ${
																					props.errors.dob && props.touched.dob
																						? 'is-invalid'
																						: ''
																				}`}
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
																								checked={
																									this.state.selectedStatus
																								}
																								value={true}
																								onChange={(e) => {
																									if (
																										e.target.value === 'true'
																									) {
																										this.setState({
																											selectedStatus: true,
																											useractive: true
																										});
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
																										e.target.value === 'false'
																									) {
																										this.setState({
																											selectedStatus: false,
																											useractive: false
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
																<Row>
																	<Col lg={6}>
																		<FormGroup>
																			<Label htmlFor="roleId">
																				<span className="text-danger">*</span>
																				Role
																			</Label>
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
																				value={props.values.roleId}
																				onChange={(option) => {
																					if (option && option.value) {
																						props.handleChange('roleId')(
																							option,
																						);
																					} else {
																						props.handleChange('roleId')('');
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
																		<FormGroup className="mb-3">
																			<Label htmlFor="timezone">
																				<span className="text-danger">*</span>
																				Time Zone Preference
																			</Label>
																			<Select
																				styles={customStyles}
																				id="timezone"
																				name="timezone"
																				options={timezone ? timezone : []}
																				value={props.values.timezone}
																				onChange={(option) => {
																					if (option && option.value) {
																						props.handleChange('timezone')(
																							option,
																						);
																					} else {
																						props.handleChange('timezone')('');
																					}
																				}}
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
																	{/* <Col lg={6}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="active">Status</Label>
																			<div>
																				<FormGroup check inline>
																					<div className="custom-radio">
																						<Input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio1"
																							name="active"
																							checked={
																								props.values.active === 'true'
																							}
																							value="true"
																							onChange={(e) => {
																								props.handleChange('active')(
																									e.target.value,
																								);
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
																					<div className="custom-radio">
																						<Input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio2"
																							name="active"
																							checked={
																								props.values.active === 'false'
																							}
																							value="false"
																							onChange={(e) => {
																								props.handleChange('active')(
																									e.target.value,
																								);
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
																	</Col> */}
																	{/* <Col lg={6}>
                                    <FormGroup>
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

                                    </FormGroup>
                                  </Col> */}
																</Row>
																<Row></Row>
																<Row>
																	<Col lg={6}>
																		<FormGroup>
																			<Label htmlFor="select">
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
																		<FormGroup>
																			<Label htmlFor="select">
																				<span className="text-danger">*</span>
																				Confirm Password
																			</Label>
																			<Input
																				type="password"
																				id="confirmPassword"
																				name="confirmPassword"
																				value={props.values.confirmPassword}
																				placeholder="Enter the Confirm Password"
																				onChange={(value) => {
																					props.handleChange('confirmPassword')(
																						value,
																					);
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
															
															</Col>
														</Row>
														<Row>
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right">
																	<Button
																	    ref="btn"
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.createDisabled}
																		onClick={() => {
																			this.setState(
																				{ 
																					createMore: false,
																				},
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		Create
																	</Button>
																	<Button
																		name="button"
																		color="primary"
																		className="btn-square mr-3"
																		onClick={() => {
																			this.setState(
																				{ createMore: true },
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-refresh"></i> Create and
																		More
																	</Button>
																	<Button
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/settings/user',
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
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateUser);
