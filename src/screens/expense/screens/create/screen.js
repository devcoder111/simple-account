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

import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import * as ExpenseActions from '../../actions';
import * as ExpenseCreateActions from './actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';


import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		currency_list: state.expense.currency_list,
		project_list: state.expense.project_list,
		employee_list: state.expense.employee_list,
		vat_list: state.expense.vat_list,
		expense_categories_list: state.expense.expense_categories_list,
		bank_list: state.expense.bank_list,
		pay_mode_list: state.expense.pay_mode_list,
		user_list: state.expense.user_list,
		profile: state.auth.profile,
		currency_convert_list: state.currencyConvert.currency_convert_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		expenseActions: bindActionCreators(ExpenseActions, dispatch),
		expenseCreateActions: bindActionCreators(ExpenseCreateActions, dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
	};
};

class CreateExpense extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			createMore: false,
			disabled: false,
			initValue: {
				payee: '',
				expenseDate: '',
				currency: '',
				project: '',
				exchangeRate:'',
				expenseCategory: '',
				expenseAmount: '',
				expenseDescription: '',
				receiptNumber: '',
				attachmentFile: '',
				employee: '',
				receiptAttachmentDescription: '',
				vatCategoryId: '',
				payMode: '',
				bankAccountId: '',
			},
			currentData: {},
			fileName: '',
			payMode: '',
			exchangeRate:'',
			basecurrency:[],

		};
		this.formRef = React.createRef();
		this.options = {
			paginationPosition: 'top',
		};
		this.regEx = /^[0-9\b]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

		this.file_size = 1024000;
		this.supported_format = [
			'image/png',
			'image/jpeg',
			'text/plain',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];

		this.payMode = [
			{ label: 'CASH', value: 'CASH' },
			{ label: 'BANK', value: 'BANK' },
		];
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.expenseActions.getVatList();
		this.props.expenseActions.getExpenseCategoriesList();
		this.props.currencyConvertActions.getCurrencyConversionList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currency: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
				},
			});
			this.formRef.current.setFieldValue(
				'currency',
				response.data[0].currencyCode,
				true,
			);
		});
		this.props.expenseCreateActions.checkAuthStatus().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						payee: response.data ? parseInt(response.data.userId) : '',
					},
				},
			});
			this.formRef.current.setFieldValue('payee', response.data.userId, true);
		});
		this.props.expenseActions.getBankList();
		this.props.expenseActions.getPaymentMode();
		this.props.expenseActions.getUserForDropdown();
		this.getCompanyCurrency();

	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const {
			payee,
			expenseDate,
			currency,
			project,
			expenseCategory,
			expenseAmount,
			exchangeRate,
			employee,
			expenseDescription,
			receiptNumber,
			attachmentFile,
			receiptAttachmentDescription,
			vatCategoryId,
			payMode,
			bankAccountId,
		} = data;
		let formData = new FormData();
		formData.append('payee', payee ? payee : '');
		formData.append('expenseDate', expenseDate !== null ? expenseDate : '');
		formData.append('expenseDescription', expenseDescription);
		formData.append('receiptNumber', receiptNumber);
		formData.append(
			'receiptAttachmentDescription',
			receiptAttachmentDescription,
		);
		formData.append('expenseAmount', expenseAmount);
		if (payMode && payMode.value) {
			formData.append('payMode', payMode.value);
		}
		if (expenseCategory && expenseCategory.value) {
			formData.append('expenseCategory', expenseCategory.value);
		}
		if (employee && employee.value) {
			formData.append('employeeId', employee.value);
		}
		if (exchangeRate ) {
			formData.append('exchangeRate', exchangeRate);
		}
		if (currency) {
			formData.append('currencyCode', currency.value);
		}
		if (vatCategoryId && vatCategoryId.value) {
			formData.append('vatCategoryId', vatCategoryId.value);
		}
		if (bankAccountId && bankAccountId.value && payMode.value === 'BANK') {
			formData.append('bankAccountId', bankAccountId.value);
		}
		if (project && project.value) {
			formData.append('projectId', project.value);
		}
		if (this.uploadFile.files[0]) {
			formData.append('attachmentFile', this.uploadFile.files[0]);
		}
		this.props.expenseCreateActions
			.createExpense(formData)
			.then((res) => {
				this.setState({ disabled: false });
				if (res.status === 200) {
					resetForm(this.state.initValue);
					this.props.commonActions.tostifyAlert(
						'success',
						'New Expense Created Successfully.',
					);
					if (this.state.createMore) {
						this.setState({
							createMore: false,
						});
					} else {
						this.props.history.push('/admin/expense/expense');
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};
	
	getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};	
	setExchange = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
		return obj.currencyCode === value;
		});
		console.log( this.props.currency_convert_list)
		console.log(result)
