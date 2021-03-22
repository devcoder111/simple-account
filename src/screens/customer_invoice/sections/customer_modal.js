import React from 'react';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
} from 'reactstrap';
import Select from 'react-select';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { toast } from 'react-toastify';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

class CustomerModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDetails : false,
			loading: false,
			initValue: {
				contactType: 2,
				billingEmail: '',
				city: '',
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
			},
			state_list: [],
		};
		this.formikRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s,'-]+$/;
	}

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

	// Create or Contact
	handleSubmit = (data, resetForm, setSubmitting) => {
		const postData = this.getData(data);
		this.props
			.createCustomer(postData)
			.then((res) => {
				let resConfig = JSON.parse(res.config.data);
				
				if (res.status === 200) {
					resetForm();
					this.props.closeCustomerModal(true);

					let tmpData = res.data;
					tmpData.currencyCode = resConfig.currencyCode;

					this.props.getCurrentUser(tmpData);
				}
			})
			.catch((err) => {
				this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});
	};

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
		  showDetails: bool
		});
	  }

	getStateList = (countryCode) => {
		if (countryCode) {
			this.props.getStateList(countryCode).then((res) => {
				if (res.status === 200) {
					this.setState({
						state_list: res.data,
					});
				}
			});
		} else {
			this.setState({
				state_list: [],
			});
		}
	};

	render() {
		const {
			openCustomerModal,
			closeCustomerModal,
			currency_list,
			country_list,
		} = this.props;
		const { initValue, state_list } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openCustomerModal}
					className="modal-success contact-modal"
				>
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						validationSchema={Yup.object().shape({
							firstName: Yup.string().required('First Name is Required'),
							vatRegistrationNumber: Yup.string().required('Tax Registration Number is required'),
							//currrencyCode: Yup.string().required('Currency is Required'),
							// contactType: Yup.string()
							// .required("Please Select Contact Type"),
							//       organization: Yup.string()
							//       .required("Organization Name is Required"),
							//     poBoxNumber: Yup.number()
							//       .required("PO Box Number is Required"),
							email: Yup.string()
								.required('Email is Required')
								.email('Invalid Email'),
							mobileNumber: Yup.string()
								.required('Mobile Number is required')
								.test('quantity', 'Invalid Mobile Number', (value) => {
									if (isValidPhoneNumber(value)) {
										return true;
									} else {
										return false;
									}
								}),
							//     addressLine1: Yup.string()
							//       .required("Address is required"),
							//     city: Yup.string()
							//       .required("City is Required"),
							//     billingEmail: Yup.string()
							//       .required("Billing Email is Required")
							//       .email('Invalid Email'),
							//     contractPoNumber: Yup.number()
							//       .required("Contract PoNumber is Required"),
							
							//       currencyCode: Yup.string()
							//       .required("Please Select Currency")
							//       .nullable(),
							currencyCode: Yup.string().required('Please Select Currency'),
						})}
					>
						{(props) => {
							const { isSubmitting } = props;
							return (
								<Form
									name="simpleForm"
									onSubmit={props.handleSubmit}
									className="create-contact-screen"
								>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">Create Contact</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
									<h4 className="mb-3 mt-3">Contact Details</h4>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="firstName">
														<span className="text-danger">*</span>First Name
													</Label>
													<Input
														type="text"
														maxLength="26"
														id="firstName"
														name="firstName"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('firstName')(option);
															}
														}}
														value={props.values.firstName}
														className={
															props.errors.firstName && props.touched.firstName
																? 'is-invalid'
																: ''
														}
														placeholder="Enter First Name"
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
													<Label htmlFor="middleName">Middle Name</Label>
													<Input
														type="text"
														maxLength="26"
														id="middleName "
														name="middleName "
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('middleName')(option);
															}
														}}
														value={props.values.middleName}
														className={
															props.errors.middleName &&
															props.touched.middleName
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Middle Name"
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
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('lastName')(option);
															}
														}}
														value={props.values.lastName}
														className={
															props.errors.lastName && props.touched.lastName
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Last Name"
													/>
													{props.errors.lastName && props.touched.lastName && (
														<div className="invalid-feedback">
															{props.errors.lastName}
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
														onChange={(value) => {
															props.handleChange('email')(value);
														}}
														value={props.values.email}
														className={
															props.errors.email && props.touched.email
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Email"
													/>
													{props.errors.email && props.touched.email && (
														<div className="invalid-feedback">
															{props.errors.email}
														</div>
													)}
												</FormGroup>
											</Col>
											<Col md="4">
											<FormGroup>
													<Label htmlFor="mobileNumber">
														{' '}
														<span className="text-danger">*</span>Mobile Number
													</Label>
													<PhoneInput
														defaultCountry="AE"
														international
														value={props.values.mobileNumber}
														onChange={(option) => {
															props.handleChange('mobileNumber')(option);
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
															<Col md="4">
												<FormGroup>
													<Label htmlFor="currrencyCode">
													<span className="text-danger">*</span>Currency
													</Label>
													<Select
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
																		option.value === +props.values.currencyCode,
																)
														}
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange('currencyCode')(option);
															} else {
																props.handleChange('currencyCode')('');
															}
														}}
														placeholder="Select Currency"
														id="currrencyCode"
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
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="vatRegistrationNumber">
													<span className="text-danger">*</span>
														Tax Registration Number
													</Label>
													<Input
														type="text"
														maxLength="20"
														id="vatRegistrationNumber"
														name="vatRegistrationNumber"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('vatRegistrationNumber')(
																	option,
																);
															}
														}}
														value={props.values.vatRegistrationNumber}
														className={
															props.errors.vatRegistrationNumber &&
															props.touched.vatRegistrationNumber
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Tax Registration Number"
													/>
													{props.errors.vatRegistrationNumber &&
														props.touched.vatRegistrationNumber && (
															<div className="invalid-feedback">
																{props.errors.vatRegistrationNumber}
															</div>
														)}
												</FormGroup>
											</Col>
										</Row>
										<Row> 
											<Button
											className="mb-3 ml-2"
											 onClick={this._showDetails.bind(null, true)}
											 disabled={
												this._showDetails === true
											}
										 >	More Details
											 </Button>
											 </Row> 	
									{this.state.showDetails &&
										(<div id="moreDetails">

										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="organization ">
														Organization Name
													</Label>
													<Input
														type="text"
														maxLength="80"
														id="organization"
														name="organization"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('organization')(option);
															}
														}}
														value={props.values.organization}
														className={
															props.errors.organization &&
															props.touched.organization
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Organization Name"
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
														maxLength="10"
														id="poBoxNumber"
														name="poBoxNumber"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('poBoxNumber')(option);
															}
														}}
														value={props.values.poBoxNumber}
														className={
															props.errors.poBoxNumber &&
															props.touched.poBoxNumber
																? 'is-invalid'
																: ''
														}
														placeholder="Enter PO Box Number"
													/>
													{props.errors.poBoxNumber &&
														props.touched.poBoxNumber && (
															<div className="invalid-feedback">
																{props.errors.poBoxNumber}
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
															props.errors.telephone && props.touched.telephone
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Telephone Number"
													/>
													{props.errors.telephone &&
														props.touched.telephone && (
															<div className="invalid-feedback">
																{props.errors.telephone}
															</div>
														)}
												</FormGroup>
											</Col>
										</Row>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="addressLine1">Address Line1</Label>
													<Input
														type="text"
														maxLength="200"
														id="addressLine1"
														name="addressLine1"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAddress.test(option.target.value)
															) {
																props.handleChange('addressLine1')(option);
															}
														}}
														value={props.values.addressLine1}
														className={
															props.errors.addressLine1 &&
															props.touched.addressLine1
																? 'is-invalid'
																: ''
														}
														placeholder="Enter AddressLine 1"
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
													<Label htmlFor="addressLine2">Address Line2</Label>
													<Input
														type="text"
														maxLength="200"
														id="addressLine2"
														name="addressLine2"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAddress.test(option.target.value)
															) {
																props.handleChange('addressLine2')(option);
															}
														}}
														placeholder="Enter AddressLine 2"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="addressLine3">Address Line3</Label>
													<Input
														type="text"
														maxLength="200"
														id="addressLine3"
														name="addressLine3"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAddress.test(option.target.value)
															) {
																props.handleChange('addressLine3')(option);
															}
														}}
														placeholder="Enter AddressLine 3"
													/>
												</FormGroup>
											</Col>
										</Row>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="countryId">Country</Label>
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
														value={props.values.countryId}
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange('countryId')(option);
																this.getStateList(option.value);
															} else {
																props.handleChange('countryId')('');
																this.getStateList(option.value);
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
															props.errors.countryId && props.touched.countryId
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
															props.errors.stateId && props.touched.stateId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.stateId && props.touched.stateId && (
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
																this.regExAlpha.test(option.target.value)
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
													<Label htmlFor="postZipCode">Post Zip Code</Label>
													<Input
														type="text"
														maxLength="10"
														id="postZipCode"
														name="postZipCode"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('postZipCode')(option);
															}
														}}
														value={props.values.postZipCode}
														className={
															props.errors.postZipCode &&
															props.touched.postZipCode
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Postal ZipCode"
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
													<Label htmlFor="billingEmail">Billing Email</Label>
													<Input
														type="text"
														maxLength="80"
														id="billingEmail"
														name="billingEmail"
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
														placeholder="Enter Billing Email"
													/>
													{props.billingEmail && props.touched.billingEmail && (
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
														maxLength="10"
														id="contractPoNumber"
														name="contractPoNumber"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regEx.test(option.target.value)
															) {
																props.handleChange('contractPoNumber')(option);
															}
														}}
														value={props.values.contractPoNumber}
														className={
															props.errors.contractPoNumber &&
															props.touched.contractPoNumber
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Contract PoNumber"
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
										<Row>
										<IconButton 
										aria-label="delete"
										size="medium" 
										 onClick={this._showDetails.bind(null, false)}>
          								<i class="fa fa-angle-double-up" aria-hidden="true"></i>
       										 </IconButton>
										 </Row>
										</div>
											)}
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={isSubmitting}
										>
											<i className="fa fa-dot-circle-o"></i> Create
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeCustomerModal(false);
											}}
										>
											<i className="fa fa-ban"></i> Cancel
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>
				</Modal>
			</div>
		);
	}
}

export default CustomerModal;
