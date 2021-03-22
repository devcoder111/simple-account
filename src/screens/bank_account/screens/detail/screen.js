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
import _ from 'lodash';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Loader, ConfirmDeleteModal } from 'components';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';
import * as detailBankAccountActions from './actions';
import * as BankAccountActions from '../../actions';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		account_type_list: state.bank_account.account_type_list,
		currency_list: state.bank_account.currency_list,
		country_list: state.bank_account.country_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		bankAccountActions: bindActionCreators(BankAccountActions, dispatch),
		detailBankAccountActions: bindActionCreators(
			detailBankAccountActions,
			dispatch,
		),
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

class DetailBankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			country_list: [
				{
					countryCode: 229,
					countryDescription: null,
					countryFullName: 'United Arab Emirates - (null)',
					countryName: 'United Arab Emirates',
					createdBy: 0,
					createdDate: '2020-03-21T05:55:16.000+0000',
					currencyCode: null,
					defaltFlag: 'Y',
					deleteFlag: false,
					isoAlpha3Code: null,
					lastUpdateBy: null,
					lastUpdateDate: null,
					orderSequence: null,
					versionNumber: 1,
				},
				{
					countryCode: 101,
					countryDescription: null,
					countryFullName: 'India  - (null)',
					countryName: 'India',
					createdBy: 0,
					createdDate: '2020-03-21T05:55:16.000+0000',
					currencyCode: null,
					defaltFlag: 'Y',
					deleteFlag: false,
					isoAlpha3Code: null,
					lastUpdateBy: null,
					lastUpdateDate: null,
					orderSequence: null,
					versionNumber: 1,
				},
			],
			dialog: null,

			current_bank_account_id: null,
			current_bank_account: null,

			initialVals: null,
			currentData: {},
		};

		this.regExAlpha = /^[a-zA-Z]+$/;
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.ifscCode = /[a-zA-Z0-9]+$/;
		this.swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

		this.account_for = [
			{ label: 'Personal', value: 'P' },
			{ label: 'Corporate', value: 'C' },
		];
	}

	componentDidMount = () => {
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			this.initializeData();
			this.updateOpeningBalance(this.props.location.state.bankAccountId);
			this.setState(
				{
					current_bank_account_id: this.props.location.state.bankAccountId,
				},
				() => {
					this.props.detailBankAccountActions
						.getBankAccountByID(this.state.current_bank_account_id)
						.then((res) => {
							this.setState({
								current_bank_account: res,
								initialVals: {
									account_name: res.bankAccountName,
									currency: res.bankAccountCurrency
										? res.bankAccountCurrency
										: '',
									opening_balance: res.openingBalance,
									account_type: res.bankAccountType ? res.bankAccountType : '',
									bank_name: res.bankName,
									account_number: res.accountNumber,
									ifsc_code: res.ifscCode,
									swift_code: res.swiftCode,
									country: res.bankCountry ? res.bankCountry : '',
									account_is_for: res.personalCorporateAccountInd
										? res.personalCorporateAccountInd
										: '',
									openingDate: moment(res.openingDate).format('DD/MM/YYYY'),
								},
							});
						})
						.catch((err) => {
							this.props.commonActions.tostifyAlert(
								'error',
								err && err.data ? err.data.message : 'Something Went Wrong',
							);
							this.props.history.push('/admin/banking/bank-account');
						});
				},
			);
		} else {
			this.props.history.push('/admin/banking/bank-account');
		}
	};

	initializeData = () => {
		this.props.detailBankAccountActions.getAccountTypeList();
		this.props.detailBankAccountActions.getCurrencyList();
		this.props.detailBankAccountActions.getCountryList();
	};

	handleChange = (e, name) => {
		this.setState({
			currentData: _.set(
				{ ...this.state.currentData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};

	handleSubmit = (data) => {
		let obj = {
			bankAccountId: this.state.current_bank_account_id,
			bankAccountName: data.account_name,
			bankAccountCurrency: data.currency,
			personalCorporateAccountInd: data.account_is_for,
			bankName: data.bank_name,
			accountNumber: data.account_number,
			ifscCode: data.ifsc_code,
			swiftCode: data.swift_code,
			openingBalance: data.opening_balance,
			//openingDate: data.openingDate,
			bankCountry: data.country,
			bankAccountType: data.account_type,
		};
		this.props.detailBankAccountActions
			.updateBankAccount(obj)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Bank Account Details Updated Successfully',
					);
					this.props.history.push('/admin/banking/bank-account');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	closeBankAccount = (current_bank_account_id) => {
		this.props.bankAccountActions
			.getExplainCount(current_bank_account_id)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to unexplain all the transaction to delete this bank',
					);
				} else {
					const message1 =
					<text>
					<b>Delete Bank Account?</b>
					</text>
					const message ='This Bank Account will be deleted permanently and cannot be recovered.';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={() => this.removeBankAccount(current_bank_account_id)}
								cancelHandler={this.removeDialog}
								message1={message1}
								message={message}
							/>
						),
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	removeBankAccount = () => {
		let { current_bank_account_id } = this.state;
		this.removeDialog();
		this.props.detailBankAccountActions
			.removeBankAccountByID(current_bank_account_id)
			.then(() => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Bank Account Deleted Successfully',
				);
				this.props.history.push('/admin/banking/bank-account');
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

	updateOpeningBalance = (_id) => {
		this.props.bankAccountActions
			.getExplainCount(_id)
			.then((res) => {
				this.setState({ transactionCount: res.data });
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	render() {
		const { account_type_list, currency_list, country_list } = this.props;

		const { initialVals, current_bank_account, dialog,current_bank_account_id } = this.state;

		return (
			<div className="detail-bank-account-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-university" />
										<span className="ml-2">
											Update Bank Account{' '}
											{current_bank_account
												? ` - ${current_bank_account.bankAccountName}`
												: ''}
										</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Row>
								<Col lg={12}>
									{initialVals ? (
										<Formik
											initialValues={initialVals}
											onSubmit={(values, { resetForm }) => {
												this.handleSubmit(values);
											}}
											validationSchema={Yup.object().shape({
												account_name: Yup.string()
													.required('Account Name is Required')
													.min(2, 'Account Name Is Too Short!')
													.max(30, 'Account Name Is Too Long!'),
												opening_balance: Yup.string().required(
													'Opening Balance is Required',
												),
												currency: Yup.string().required('Currency is required'),
												account_type: Yup.string().required(
													'Account Type is required',
												),
												bank_name: Yup.string()
													.required('Bank Name is Required')
													.min(2, 'Bank Name Is Too Short!')
													.max(20, 'Bank Name Is Too Long!'),
												account_number: Yup.string()
													.required('Account Number is Required')
													.min(2, 'Account Number Is Too Short!')
													.max(20, 'Account Number Is Too Long!'),
												account_is_for: Yup.string().required(
													'Account for is required',
												),
											})}
										>
											{(props) => (
												<Form onSubmit={props.handleSubmit}>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="account_name">
																	<span className="text-danger">*</span>Account
																	Name
																</Label>
																<Input
																	type="text"
																	id="account_name"
																	name="account_name"
																	placeholder="Enter Account Name"
																	value={props.values.account_name}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExAlpha.test(option.target.value)
																		) {
																			props.handleChange('account_name')(
																				option,
																			);
																		} else {
																			props.handleChange('account_name')(
																				option,
																			);
																		}
																	}}
																	className={
																		props.errors.account_name &&
																		props.touched.account_name
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.account_name &&
																	props.touched.account_name && (
																		<div className="invalid-feedback">
																			{props.errors.account_name}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="currency">
																	<span className="text-danger">*</span>Currency
																</Label>
																<Select
																	styles={customStyles}
																	id="currency"
																	name="currency"
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
																					+props.values.currency,
																			)
																	}
																	onChange={(option) => {
																		if (option && option.value) {
																			props.handleChange('currency')(
																				option.value,
																			);
																		} else {
																			props.handleChange('currency')('');
																		}
																	}}
																	className={
																		props.errors.currency &&
																		props.touched.currency
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.currency &&
																	props.touched.currency && (
																		<div className="invalid-feedback">
																			{props.errors.currency}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="opening_balance">
																	<span className="text-danger">*</span>Opening
																	Balance
																</Label>
																<Input
																	type="text"
																	id="opening_balance"
																	name="opening_balance"
																	readOnly={
																		this.state.transactionCount > 0
																			? true
																			: false
																	}
																	placeholder="Your Opening Balance"
																	value={props.values.opening_balance}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regEx.test(option.target.value)
																		) {
																			props.handleChange('opening_balance')(
																				option,
																			);
																		} else {
																			props.handleChange('opening_balance')(
																				option,
																			);
																		}
																	}}
																	className={
																		props.errors.opening_balance &&
																		props.touched.opening_balance
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.opening_balance &&
																	props.touched.opening_balance && (
																		<div className="invalid-feedback">
																			{props.errors.opening_balance}
																		</div>
																	)}
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="opening_date">
																	<span className="text-danger">*</span>
																	Opening Date
																</Label>
																<DatePicker
																	id="date"
																	name="openingDate"
																	className={`form-control ${
																		props.errors.openingDate &&
																		props.touched.openingDate
																			? 'is-invalid'
																			: ''
																	}`}
																	placeholderText="Expense Date"
																	value={props.values.openingDate}
																	showMonthDropdown
																	showYearDropdown
																	disabled
																	dropdownMode="select"
																	dateFormat="dd/MM/yyyy"
																	// maxDate={new Date()}
																	onChange={(value) => {
																		props.handleChange('openingDate')(value);
																	}}
																/>
																{props.errors.openingDate &&
																	props.touched.openingDate && (
																		<div className="invalid-feedback">
																			{props.errors.openingDate}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="">
																<Label htmlFor="account_type">
																	<span className="text-danger">*</span>
																	Account Type
																</Label>
																<Select
																	styles={customStyles}
																	id="account_type"
																	name="account_type"
																	options={
																		account_type_list
																			? selectOptionsFactory.renderOptions(
																					'name',
																					'id',
																					account_type_list,
																					'Account Type',
																			  )
																			: []
																	}
																	value={
																		account_type_list &&
																		selectOptionsFactory
																			.renderOptions(
																				'name',
																				'id',
																				account_type_list,
																				'Account Type',
																			)
																			.find(
																				(option) =>
																					option.value ===
																					props.values.account_type,
																			)
																	}
																	onChange={(option) => {
																		if (option && option.value) {
																			props.handleChange('account_type')(
																				option.value,
																			);
																		} else {
																			props.handleChange('account_type')('');
																		}
																	}}
																	className={
																		props.errors.account_type &&
																		props.touched.account_type
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.account_type &&
																	props.touched.account_type && (
																		<div className="invalid-feedback">
																			{props.errors.account_type}
																		</div>
																	)}
															</FormGroup>
														</Col>
													</Row>
													<hr />
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="bank_name">
																	<span className="text-danger">*</span>Bank
																	Name
																</Label>
																<Input
																	type="text"
																	id="bank_name"
																	name="bank_name"
																	placeholder="Enter Bank Name"
																	value={props.values.bank_name}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExAlpha.test(option.target.value)
																		) {
																			props.handleChange('bank_name')(option);
																		}
																		{
																			props.handleChange('bank_name')(option);
																		}
																	}}
																	className={
																		props.errors.bank_name &&
																		props.touched.bank_name
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.bank_name &&
																	props.touched.bank_name && (
																		<div className="invalid-feedback">
																			{props.errors.bank_name}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="account_number">
																	<span className="text-danger">*</span>Account
																	Number
																</Label>
																<Input
																	type="text"
																	id="account_number"
																	name="account_number"
																	placeholder="Enter Account Number"
																	value={props.values.account_number}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regEx.test(option.target.value)
																		) {
																			props.handleChange('account_number')(
																				option,
																			);
																		} else if (
																			this.regEx.test(option.target.value)
																		) {
																			props.handleChange('account_number')(
																				option,
																			);
																		}
																	}}
																	className={
																		props.errors.account_number &&
																		props.touched.account_number
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.account_number &&
																	props.touched.account_number && (
																		<div className="invalid-feedback">
																			{props.errors.account_number}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="countrycode">Country</Label>
																<Select
																	styles={customStyles}
																	id="countrycode"
																	name="countrycode"
																	options={
																		this.state.country_list
																			? selectOptionsFactory.renderOptions(
																					'countryName',
																					'countryCode',
																					this.state.country_list,
																					'Country',
																			  )
																			: []
																	}
																	onChange={(option) => {
																		if (option && option.value) {
																			props.handleChange('country')(
																				option.value,
																			);
																		} else {
																			props.handleChange('country')('');
																		}
																	}}
																	value={
																		this.state.country_list &&
																		selectOptionsFactory
																			.renderOptions(
																				'countryName',
																				'countryCode',
																				this.state.country_list,
																				'Country',
																			)
																			.find(
																				(option) =>
																					option.value ===
																					+props.values.country,
																			)
																	}
																	className={
																		props.errors.countrycode &&
																		props.touched.countrycode
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.countrycode &&
																	props.touched.countrycode && (
																		<div className="invalid-feedback">
																			{props.errors.countrycode}
																		</div>
																	)}
															</FormGroup>
														</Col>
													</Row>
													<Row>
														{/* <Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="ifsc_code">IFSC Code</Label>
																<Input
																	type="text"
																	id="ifsc_code"
																	name="ifsc_code"
																	placeholder="Enter IFSC Code"
																	value={props.values.ifsc_code || ''}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.ifscCode.test(option.target.value)
																		) {
																			props.handleChange('ifsc_code')(
																				option.target.value.toUpperCase(),
																			);
																		} else {
																			props.handleChange('ifsc_code')(
																				option.target.value.toUpperCase(),
																			);
																		}
																	}}
																	className={
																		props.errors.ifsc_code &&
																		props.touched.ifsc_code
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.ifsc_code &&
																	props.touched.ifsc_code && (
																		<div className="invalid-feedback">
																			{props.errors.ifsc_code}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="swift_code">Swift Code</Label>
																<Input
																	type="text"
																	id="swift_code"
																	maxLength="11"
																	name="swift_code"
																	placeholder="Enter Swift Code"
																	value={props.values.swift_code}
																	onChange={props.handleChange}
																	className={
																		props.errors.swift_code &&
																		props.touched.swift_code
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.swift_code &&
																	props.touched.swift_code && (
																		<div className="invalid-feedback">
																			{props.errors.swift_code}
																		</div>
																	)}
															</FormGroup>
														</Col> */}
													</Row>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="account_is_for">
																	<span className="text-danger">*</span>Account
																	is for
																</Label>
																<Select
																	styles={customStyles}
																	id="account_is_for"
																	name="account_is_for"
																	options={
																		this.account_for
																			? selectOptionsFactory.renderOptions(
																					'label',
																					'value',
																					this.account_for,
																					'Type',
																			  )
																			: []
																	}
																	value={
																		this.account_for &&
																		this.account_for.find(
																			(option) =>
																				option.value ===
																				props.values.account_is_for,
																		)
																	}
																	onChange={(option) => {
																		if (option && option.value) {
																			props.handleChange('account_is_for')(
																				option.value,
																			);
																		} else {
																			props.handleChange('account_is_for')('');
																		}
																	}}
																	className={
																		props.errors.account_is_for &&
																		props.touched.account_is_for
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.account_is_for &&
																	props.touched.account_is_for && (
																		<div className="invalid-feedback">
																			{props.errors.account_is_for}
																		</div>
																	)}
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col
															lg={12}
															className="d-flex align-items-center justify-content-between flex-wrap mt-5"
														>
															<FormGroup>
																<Button
																	type="button"
																	name="button"
																	color="danger"
																	className="btn-square"
																	onClick={() => this.closeBankAccount(current_bank_account_id)}
																>
																	<i className="fa fa-trash"></i> Delete
																</Button>
															</FormGroup>
															<FormGroup className="text-right">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																>
																	<i className="fa fa-dot-circle-o"></i> Update
																</Button>
																<Button
																	type="button"
																	name="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/banking/bank-account',
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
									) : (
										<Loader />
									)}
								</Col>
							</Row>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailBankAccount);
