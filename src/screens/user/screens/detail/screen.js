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
import { Loader, ConfirmDeleteModal, ImageUploader } from 'components';
import * as UserActions from '../../actions';
import * as UserDetailActions from './actions';

import { CommonActions, AuthActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';
// import 'react-images-uploader/styles.css'
// import 'react-images-uploader/font.css'
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

const eye = require('assets/images/settings/eye.png');
const mapStateToProps = (state) => {
	return {
		role_list: state.user.role_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		userDetailActions: bindActionCreators(UserDetailActions, dispatch),
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

class DetailUser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPasswordShown: false,
			loading: true,
			dialog: null,
			initValue: {},
			// passwordShown: false,
			selectedStatus: '',
			userPhoto: [],
			showIcon: false,
			userPhotoFile: {},
			imageState: true,
			current_user_id: null,
			disabled: false,
			timezone: [],
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
		if (this.props.location.state && this.props.location.state.id) {
			this.props.userDetailActions
				.getUserById(this.props.location.state.id)
				.then((res) => {
					this.props.userActions.getRoleList();
					if (res.status === 200) {
						this.setState({
							initValue: {
								firstName: res.data.firstName ? res.data.firstName : '',
								lastName: res.data.lastName ? res.data.lastName : '',
								email: res.data.email ? res.data.email : '',
								password: '',
								dob: res.data.dob
									? moment(res.data.dob, 'DD-MM-YYYY').toDate()
									: '',
								active: res.data.active ? res.data.active : '',
								confirmPassword: '',
								roleId: res.data.roleId ? res.data.roleId : '',
								companyId: res.data.companyId ? res.data.companyId : '',
								timeZone: res.data.timeZone ? res.data.timeZone : '',
								roleName:res.data.roleName ? res.data.roleName : '',
							},
							loading: false,
							selectedStatus: res.data.active ? true : false,
							userPhoto: res.data.profilePicByteArray
								? this.state.userPhoto.concat(res.data.profilePicByteArray)
								: [],
							current_user_id: this.props.location.state.id,
						});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.props.history.push('/admin/settings/user');
				});
		} else {
			this.props.history.push('/admin/settings/user');
		}
	};

	uploadImage = (picture, file) => {
		if (
			this.state.userPhoto[0] &&
			this.state.userPhoto[0].indexOf('data') < 0
		) {
			this.setState({ imageState: true });
		} else {
			this.setState({ imageState: false });
		}
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
	deleteUser = () => {
		const message1 = (
			<text>
				<b>Delete User?</b>
			</text>
		);
		const message =
			'This User will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeUser}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeUser = () => {
		const { current_user_id } = this.state;
			this.props.userDetailActions
			.deleteUser(current_user_id)
			.then((res) => {
				if (res.status === 200) {
					// this.success('Chart Account Deleted Successfully');
					this.props.commonActions.tostifyAlert(
						'success',
						'User Deleted Successfully',
					);
					this.props.history.push('/admin/settings/user');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	updateRoles = (id) => {
		this.props.authActions
			.checkAuthStatus()
			.then((response) => {
				this.props.commonActions.getRoleList(id);
			})
			.catch((err) => {
				this.props.authActions.logOut();
				this.props.history.push('/login');
			});
	};

	handleSubmit = (data) => {
		const {
			firstName,
			lastName,
			email,
			dob,
			password,
			roleId,
			companyId,
			timeZone,
		} = data;
		const { current_user_id } = this.state;
		const { userPhotoFile } = this.state;
		let formData = new FormData();
		formData.append('id', +current_user_id);

		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		formData.append('timeZone', timeZone ? timeZone : '');
		formData.append('dob', dob ? moment(dob).format('DD-MM-YYYY') : '');
		formData.append(
			'roleId',
			typeof roleId !== 'object' ? roleId : roleId.value,
		);
		formData.append('active', this.state.selectedStatus);
		formData.append('password', password ? password : '');
		formData.append('companyId', companyId ? companyId : '');
		if (this.state.userPhotoFile.length > 0) {
			formData.append('profilePic', userPhotoFile[0]);
		}
		if (this.state.initValue !== data) {
			this.setState({ disabled: true });
			this.props.userDetailActions
				.updateUser(formData)
				.then((res) => {
					if (res.status === 200) {
						this.setState({ disabled: false });
						this.props.commonActions.tostifyAlert(
							'success',
							'User Updated Successfully',
						);
					//	this.updateRoles(+current_user_id);
						this.props.history.push('/admin/settings/user');
					}
				})
				.catch((err) => {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		}
	};

	render() {
		const { loading, dialog, timezone,current_user_id } = this.state;
		const { role_list } = this.props;
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
												<span className="ml-2">Update User</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={this.state.initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
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
														roleId: Yup.string().required(
															'Role Name is Required',
														),
														timeZone: Yup.string().required(
															'Time Zone is Required',
														),
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
														//	dob: Yup.string().required('DOB is Required'),
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
																			imgExtension={[
																				'jpg',
																				'gif',
																				'png',
																				'jpeg',
																			]}
																			maxFileSize={1048576}
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
																			defaultImages={this.state.userPhoto}
																			imageState={this.state.imageState}
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
																					id="firstName"
																					name="firstName"
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
																					<span className="text-danger">*</span>
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
																							props.handleChange('lastName')(
																								option,
																							);
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
																					<span className="text-danger">*</span>
																					Email ID
																				</Label>
																				<Input
																					type="text"
																					id="email"
																					name="email"
																					placeholder="Enter Email ID"
																					value={props.values.email}
																					onChange={(value) => {
																						props.handleChange('email')(value);
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
																					className={`form-control ${
																						props.errors.dob &&
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
																					maxDate={new Date()}
																					autoComplete="off"
																					placeholderText="Enter Date of Birth"
																					// selected={props.values.dob}
																					value={
																						props.values.dob
																							? moment(props.values.dob).format(
																									'DD-MM-YYYY',
																							  )
																							: ''
																					}
																					onChange={(value) => {
																						props.handleChange('dob')(value);
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
																	{this.state.current_user_id !== 1 &&
																	  (
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
																											initValue:{
																												active:true
																											},
																											selectedStatus: true,
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
																											initValue:{
																												active:false
																											},
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
																	</Row>)}
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
																					value={
																						role_list &&
																						 selectOptionsFactory.renderOptions(
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
																					onChange={(option) =>
																						props.handleChange('roleId')(option)
																					}
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
																				<Label htmlFor="timeZone">
																					<span className="text-danger">*</span>
																					Time Zone Preference
																				</Label>
																				<Select
																					styles={customStyles}
																					id="timeZone"
																					name="timeZone"
																					options={timezone ? timezone : []}
																					value={
																						timezone &&
																						timezone.find(
																							(option) =>
																								option.value ===
																								props.values.timeZone,
																						)
																					}
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
																		{/* <Col lg={6}>
                                  <FormGroup>
                                    <Label htmlFor="companyId">Company</Label>
                                    <Select
                                      className="select-default-width"
                                      options={role_list ? selectOptionsFactory.renderOptions('roleName', 'roleCode', role_list , 'Role') : []}
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
																	
																</Col>
															</Row>
															<Row>
																<Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
															>
																
																	{this.state.current_user_id !== 1 &&
																	  (
																		<FormGroup>
																		<Button
																			type="button"
																			color="danger"
																			className="btn-square"
																			onClick={this.deleteUser}
																		>
																			<i className="fa fa-trash"></i> Delete
																		</Button>
																	</FormGroup>
																	)}
													
																	<FormGroup className="text-right w-100" >
																		{/* <Button
																			type="submit"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																				? 'Updating...'
																				: 'Update'}
																		</Button> */}
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
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailUser);
