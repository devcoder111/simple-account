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
import { selectOptionsFactory, selectCurrencyFactory } from 'utils';

import './style.scss';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as CreateContactActions from './actions';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

const mapStateToProps = (state) => {
	return {
		country_list: state.contact.country_list,
		state_list: state.contact.state_list,
		currency_list: state.contact.currency_list,
		contact_type_list: state.contact.contact_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		contactActions: bindActionCreators(ContactActions, dispatch),
		createContactActions: bindActionCreators(CreateContactActions, dispatch),
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
class CreateContact extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			initValue: {
				billingEmail: '',
				city: '',
				contactType: '',
				contractPoNumber: '',
				countryId: '',
				currencyCode: '',
				email: '',
				firstName: '',
				addressLine1: '',
				addressLine2: '',
				addressLine3: '',
				// language(Language, optional),
				lastName: '',
				middleName: '',
				mobileNumber: '',
				organization: '',
				poBoxNumber: '',
				postZipCode: '',
				stateId: '',
				telephone: '',
				vatRegistrationNumber: '',
				disabled: false,
			},
			createMore: false,
		};
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s,'-]+$/;
		this.formRef = React.createRef();
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.contactActions.getContactTypeList();
		this.props.contactActions.getCountryList();
		this.props.contactActions.getCurrencyList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currencyCode: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
				},
			});
			this.formRef.current.setFieldValue(
				'currencyCode',
				response.data[0].currencyCode,
				true,
			);
		});
	};

	getData = (data) => {
		let temp = {};
		for (let item in data) {
			if (typeof data[`${item}`] !== 'object') {
				temp[`${item}`] = data[`${item}`];
			} else {
				temp[`${item}`] = data[`${item}`].value;
			}
		}
		return temp;
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const postData = this.getData(data);
		this.props.createContactActions
			.createContact(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						'New Contact Created Successfully',
					);
					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.setState({ createMore: false });
					} else {
						this.props.history.push('/admin/master/contact');
					}
				}
			})
			.catch((err) => {
				console.log(err);
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data : 'Something Went Wrong',
				);
			});
	};

	getStateList = (countryCode) => {
		this.props.contactActions.getStateList(countryCode);
	};

	render() {
		const {
			currency_list,
			country_list,
			contact_type_list,
			state_list,
		} = this.props;
		const { initValue } = this.state;
		return (
			<div className="create-contact-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-id-card-alt" />
												<span className="ml-2">Create Contact</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<Formik
												initialValues={initValue}
												ref={this.formRef}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validationSchema={Yup.object().shape({
													firstName: Yup.string().required(
														'First Name is Required',
													),
													// lastName: Yup.string().required(
													//   'Last Name is Required',
													// ),
													// middleName: Yup.string().required(
													//   'Middle Name is Required',
													// ),
													currencyCode: Yup.string().required(
														'Currency is Required',
													),
													contactType: Yup.string().required(
														'Contact Type is Required',
													),
													//       organization: Yup.string()
													//       .required("Organization Name is Required"),
													//     poBoxNumber: Yup.number()
													//       .required("PO Box Number is Required"),
													email: Yup.string()
														.required('Email is Required')
														.email('Invalid Email'),
													// telephone: Yup.number().required(
													//   'Telephone Number is Required',
													// ),
													mobileNumber: Yup.string()
														.required('Mobile Number is required')
														.test(
															'quantity',
															'Invalid Mobile Number',
															(value) => {
																if (isValidPhoneNumber(value)) {
																	return true;
																} else {
																	return false;
																}
															},
														),
													//     addressLine1: Yup.string()
													//       .required("Address is required"),
													// countryId: Yup.string()
													//   .required('Country is Required')
													//   .nullable(),
													// stateId: Yup.string().when('countryId', {
													//   is: (val) => (val ? true : false),
													//   then: Yup.string().required('State is Required'),
													// }),
													// postZipCode: Yup.string().required(
													//   'Postal Code is Required',
													// ),
													// addressLine1: Yup.string()
													//   .min(2, 'Must be at least 2 characters.')
													//   .matches(
													//     this.regExAddress,
													//     'May only contain hyphens, periods, commas or alphanumeric characters.',
													//   ),
													// addressLine2: Yup.string()
													//   .min(2, 'Must be at least 2 characters.')
													//   .matches(
													//     this.regExAddress,
													//     'May only contain hyphens, periods, commas or alphanumeric characters.',
													//   ),
													// addressLine3: Yup.string()
													//   .min(2, 'Must be at least 2 characters.')
													//   .matches(
													//     this.regExAddress,
													//     'May only contain hyphens, periods, commas or alphanumeric characters.',
													//   ),
													//     billingEmail: Yup.string()
													//       .required("Billing Email is Required")
													//       .email('Invalid Email'),
													//     contractPoNumber: Yup.number()
													//       .required("Contract PoNumber is Required"),
													// vatRegistrationNumber: Yup.string().required(
													//   'Tax Registration Number is Required',
													// ),
													//       currencyCode: Yup.string()
													//       .required("Please Select Currency")
													//       .nullable(),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<h4 className="mb-4">Contact Name</h4>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="select">
																		<span className="text-danger">*</span>First
																		Name
																	</Label>
																	<Input
																		type="text"
																		maxLength="26"
																		id="firstName"
																		name="firstName"
																		placeholder="Enter First Name"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAlpha.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('firstName')(option);
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
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="middleName ">
																		Middle Name
																	</Label>
																	<Input
																		type="text"
																		maxLength="26"
																		id="middleName "
																		name="middleName "
																		placeholder="Enter Middle Name"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAlpha.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('middleName')(
																					option,
																				);
																			}
																		}}
																		value={props.values.middleName}
																		className={
																			props.errors.middleName &&
																			props.touched.middleName
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.middleName &&
																		props.touched.middleName && (
																			<div className="invalid-feedback">
																				{props.errors.middleName}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="lastName">Last Name</Label>
																	<Input
																		type="text"
																		maxLength="26"
																		id="lastName"
																		name="lastName"
																		placeholder="Enter Last Name"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAlpha.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('lastName')(option);
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
														<hr />
														<h4 className="mb-3 mt-3">Contact Details</h4>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="countryId">
																		<span className="text-danger">*</span>
																		Contact Type
																	</Label>
																	<Select
																		styles={customStyles}
																		options={
																			contact_type_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						contact_type_list,
																						'Contact Type',
																				  )
																				: []
																		}
																		value={props.values.contactType}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('contactType')(
																					option,
																				);
																			} else {
																				props.handleChange('contactType')('');
																			}
																		}}
																		placeholder="Select Contact Type"
																		id="contactType"
																		name="contactType"
																		className={
																			props.errors.contactType &&
																			props.touched.contactType
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.contactType &&
																		props.touched.contactType && (
																			<div className="invalid-feedback">
																				{props.errors.contactType}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="organization ">
																		Organization Name
																	</Label>
																	<Input
																		type="text"
																		maxLength="50"
																		id="organization"
																		name="organization"
																		placeholder="Enter Organization Name"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAlpha.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('organization')(
																					option,
																				);
																			}
																		}}
																		value={props.values.organization}
																		className={
																			props.errors.organization &&
																			props.touched.organization
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.organization &&
																		props.touched.organization && (
																			<div className="invalid-feedback">
																				{props.errors.organization}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="select">PO Box Number</Label>
																	<Input
																		type="text"
																		maxLength="8"
																		id="poBoxNumber"
																		name="poBoxNumber"
																		placeholder="Enter PO Box Number"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(option.target.value)
																			) {
																				props.handleChange('poBoxNumber')(
																					option,
																				);
																			}
																		}}
																		value={props.values.poBoxNumber}
																		className={
																			props.errors.poBoxNumber &&
																			props.touched.poBoxNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.poBoxNumber &&
																		props.touched.poBoxNumber && (
																			<div className="invalid-feedback">
																				{props.errors.poBoxNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="email">
																		<span className="text-danger">*</span>Email
																	</Label>
																	<Input
																		type="text"
																		maxLength="80"
																		id="email"
																		name="email"
																		placeholder="Enter Email Address"
																		onChange={(option) => {
																				props.handleChange('email')(option);
																		}}
																		value={props.values.email}
																		className={
																			props.errors.email && props.touched.email
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
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="telephone">Telephone</Label>
																	<Input
																		type="text"
																		id="telephone"
																		name="telephone"
																		placeholder="Enter Telephone Number"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(option.target.value)
																			) {
																				props.handleChange('telephone')(option);
																			}
																		}}
																		value={props.values.telephone}
																		className={
																			props.errors.telephone &&
																			props.touched.telephone
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.telephone &&
																		props.touched.telephone && (
																			<div className="invalid-feedback">
																				{props.errors.telephone}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="mobileNumber">
																		<span className="text-danger">*</span>Mobile
																		Number
																	</Label>
																	{/* <Input
                                    type="text"
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    
                                    onChange={(value) => { props.handleChange("mobileNumber")(value) }}
                                    value={props.values.mobileNumber}
                                    className={
                                      props.errors.mobileNumber && props.touched.mobileNumber
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.mobileNumber && props.touched.mobileNumber && (
                                    <div className="invalid-feedback">{props.errors.mobileNumber}</div>
                                  )} */}
																	<PhoneInput
																		id="mobileNumber"
																		name="mobileNumber"
																		defaultCountry="AE"
																		international
																		value={props.values.mobileNumber}
																		placeholder="Enter Mobile Number"
																		onBlur={props.handleBlur('mobileNumber')}
																		onChange={(option) => {
																			props.handleChange('mobileNumber')(
																				option,
																			);
																		}}
																		className={
																			props.errors.mobileNumber &&
																			props.touched.mobileNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.mobileNumber &&
																		props.touched.mobileNumber && (
																			<div className="invalid-feedback">
																				{props.errors.mobileNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="addressLine1">
																		Address Line1
																	</Label>
																	<Input
																		type="text"
																		maxLength="100"
																		id="addressLine1"
																		name="addressLine1"
																		placeholder="Enter Address Line1"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAddress.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('addressLine1')(
																					option,
																				);
																			}
																		}}
																		value={props.values.addressLine1}
																		className={
																			props.errors.addressLine1 &&
																			props.touched.addressLine1
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.addressLine1 &&
																		props.touched.addressLine1 && (
																			<div className="invalid-feedback">
																				{props.errors.addressLine1}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="addressLine2">
																		Address Line2
																	</Label>
																	<Input
																		type="text"
																		maxLength="100"
																		id="addressLine2"
																		name="addressLine2"
																		placeholder="Enter Address Line2"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAddress.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('addressLine2')(
																					option,
																				);
																			}
																		}}
																		value={props.values.addressLine2}
																	/>
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="addressLine3">
																		Address Line3
																	</Label>
																	<Input
																		type="text"
																		maxLength="100"
																		id="addressLine3"
																		name="addressLine3"
																		placeholder="Enter Address Line3"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAddress.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('addressLine3')(
																					option,
																				);
																			}
																		}}
																		value={props.values.addressLine3}
																	/>
																</FormGroup>
															</Col>
														</Row>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="countryId">Country</Label>
																	<Select
																		styles={customStyles}
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
																		value={props.values.countryId}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('countryId')(option);
																				this.getStateList(option.value);
																			} else {
																				props.handleChange('countryId')('');
																				this.getStateList('');
																			}
																			props.handleChange('stateId')({
																				label: 'Select State',
																				value: '',
																			});
																		}}
																		placeholder="Select Country"
																		id="countryId"
																		name="countryId"
																		className={
																			props.errors.countryId &&
																			props.touched.countryId
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.countryId &&
																		props.touched.countryId && (
																			<div className="invalid-feedback">
																				{props.errors.countryId}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="stateId">State Region</Label>
																	<Select
																		styles={customStyles}
																		options={
																			state_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						state_list,
																						'State',
																				  )
																				: []
																		}
																		value={props.values.stateId}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('stateId')(option);
																			} else {
																				props.handleChange('stateId')('');
																			}
																		}}
																		placeholder="Select State"
																		id="stateId"
																		name="stateId"
																		className={
																			props.errors.stateId &&
																			props.touched.stateId
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.stateId &&
																		props.touched.stateId && (
																			<div className="invalid-feedback">
																				{props.errors.stateId}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="city">City</Label>
																	<Input
																		// options={city ? selectOptionsFactory.renderOptions('cityName', 'cityCode', cityRegion) : ''}
																		value={props.values.city}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAlpha.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('city')(option);
																			}
																		}}
																		placeholder="Enter City"
																		id="city"
																		name="city"
																		type="text"
																		maxLength="20"
																		className={
																			props.errors.city && props.touched.city
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.city && props.touched.city && (
																		<div className="invalid-feedback">
																			{props.errors.city}
																		</div>
																	)}
																</FormGroup>
															</Col>
														</Row>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="postZipCode">
																		Post Zip Code
																	</Label>
																	<Input
																		type="text"
																		maxLength="8"
																		id="postZipCode"
																		name="postZipCode"
																		placeholder="Enter Postal Zip Code"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(option.target.value)
																			) {
																				props.handleChange('postZipCode')(
																					option,
																				);
																			}
																		}}
																		value={props.values.postZipCode}
																		className={
																			props.errors.postZipCode &&
																			props.touched.postZipCode
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.postZipCode &&
																		props.touched.postZipCode && (
																			<div className="invalid-feedback">
																				{props.errors.postZipCode}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>

														<hr />
														<h4 className="mb-3 mt-3">Invoicing Details</h4>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="billingEmail">
																		Billing Email
																	</Label>
																	<Input
																		type="text"
																		maxLength="80"
																		id="billingEmail"
																		name="billingEmail"
																		placeholder="Enter Billing Email Address"
																		onChange={(value) => {
																			props.handleChange('billingEmail')(value);
																		}}
																		value={props.values.billingEmail}
																		className={
																			props.errors.billingEmail &&
																			props.touched.billingEmail
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.billingEmail &&
																		props.touched.billingEmail && (
																			<div className="invalid-feedback">
																				{props.errors.billingEmail}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="contractPoNumber">
																		Contract PO Number
																	</Label>
																	<Input
																		type="text"
																		maxLength="8"
																		id="contractPoNumber"
																		name="contractPoNumber"
																		placeholder="Enter Contract PO Number"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(option.target.value)
																			) {
																				props.handleChange('contractPoNumber')(
																					option,
																				);
																			}
																		}}
																		value={props.values.contractPoNumber}
																		className={
																			props.errors.contractPoNumber &&
																			props.touched.contractPoNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.contractPoNumber &&
																		props.touched.contractPoNumber && (
																			<div className="invalid-feedback">
																				{props.errors.contractPoNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row className="row-wrapper">
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="vatRegistrationNumber">
																		Tax Registration Number
																	</Label>
																	<Input
																		type="text"
																		maxLength="20"
																		id="vatRegistrationNumber"
																		name="vatRegistrationNumber"
																		placeholder="Enter Tax Registration Number"
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExBoth.test(option.target.value)
																			) {
																				props.handleChange(
																					'vatRegistrationNumber',
																				)(option);
																			}
																		}}
																		value={props.values.vatRegistrationNumber}
																		className={
																			props.errors.vatRegistrationNumber &&
																			props.touched.vatRegistrationNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.vatRegistrationNumber &&
																		props.touched.vatRegistrationNumber && (
																			<div className="invalid-feedback">
																				{props.errors.vatRegistrationNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col md="4">
																<FormGroup>
																	<Label htmlFor="currencyCode">
																		<span className="text-danger">*</span>
																		Currency
																	</Label>
																	<Select
																		styles={customStyles}
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
																						+props.values.currencyCode,
																				)
																		}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('currencyCode')(
																					option,
																				);
																			} else {
																				props.handleChange('currencyCode')('');
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
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right">
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		onClick={() => {
																			this.setState(
																				{ createMore: false },
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
																				'/admin/master/contact',
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateContact);