this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
		};

		setCurrency = (value) => {
			let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
			});
			console.log( this.props.currency_convert_list)
			console.log(result)
			this.formRef.current.setFieldValue('curreancyname', result[0].currencyName, true);
			};

	handleFileChange = (e, props) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => {};
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};

	render() {
		const { initValue, payMode } = this.state;
		const {
			currency_list,
			expense_categories_list,
			vat_list,
			profile,
			user_list,
			pay_mode_list,
			bank_list,
			currency_convert_list,
		} = this.props;
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
		return (
			<div className="create-expense-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fab fa-stack-exchange" />
												<span className="ml-2">Create Expense</span>
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

													// this.setState({
													//   selectedCurrency: null,
													//   selectedProject: null,
													//   selectedBankAccount: null,
													//   selectedCustomer: null

													// })
												}}
												// validate={(values) => {
												// 	let errors = {};
												// 	if (
												// 		values.payMode.value === 'BANK' &&
												// 		!values.bankAccountId
												// 	) {
												// 		errors.bankAccountId = 'Bank Account is Required';
												// 	}
												// 	return errors;
												// }}
												validationSchema={Yup.object().shape({
													expenseCategory: Yup.string().required(
														'Expense Category is required',
													),
													expenseDate: Yup.date().required(
														'Expense Date is Required',
													),
													currency: Yup.string().required(
														'Currency is required',
													),
													//payee: Yup.string().required('Payee is required'),
													expenseAmount: Yup.string()
														.required('Amount is Required')
														.matches(
															/^[0-9][0-9]*[.]?[0-9]{0,2}$$/,
															'Enter a Valid Amount',
														),
													attachmentFile: Yup.mixed()
														.test(
															'fileType',
															'*Unsupported File Format',
															(value) => {
																value &&
																	this.setState({
																		fileName: value.name,
																	});
																if (
																	!value ||
																	(value &&
																		this.supported_format.includes(value.type))
																) {
																	return true;
																} else {
																	return false;
																}
															},
														)
														.test(
															'fileSize',
															'*File Size is too large',
															(value) => {
																if (
																	!value ||
																	(value && value.size <= this.file_size)
																) {
																	return true;
																} else {
																	return false;
																}
															},
														),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="expenseCategoryId">
																		<span className="text-danger">*</span>
																		Expense Category
																	</Label>
																	<Select
																		styles={customStyles}
																		id="expenseCategory"
																		name="expenseCategory"
																		placeholder="Select Expense Category"
																		options={
																			expense_categories_list
																				? selectOptionsFactory.renderOptions(
																						'transactionCategoryName',
																						'transactionCategoryId',
																						expense_categories_list,
																						'Expense Category',
																				  )
																				: []
																		}
																		value={props.values.expenseCategory}
																		className={
																			props.errors.expenseCategory &&
																			props.touched.expenseCategory
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>
																			props.handleChange('expenseCategory')(
																				option,
																			)
																		}
																	/>
																	{props.errors.expenseCategory &&
																		props.touched.expenseCategory && (
																			<div className="invalid-feedback">
																				{props.errors.expenseCategory}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="payee">
																		<span className="text-danger">*</span>Payee
																	</Label>
																	<Select
																		styles={customStyles}
																		options={
																			user_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						user_list,
																						'Payee',
																				  )
																				: []
																		}
																		value={
																			user_list &&
																			profile &&
																			selectOptionsFactory
																				.renderOptions(
																					'label',
																					'value',
																					user_list,
																					'Payee',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						+props.values.payee,
																				)
																		}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('payee')(
																					option.value,
																				);
																			} else {
																				props.handleChange('payee')('');
																			}
																		}}
																		placeholder="Select Payee"
																		id="payee"
																		name="payee"
																		className={
																			props.errors.payee && props.touched.payee
																				? 'is-invalid'
																				: ''
																		}
																	/>
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="expense_date">
																		<span className="text-danger">*</span>
																		Expense Date
																	</Label>
																	<DatePicker
																		id="date"
																		name="expenseDate"
																		className={`form-control ${
																			props.errors.expenseDate &&
																			props.touched.expenseDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText="Expense Date"
																		selected={props.values.expenseDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd/MM/yyyy"
																		maxDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('expenseDate')(value);
																		}}
																	/>
																	{props.errors.expenseDate &&
																		props.touched.expenseDate && (
																			<div className="invalid-feedback">
																				{props.errors.expenseDate}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="currency">
																		<span className="text-danger">*</span>
																		Currency
																	</Label>
																	<Select
																		styles={customStyles}
																		id="currency"
																		name="currency"
																		options={
																			currency_convert_list
																				? selectCurrencyFactory.renderOptions(
																						'currencyName',
																						'currencyCode',
																						currency_convert_list,
																						'currency',
																				  )
																				: []
																		}
																		value={
																			currency_convert_list &&
																			selectCurrencyFactory
																				.renderOptions(
																					'currencyName',
																					'currencyCode',
																					currency_convert_list,
																					'Currency',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						+props.values.currencyCode,
																				)
																		}
																		onChange={(option) => {
																			props.handleChange('currency')(option);
																			this.setExchange(option.value);
																			this.setCurrency(option.value);
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
														</Row>
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="expenseAmount">
																		<span className="text-danger">*</span>Amount
																	</Label>
																	<Input
																		type="number"
																		maxLength="10"
																		name="expenseAmount"
																		id="expenseAmount"
																		rows="5"
																		className={
																			props.errors.expenseAmount &&
																			props.touched.expenseAmount
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regDecimal.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('expenseAmount')(
																					option,
																				);
																			}
																		}}
																		value={props.values.expenseAmount}
																		placeholder="Amount"
																	/>
																	{props.errors.expenseAmount &&
																		props.touched.expenseAmount && (
																			<div className="invalid-feedback">
																				{props.errors.expenseAmount}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="vatCategoryId">Tax</Label>
																	<Select
																		styles={customStyles}
																		className="select-default-width"
																		id="vatCategoryId"
																		name="vatCategoryId"
																		placeholder="Select Tax "
																		options={
																			vat_list
																				? selectOptionsFactory.renderOptions(
																						'name',
																						'id',
																						vat_list,
																						'Tax',
																				  )
																				: []
																		}
																		value={props.values.vatCategoryId}
																		onChange={(option) =>
																			props.handleChange('vatCategoryId')(
																				option,
																			)
																		}
																	/>
																</FormGroup>
															</Col>
															{!props.values.payee && (
																<Col lg={3}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="payMode">Pay Through</Label>
																		<Select
																			styles={customStyles}
																			id="payMode"
																			name="payMode"
																			placeholder="Select Pay
																		Through"
																			options={
																				pay_mode_list
																					? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							pay_mode_list,
																							'',
																					  )
																					: []
																			}
																			value={props.values.payMode}
																			onChange={(option) => {
																				props.handleChange('payMode')(option);
																				if (option && option.value) {
																					this.setState({
																						payMode: option,
																					});
																				} else {
																					this.setState({ payMode: '' });
																				}
																			}}
																			className={
																				props.errors.payMode &&
																				props.touched.payMode
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.payMode &&
																			props.touched.payMode && (
																				<div className="invalid-feedback">
																					{props.errors.payMode}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															)}
															{!props.values.payee && payMode.value === 'BANK' && (
																<Col lg={3}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="bankAccountId">
																			<span className="text-danger">*</span>Bank
																		</Label>
																		<Select
																			styles={customStyles}
																			id="bankAccountId"
																			name="bankAccountId"
																			options={
																				bank_list && bank_list.data
																					? selectOptionsFactory.renderOptions(
																							'accounName',
																							'bankAccountId',
																							bank_list.data,
																							'Bank',
																					  )
																					: []
																			}
																			value={props.values.bankAccountId}
																			onChange={(option) =>
																				props.handleChange('bankAccountId')(
																					option,
																				)
																			}
																			className={
																				props.errors.bankAccountId &&
																				props.touched.bankAccountId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.bankAccountId &&
																			props.touched.bankAccountId && (
																				<div className="invalid-feedback">
																					{props.errors.bankAccountId}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															)}
														</Row>
														<hr />
														<Row style={{display: props.values.exchangeRate === 1 ? 'none' : ''}}>
																<Col>
																<Label htmlFor="currency">
																		Currency Exchange Rate
																	</Label>	
																</Col>
																</Row>
																<Row style={{display: props.values.exchangeRate === 1 ? 'none' : ''}}>
																<Col lg={1}>
																<Input
																		disabled
																				id="1"
																				name="1"
																				value=	{
																					1 }
																				
																			/>
																</Col>
																<Col lg={2}>
																<FormGroup className="mb-3">
																	{/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
																	<div>
																		<Input
																		disabled	
																			className="form-control"
																			id="curreancyname"
																			name="curreancyname"
																			
																			value={props.values.curreancyname}
																			onChange={(value) => {
																				props.handleChange('curreancyname')(
																					value,
																				);
																			}}
																		/>
																	</div>
																</FormGroup>
															</Col>
															<FormGroup className="mt-2"><label><b>=</b></label>	</FormGroup>
															<Col lg={2}>
																<FormGroup className="mb-3">
																	{/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
																	<div>
																		<Input
																			type="number"
																			className="form-control"
																			id="exchangeRate"
																			name="exchangeRate"
																			
																			value={props.values.exchangeRate}
																			onChange={(value) => {
																				props.handleChange('exchangeRate')(
																					value,
																				);
																			}}
																		/>
																	</div>
																</FormGroup>
															</Col>
														
															<Col lg={2}>
															<Input
																		disabled
																				id="currencyName"
																				name="currencyName"
																				value=	{
																					this.state.basecurrency.currencyName }
																				
																			/>
														</Col>
														</Row>
														<Row>
															<Col lg={8}>
																<FormGroup className="mb-3">
																	<Label htmlFor="expenseDescription">
																		Description
																	</Label>
																	<Input
																		type="textarea"
																		maxLength="255"
																		name="expenseDescription"
																		id="expenseDescription"
																		rows="5"
																		placeholder="Expense Description"
																		onChange={(option) =>
																			props.handleChange('expenseDescription')(
																				option,
																			)
																		}
																		value={props.values.expenseDescription}
																	/>
																</FormGroup>
															</Col>
														</Row>
														<hr />
														<Row>
															<Col lg={8}>
																<Row>
																	<Col lg={6}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="receiptNumber">
																				Reciept Number
																			</Label>
																			<Input
																				type="text"
																				maxLength="50"
																				id="receiptNumber"
																				name="receiptNumber"
																				placeholder="Enter Reciept Number"
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						this.regExBoth.test(
																							option.target.value,
																						)
																					) {
																						props.handleChange('receiptNumber')(
																							option,
																						);
																					}
																				}}
																				value={props.values.receiptNumber}
																			/>
																		</FormGroup>
																	</Col>
																</Row>
																<Row>
																	<Col lg={12}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="receiptAttachmentDescription">
																				Attachment Description
																			</Label>
																			<Input
																				type="textarea"
																				maxLength="255"
																				name="receiptAttachmentDescription"
																				id="receiptAttachmentDescription"
																				rows="5"
																				placeholder="Receipt Attachment Description"
																				onChange={(option) =>
																					props.handleChange(
																						'receiptAttachmentDescription',
																					)(option)
																				}
																				value={
																					props.values
																						.receiptAttachmentDescription
																				}
																			/>
																		</FormGroup>
																	</Col>
																</Row>
															</Col>
															<Col lg={4}>
																<Row>
																	<Col lg={12}>
																		<FormGroup className="mb-3">
																			<Field
																				name="attachment"
																				render={({ field, form }) => (
																					<div>
																						<Label>Attachment</Label> <br />
																						<Button
																							color="primary"
																							onClick={() => {
																								document
																									.getElementById('fileInput')
																									.click();
																							}}
																							className="btn-square mr-3"
																						>
																							<i className="fa fa-upload"></i>{' '}
																							Upload
																						</Button>
																						<input
																							id="fileInput"
																							ref={(ref) => {
																								this.uploadFile = ref;
																							}}
																							type="file"
																							style={{ display: 'none' }}
																							onChange={(e) => {
																								this.handleFileChange(e, props);
																							}}
																						/>
																						{this.state.fileName && (
																							<div>
																								<i
																									className="fa fa-close"
																									onClick={() =>
																										this.setState({
																											fileName: '',
																										})
																									}
																								></i>{' '}
																								{this.state.fileName}
																							</div>
																						)}
																					</div>
																				)}
																			/>
																			{props.errors.attachmentFile &&
																				props.touched.attachmentFile && (
																					<div className="invalid-file">
																						{props.errors.attachmentFile}
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
																				'/admin/expense/expense',
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateExpense);
