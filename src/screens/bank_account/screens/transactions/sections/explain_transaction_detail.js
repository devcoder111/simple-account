import React from 'react';
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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import * as TransactionsActions from '../actions';
import * as transactionDetailActions from '../screens/detail/actions';
import * as CurrencyConvertActions from '../../../../currencyConvert/actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { Loader, ConfirmDeleteModal } from 'components';
import moment from 'moment';
import { selectOptionsFactory, selectCurrencyFactory } from 'utils';
const mapStateToProps = (state) => {
	return {
		expense_list: state.bank_account.expense_list,
		expense_categories_list: state.expense.expense_categories_list,
		user_list: state.bank_account.user_list,
		currency_list: state.bank_account.currency_list,
		vendor_list: state.bank_account.vendor_list,
		vat_list: state.bank_account.vat_list,
		currency_convert_list: state.currencyConvert.currency_convert_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		transactionsActions: bindActionCreators(TransactionsActions, dispatch),
		transactionDetailActions: bindActionCreators(
			transactionDetailActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
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

class ExplainTrasactionDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			createMore: false,
			loading: false,
			fileName: '',
			initValue: {},
			view: false,
			chartOfAccountCategoryList: [],
			transactionCategoryList: [],
			id: '',
			dialog: true,
			totalAmount: '',
			unexplainValue: [],
			creationMode: '',
			unexplainCust: [],
			customer_invoice_list_state: [],
			supplier_invoice_list_state: [],
		};

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
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;

		this.formRef = React.createRef();
	}

	componentDidMount = () => {
		if (this.props.selectedData) {
			this.initializeData();
		}
	};

	initializeData = () => {
		const { selectedData } = this.props;
		const { bankId } = this.props;
		this.setState({ loading: true, id: selectedData.id });
		this.getCompanyCurrency();
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

		});
		this.props.transactionDetailActions
			.getTransactionDetail(selectedData.id)
			.then((res) => {
				this.getChartOfAccountCategoryList(selectedData.debitCreditFlag);
				this.setState(
					{
						loading: false,
						creationMode: this.props.creationMode,
						initValue: {
							bankId: bankId,
							amount: res.data.amount ? res.data.amount : '',
							dueAmount:res.data.dueAmount ? res.data.dueAmount : '',
							date: res.data.date
								? moment(res.data.date, 'DD/MM/YYYY').format('DD/MM/YYYY')
								: '',
							description: res.data.description ? res.data.description : '',
							transactionCategoryId: res.data.transactionCategoryId
								? parseInt(res.data.transactionCategoryId)
								: '',
							transactionId: selectedData.id,
							vatId: res.data.vatId ? res.data.vatId : '',
							vendorId: res.data.vendorId ? res.data.vendorId : '',
							customerId: res.data.customerId ? res.data.customerId : '',
							employeeId: res.data.employeeId ? res.data.employeeId : '',
							explinationStatusEnum: res.data.explinationStatusEnum,
							reference: res.data.reference ? res.data.reference : '',
							exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
							//currencyName: res.data.currencyName ? res.data.currencyName : '',
							coaCategoryId: res.data.coaCategoryId
								? parseInt(res.data.coaCategoryId)
								: '',
							explainParamList: res.data.explainParamList
								? res.data.explainParamList
								: [],
							transactionCategoryLabel: res.data.transactionCategoryLabel
								? res.data.transactionCategoryLabel
								: '',
							invoiceError: '',
							expenseCategory: res.data.expenseCategory,
						//	currency: res.data.currencyCode ? res.data.currencyCode : '',
						},
						unexplainValue: {
							bankId: bankId,
							amount: res.data.amount ? res.data.amount : '',
							date: res.data.date
								? moment(res.data.date, 'DD/MM/YYYY').format('DD/MM/YYYY')
								: '',
							description: res.data.description ? res.data.description : '',
							transactionCategoryId: res.data.transactionCategoryId
								? parseInt(res.data.transactionCategoryId)
								: '',
							transactionId: selectedData.id,
							vatId: res.data.vatId ? res.data.vatId : '',
							vendorId: res.data.vendorId ? res.data.vendorId : '',
							customerId: res.data.customerId ? res.data.customerId : '',
							explinationStatusEnum: res.data.explinationStatusEnum,
							reference: res.data.reference ? res.data.reference : '',
							coaCategoryId: res.data.coaCategoryId
								? res.data.coaCategoryId
								: '',
							explainParamList: res.data.explainParamList
								? res.data.explainParamList
								: [],
							transactionCategoryLabel: res.data.transactionCategoryLabel
								? res.data.transactionCategoryLabel
								: '',
							invoiceError: '',
							expenseCategory: res.data.expenseCategory
								? parseInt(res.data.expenseCategory)
								: '',
							//	currency: res.data.currencyCode ? res.data.currencyCode : '',
						},
					},
					() => {
						if (
							this.state.initValue.coaCategoryId === 10 &&
							Object.keys(this.state.initValue.explainParamList).length !== 0
						) {
							this.setState(
								{
									initValue: {
										...this.state.initValue,
										...{
											coaCategoryId: 100,
										},
									},
								},
								() => { },
							);
						}
						if (this.state.initValue.customerId) {
							this.getCustomerExplainedInvoiceList(
								this.state.initValue.customerId,
								this.state.initValue.amount,
							);
						}
						if (this.state.initValue.vendorId) {
							this.getVendorExplainedInvoiceList(
								this.state.initValue.vendorId,
								this.state.initValue.amount,
							);
						}
					},
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	getChartOfAccountCategoryList = (type) => {
		this.setState({ loading: true });
		this.props.transactionsActions.getChartOfCategoryList(type).then((res) => {
			if (res.status === 200) {
				this.setState(
					{
						chartOfAccountCategoryList: res.data,
						loading: false,
					},
					() => {
						
						if (
							this.props.selectedData.explinationStatusEnum === 'FULL' ||
							this.props.selectedData.explinationStatusEnum === 'RECONCILED'
						) {
							const id = this.state.chartOfAccountCategoryList[0].options.find(
								(option) => option.value === this.state.initValue.coaCategoryId,
							);
							this.getTransactionCategoryList(id);
						}
						if (this.state.initValue.expenseCategory) {
							this.props.transactionsActions.getExpensesCategoriesList();
							this.props.transactionsActions.getVatList();
						}
					},
				);
			}
		});
	};
	setValue = (value) => {
		this.setState((prevState) => ({
			...prevState,
			transactionCategoryList: [],
		}));
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
		this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
	};

	setCurrency = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		this.formRef.current.setFieldValue('curreancyname', result[0].currencyName, true);
	};


	getTransactionCategoryList = (type) => {
		this.formRef.current.setFieldValue('coaCategoryId', type, true);
		this.setValue(null);
		if (type.value === 100) {
			this.getVendorList();
		} else {
			this.props.transactionsActions
				.getTransactionCategoryListForExplain(
					type.value,
					this.state.initValue.bankId,
				)
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								transactionCategoryList: res.data,
							},
							() => {
								//console.log(this.state.transactionCategoryList);
							},
						);
					}
				});
		}
	};
	getSuggestionInvoicesFotCust = (option, amount) => {
		const data = {
			amount: amount,
			id: option,
			bankId: this.props.bankId,
		};
		this.props.transactionsActions.getCustomerInvoiceList(data).then((res) => {
			this.setState({
				customer_invoice_list_state: res.data,
			});
		});
	};

	getCustomerExplainedInvoiceList = (option, amount) => {
		const data = {
			amount: amount,
			id: option,
			bankId: this.props.bankId,
		};
		this.props.transactionsActions
			.getCustomerExplainedInvoiceList(data)
			.then((res) => {
				this.setState({
					customer_invoice_list_state: res.data,
				});
			});
	};

	getVendorExplainedInvoiceList = (option, amount) => {
		const data = {
			amount: amount,
			id: option,
			bankId: this.props.bankId,
		};
		this.props.transactionsActions
			.getVendorExplainedInvoiceList(data)
			.then((res) => {
				this.setState({
					supplier_invoice_list_state: res.data,
				});
			});
	};

	getSuggestionInvoicesFotVend = (option, amount) => {
		const data = {
			amount: amount,
			id: option,
			bankId: this.props.bankId,
		};
		this.props.transactionsActions.getVendorInvoiceList(data).then((res) => {
			this.setState({
				supplier_invoice_list_state: res.data,
			});
		});
	};

	getUserList = () => {
		this.props.transactionsActions.getUserForDropdown();
	};

	getExpensesCategoriesList = () => {
		this.props.transactionsActions.getExpensesCategoriesList();
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
			// this.formRef.current.setFieldValue(
			// 	'currency',
			// 	response.data[0].currencyCode,
			// 	true,
			// );
		});
	// this.props.transactionsActions.getUserForDropdown();
			this.props.transactionsActions.getVatList();
	};

	getVendorList = () => {
		this.props.transactionsActions.getVendorList();
	};

	handleSubmit = (data, resetForm) => {
		// if (
		// 	data.invoiceIdList &&
		// 	data.invoiceIdList.reduce(
		// 		(totalAmount, invoice) => totalAmount + invoice.amount,
		// 		0,
		// 	) > data.amount
		// ) {
		// 	return false;
		// } 
		// else {
		const {
			bankId,
			date,
			reference,
			description,
			amount,
			dueAmount,
			coaCategoryId,
			transactionCategoryId,
			vendorId,
			employeeId,
			exchangeRate,
			invoiceIdList,
			customerId,
			vatId,
			currencyCode,
			userId,
			transactionId,
			expenseCategory,
		} = data;
		if (
			(invoiceIdList && coaCategoryId.label === 'Sales') ||
			(invoiceIdList && coaCategoryId.label === 'Supplier Invoice')
		) {
			var result = invoiceIdList.map((o) => ({
				id: o.value,
				remainingInvoiceAmount: 0,
				type: o.type,
			}));
		}
		let id;
		if (coaCategoryId && coaCategoryId.value === 100) {
			id = 10;
		} else {
			id = coaCategoryId.value;
		}
		let formData = new FormData();
		formData.append('transactionId', transactionId ? transactionId : '');
		formData.append('bankId ', bankId ? bankId : '');
		formData.append(
			'date',
			typeof date === 'object' ? moment(date).format('DD/MM/YYYY') : date,
		);
		formData.append(
			'exchangeRate',
			exchangeRate !== null ? exchangeRate : '',
		);
		formData.append('description', description ? description : '');
		formData.append('amount', amount ? amount : '');
		formData.append('dueAmount', dueAmount ? dueAmount : '');
		formData.append('coaCategoryId', coaCategoryId ? id : '');
		if (transactionCategoryId) {
			formData.append(
				'transactionCategoryId',
				transactionCategoryId ? transactionCategoryId : '',
			);
		}
		if (customerId && coaCategoryId.value === 2) {
			formData.append('customerId', customerId ? customerId : '');
		}
		if (vendorId && coaCategoryId.label === 'Supplier Invoice') {
			formData.append('vendorId', vendorId.value);
		}
		if (
			currencyCode &&
			(coaCategoryId.label === 'Expense' ||
				coaCategoryId.label === 'Admin Expense' ||
				coaCategoryId.label === 'Other Expense' ||
				coaCategoryId.label === 'Cost Of Goods Sold'||
				coaCategoryId.label === 'Sales'||
				coaCategoryId.label === 'Supplier Invoice')
		) {
			formData.append('currencyCode', currencyCode ? currencyCode : '');
		}
		if (
			expenseCategory &&
			(coaCategoryId.label === 'Expense' ||
				coaCategoryId.label === 'Admin Expense' ||
				coaCategoryId.label === 'Other Expense' ||
				coaCategoryId.label === 'Cost Of Goods Sold')
		) {
			formData.append(
				'expenseCategory',
				expenseCategory ? expenseCategory : '',
			);
		}
		if (
			(vatId && coaCategoryId.value === 10) ||
			(vatId && coaCategoryId.label === 'Expense')
		) {
			formData.append('vatId', vatId ? vatId : '');
		}
		if (employeeId) {
			formData.append('employeeId', employeeId ? employeeId.value : '');
		}
		if (
			(invoiceIdList && coaCategoryId.label === 'Sales') ||
			(invoiceIdList && coaCategoryId.label === 'Supplier Invoice')
		) {
			formData.append(
				'explainParamListStr',
				invoiceIdList ? JSON.stringify(result) : '',
			);
		}
		formData.append('reference', reference ? reference : '');
		if (this.uploadFile.files[0]) {
			formData.append('attachment', this.uploadFile.files[0]);
		}
		this.props.transactionDetailActions
			.updateTransaction(formData)
			.then((res) => {
				if (res.status === 200) {
					//esetForm();
					this.props.commonActions.tostifyAlert(
						'success',
						'Transaction Detail Updated Successfully.',
					);
					this.props.closeExplainTransactionModal(this.state.id);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
		// }
	};
	handleFileChange = (e, props) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => { };
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};
	closeTransaction = (id) => {
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={() => this.removeTransaction(id)}
					cancelHandler={this.removeDialog}
					message="This Transaction will be deleted and cannot be reversed "
				/>
			),
		});
	};

	UnexplainTransaction = (id) => {
		let formData = new FormData();
		for (var key in this.state.unexplainValue) {
			formData.append(key, this.state.unexplainValue[key]);
			if (
				Object.keys(this.state.unexplainValue['explainParamList']).length > 0
			) {
				formData.delete('explainParamList');
				formData.set(
					'explainParamListStr',
					JSON.stringify(this.state.unexplainValue['explainParamList']),
				);
			} else {
				formData.delete('explainParamList');
			}
		}
		this.props.transactionDetailActions
			.UnexplainTransaction(formData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Transaction Detail Updated Successfully.',
					);
					this.props.closeExplainTransactionModal(this.state.id);
				}
			})
			.catch((err) => {
				console.log(err);
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	invoiceIdList = (option) => {
		this.setState(
			{
				initValue: {
					...this.state.initValue,
					...{
						invoiceIdList: option,
					},
				},
			},
			() => { },
		);
		this.formRef.current.setFieldValue('invoiceIdList', option, true);
	};
	removeTransaction = (id) => {
		this.removeDialog();
		this.props.transactionsActions
			.deleteTransactionById(id)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Transaction Deleted Successfully',
				);
				this.props.closeExplainTransactionModal(this.state.id);
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : null,
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	getCurrency = (opt) => {
		let supplier_currencyCode = 0;

		this.props.vendor_list.map(item => {
			if(item.label.contactId == opt) {
				this.setState({
					supplier_currency: item.label.currency.currencyCode,
					supplier_currency_des: item.label.currency.currencyName
				});

				supplier_currencyCode = item.label.currency.currencyCode;
			}
		})

		console.log('supplier_currencyCode' ,supplier_currencyCode)

		return supplier_currencyCode;
	}
	handleFileChange = (e, props) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => { };
			reader.readAsDataURL(file);
			props.setFieldValue('attachment', file, true);
		}
	};

	render() {
		const {
			initValue,
			loading,
			chartOfAccountCategoryList,
			transactionCategoryList,
			dialog,
			customer_invoice_list_state,
			supplier_invoice_list_state,
		} = this.state;
		const {
			expense_categories_list,
			currency_list,
			vendor_list,
			vat_list,
			currency_convert_list,
		} = this.props;

		let tmpSupplier_list = []

		vendor_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})
		return (
			<div className="detail-bank-transaction-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							{dialog}
							{loading ? (
								<Loader />
							) : (
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="icon-doc" />
														<span className="ml-2">
															Explain Transaction {this.state.id}
														</span>
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
														validate={(values) => {
															let errors = {};
															if (
																(values.coaCategoryId.label ===
																	'Supplier Invoice' ||
																	values.coaCategoryId.label === 'Sales') &&
																!values.invoiceIdList
															) {
																errors.invoiceIdList = 'Invoice is  required';
															}
															if (
																values.coaCategoryId.label === 'Sales' &&
																!values.customerId
															) {
																errors.customerId = 'Customer is  required';
															}
															if (
																values.coaCategoryId.label !==
																'Supplier Invoice' &&
																values.coaCategoryId.label !== 'Sales' &&
																values.coaCategoryId.label !== 'Expense' &&
																!values.transactionCategoryId
															) {
																errors.transactionCategoryId =
																	'Transaction Category is Required';
															}
															return errors;
														}}
														validationSchema={Yup.object().shape({
															date: Yup.string().required(
																'Transaction Date is Required',
															),
															amount: Yup.string()
																.required('Transaction Amount is Required')
																.test(
																	'amount',
																	'Transaction Amount Must Be Greater Than 0',
																	(value) => value > 0,
																),
															coaCategoryId: Yup.object().required(
																'Transaction Type is Required',
															),
															attachment: Yup.mixed()
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
																				this.supported_format.includes(
																					value.type,
																				)) ||
																			!value
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
																			(value && value.size <= this.file_size) ||
																			!value
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
																	<Col lg={4}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="chartOfAccountId">
																				<span className="text-danger">*</span>
																			Transaction Type
																		</Label>
																			<Select
																				styles={customStyles}
																				options={
																					chartOfAccountCategoryList
																						? chartOfAccountCategoryList
																						: ''
																				}
																				value={
																					chartOfAccountCategoryList[0] &&
																					chartOfAccountCategoryList[0].options.find(
																						(option) =>
																							option.value ===
																							+props.values.coaCategoryId.value,
																					)
																				}
																				onChange={(option) => {
																					if (option && option.value) {
																						props.handleChange('coaCategoryId')(
																							option,
																						);
																					} else {
																						props.handleChange('coaCategoryId')(
																							'',
																						);
																					}
																					if (
																						option.label !== 'Expense' &&
																						option.label !== 'Supplier Invoice'
																					) {
																						this.getTransactionCategoryList(
																							option,
																						);
																					}
																					if (option.label === 'Expense') {
																						this.getExpensesCategoriesList();
																					}
																					if (
																						option.label === 'Supplier Invoice'
																					) {
																						this.getVendorList();
																					}
																					this.formRef.current.setFieldValue(
																						'transactionCategoryLabel',
																						'',
																						true,
																					);
																					this.setValue(null);
																				}}
																				placeholder="Select Type"
																				id="coaCategoryId"
																				name="coaCategoryId"
																				className={
																					props.errors.coaCategoryId &&
																						props.touched.coaCategoryId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.coaCategoryId &&
																				props.touched.coaCategoryId && (
																					<div className="invalid-feedback">
																						{props.errors.coaCategoryId}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col lg={4}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="amount">
																				<span className="text-danger">*</span>
																			Amount
																		</Label>
																			<Input
																				type="number"
																				id="amount"
																				name="amount"
																				placeholder="Amount"
																				readOnly={
																					this.state.creationMode === 'MANUAL'
																						? false
																						: true
																				}
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						this.regEx.test(option.target.value)
																					) {
																						props.handleChange('amount')(
																							option.target.value,
																						);
																					}
																				}}
																				value={props.values.amount}
																				className={
																					props.errors.amount &&
																						props.touched.amount
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.amount &&
																				props.touched.amount && (
																					<div className="invalid-feedback">
																						{props.errors.amount}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																</Row>
																{/* {transactionCategoryList.dataList &&
																props.values.coaCategoryId === 10 && (
																	<Row>
																		<Col lg={12}>
																			<FormGroup check inline className="mb-3">
																				<div className="expense-option">
																					<Label
																						className="form-check-label"
																						check
																						htmlFor="producttypeone"
																					>
																						<Input
																							className="form-check-input"
																							type="radio"
																							id="producttypeone"
																							name="producttypeone"
																							value="EXPENSE"
																							onChange={(value) => {
																								const data = {
																									value: 'EXPENSE',
																									id: 10,
																								};
																								props.handleChange(
																									'expenseType',
																								)(data);
																								// this.getSuggestionExpenses(
																								// 	props.values.amount,
																								// );
																							}}
																							checked={
																								props.values.expenseType
																									.value === 'EXPENSE'
																							}
																						/>
																						Create Expense
																					</Label>
																					<Label
																						className="form-check-label"
																						check
																						htmlFor="producttypetwo"
																					>
																						<Input
																							className="form-check-input"
																							type="radio"
																							id="producttypetwo"
																							name="producttypetwo"
																							value="SUPPLIER"
																							onChange={(value) => {
																								const data = {
																									value: 'SUPPLIER',
																									id: 10,
																								};
																								props.handleChange(
																									'expenseType',
																								)(data);
																							}}
																							checked={
																								props.values.expenseType
																									.value === 'SUPPLIER'
																							}
																						/>
																						Explain Supplier Invoice
																					</Label>
																				</div>
																			</FormGroup>
																		</Col>
																	</Row>
																)} */}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Expense' && (
																		<Row>
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="expenseCategory">
																						<span className="text-danger">*</span>
																					Expense Category
																				</Label>
																					<Select
																						styles={customStyles}
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
																						value={
																							expense_categories_list &&
																							selectOptionsFactory
																								.renderOptions(
																									'transactionCategoryName',
																									'transactionCategoryId',
																									expense_categories_list,
																									'Expense Category',
																								)
																								.find(
																									(option) =>
																										option.value ===
																										+props.values.expenseCategory,
																								)
																						}
																						// value={props.values.expenseCategory}
																						onChange={(option) => {
																							props.handleChange(
																								'expenseCategory',
																							)(option.value);
																						}}
																						id="expenseCategory"
																						name="expenseCategory"
																						className={
																							props.errors.expenseCategory &&
																								props.touched.expenseCategory
																								? 'is-invalid'
																								: ''
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
																			{props.values.coaCategoryId &&
																				props.values.coaCategoryId.label ===
																				'Expense' && (
																					<Col lg={3}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="vatId">Vat</Label>
																							<Select
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
																								value={
																									vat_list &&
																									selectOptionsFactory
																										.renderOptions(
																											'name',
																											'id',
																											vat_list,
																											'Tax',
																										)
																										.find(
																											(option) =>
																												option.value ===
																												props.values.vatId,
																										)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange('vatId')(
																											option.value,
																										);
																									} else {
																										props.handleChange('vatId')(
																											'',
																										);
																									}
																								}}
																								placeholder="Select Type"
																								id="vatId"
																								name="vatId"
																								className={
																									props.errors.vatId &&
																										props.touched.vatId
																										? 'is-invalid'
																										: ''
																								}
																							/>
																						</FormGroup>
																					</Col>
																				)}
																		</Row>
																	)}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Supplier Invoice' && (
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="vendorId">
																						<span className="text-danger">*</span>
																					Vendor
																				</Label>
																					<Select
																						styles={customStyles}
																						options={
																							tmpSupplier_list
																								? selectOptionsFactory.renderOptions(
																										'label',
																										'value',
																										tmpSupplier_list,
																										'Supplier Name',
																								  )
																								: []
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								this.formRef.current.setFieldValue('currencyCode', this.getCurrency(option.value), true);
																								this.setExchange( this.getCurrency(option.value) );
																								props.handleChange('vendorId')(option);
																							} else {
				
																								props.handleChange('vendorId')('');
																							}
																							this.getSuggestionInvoicesFotVend(
																								option.value,
																								props.values.amount,
																							);
																						}}
																						value={
																							tmpSupplier_list &&
																							tmpSupplier_list.find(
																								(option) =>
																									option.value ===
																									+props.values.vendorId,
																							)
																						}
																						placeholder="Select Type"
																						id="vendorId"
																						name="vendorId"
																						className={
																							props.errors.vendorId &&
																								props.touched.vendorId
																								? 'is-invalid'
																								: ''
																						}
																					/>
																				</FormGroup>
																			</Col>
																			{props.values.coaCategoryId &&
																				props.values.coaCategoryId.label ===
																				'Supplier Invoice' &&
																				props.values.vendorId && (
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="invoiceIdList">
																								<span className="text-danger">
																									*
																							</span>
																							Invoice
																						</Label>
																							<Select
																								styles={customStyles}
																								isMulti
																								options={
																									supplier_invoice_list_state
																										? supplier_invoice_list_state
																										: []
																								}
																								onChange={(option) => {
																									props.handleChange(
																										'explainParamList',
																									)(option);
																									this.invoiceIdList(option);
																								}}
																								value={
																									supplier_invoice_list_state &&
																										props.values.explainParamList
																										? supplier_invoice_list_state.find(
																											(option) =>
																												option.value ===
																												+props.values.explainParamList.map(
																													(item) => item.id,
																												),
																										)
																										: props.values
																											.explainParamList
																								}
																								placeholder="Select Type"
																								id="invoiceIdList"
																								name="invoiceIdList"
																								className={
																									props.errors.invoiceIdList &&
																										props.touched.invoiceIdList
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.invoiceIdList &&
																								props.touched.invoiceIdList && (
																									<div className="invalid-feedback">
																										{props.errors.invoiceIdList}
																									</div>
																								)}
																							{/* {this.state.initValue
																							.invoiceIdList &&
																							this.state.initValue.invoiceIdList.reduce(
																								(totalAmount, invoice) =>
																									totalAmount + invoice.amount,
																								0,
																							) !== props.values.amount && (
																								<div
																									className={
																										this.state.initValue.invoiceIdList.reduce(
																											(totalAmount, invoice) =>
																												parseInt(
																													totalAmount +
																														invoice.amount,
																												),
																											0,
																										) !==
																										parseInt(
																											props.values.amount,
																										)
																											? 'is-invalid'
																											: ''
																									}
																								>
																									<div className="invalid-feedback">
																										Total Invoice Amount Is Not
																										Equal to the Transaction
																										Amount please create invoice
																									</div>
																								</div>
																							)} */}
																						</FormGroup>
																					</Col>
																				)}
																		</Row>
																	)}
																<Row>
																	{transactionCategoryList.dataList &&
																		props.values.coaCategoryId.value === 2 && (
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="customerId">
																						<span className="text-danger">*</span>
																					Customer
																				</Label>
																					<Select
																						styles={customStyles}
																						options={
																							transactionCategoryList.dataList[0]
																								? transactionCategoryList
																									.dataList[0].options
																								: []
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange('customerId')(
																									option.value,
																								);
																							} else {
																								props.handleChange('customerId')(
																									'',
																								);
																							}
																							this.getSuggestionInvoicesFotCust(
																								option.value,
																								props.values.amount,
																							);
																						}}
																						value={
																							transactionCategoryList
																								.dataList[0] &&
																							transactionCategoryList.dataList[0].options.find(
																								(option) =>
																									option.value ===
																									+props.values.customerId,
																							)
																						}
																						placeholder="Select Type"
																						id="customerId"
																						name="customerId"
																						className={
																							props.errors.customerId &&
																								props.touched.customerId
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.customerId &&
																						props.touched.customerId && (
																							<div className="invalid-feedback">
																								{props.errors.customerId}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		)}
																	{transactionCategoryList.dataList &&
																		props.values.coaCategoryId.value === 2 &&
																		props.values.customerId && (
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="invoiceIdList">
																						<span className="text-danger">*</span>
																					Invoice
																				</Label>
																					<Select
																						styles={customStyles}
																						isMulti
																						options={
																							customer_invoice_list_state
																								? customer_invoice_list_state
																								: []
																						}
																						onChange={(option) => {
																							props.handleChange(
																								'explainParamList',
																							)(option);
																							this.invoiceIdList(option);
																						}}
																						value={
																							customer_invoice_list_state &&
																								props.values.explainParamList
																								? customer_invoice_list_state.find(
																									(option) =>
																										option.value ===
																										+props.values.explainParamList.map(
																											(item) => item.id,
																										),
																								)
																								: props.values.explainParamList
																						}
																						placeholder="Select Type"
																						id="invoiceIdList"
																						name="invoiceIdList"
																						className={
																							props.errors.invoiceIdList &&
																								props.touched.invoiceIdList
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.invoiceIdList &&
																						props.touched.invoiceIdList && (
																							<div className="invalid-feedback">
																								{props.errors.invoiceIdList}
																							</div>
																						)}
																					{/* { this.state.initValue.invoiceIdList &&
																					this.state.initValue.invoiceIdList.reduce(
																						(totalAmount, invoice) =>
																							parseInt(
																								totalAmount + invoice.amount,
																							),
																						0,
																					) !==
																						parseInt(props.values.amount) && (
																						<div
																							className={
																								this.state.initValue.invoiceIdList.reduce(
																									(totalAmount, invoice) =>
																										parseInt(
																											totalAmount +
																												invoice.amount,
																										),
																									0,
																								) !==
																								parseInt(props.values.amount)
																									? 'is-invalid'
																									: ''
																							}
																						>
																							<div className="invalid-feedback">
																								Total Invoice Amount Is Not
																								Equal to the Transaction Amount
																								please create invoice
																							</div>
																						</div>
																					)}  */}
																				</FormGroup>
																			</Col>
																		)}
																	{props.values.coaCategoryId &&
																		props.values.coaCategoryId.label !==
																		'Expense' &&
																		props.values.coaCategoryId.label !==
																		'Supplier Invoice' &&
																		props.values.coaCategoryId.label !==
																		'Sales' && (
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="transactionCategoryId">
																						<span className="text-danger">*</span>
																					Category
																				</Label>
																					<Select
																						styles={customStyles}
																						options={
																							transactionCategoryList
																								? transactionCategoryList.categoriesList
																								: []
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange(
																									'transactionCategoryId',
																								)(option.value);
																							} else {
																								props.handleChange(
																									'transactionCategoryId',
																								)('');
																							}
																						}}
																						value={
																							transactionCategoryList &&
																								transactionCategoryList.categoriesList &&
																								props.values
																									.transactionCategoryLabel
																								? transactionCategoryList.categoriesList
																									.find(
																										(item) =>
																											item.label ===
																											props.values
																												.transactionCategoryLabel,
																									)
																									.options.find(
																										(item) =>
																											item.value ===
																											+props.values
																												.transactionCategoryId,
																									)
																								: console.log('')
																						}
																						placeholder="Select Category"
																						id="transactionCategoryId"
																						name="transactionCategoryId"
																						className={
																							props.errors
																								.transactionCategoryId &&
																								props.touched.transactionCategoryId
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.transactionCategoryId &&
																						props.touched
																							.transactionCategoryId && (
																							<div className="invalid-feedback">
																								{
																									props.errors
																										.transactionCategoryId
																								}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		)}
																	{props.values.coaCategoryId &&
																		props.values.coaCategoryId.value === 12 && (
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="employeeId">User</Label>
																					<Select
																						styles={customStyles}
																						options={
																							transactionCategoryList.dataList
																								? transactionCategoryList
																									.dataList[0].options
																								: []
																						}
																						value={
																							transactionCategoryList.dataList &&
																							transactionCategoryList.dataList[0].options.find(
																								(option) =>
																									option.value ===
																									+props.values.employeeId,
																							)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange('employeeId')(
																									option,
																								);
																							} else {
																								props.handleChange('employeeId')(
																									'',
																								);
																							}
																						}}
																						placeholder="Select User"
																						id="employeeId"
																						name="employeeId"
																						className={
																							props.errors.employeeId &&
																								props.touched.employeeId
																								? 'is-invalid'
																								: ''
																						}
																					/>
																				</FormGroup>
																			</Col>
																		)}
																</Row>
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Expense' &&
																	(
																		<Row>
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="currencyCode">
																						Currency
																						</Label>
																					<Select
																						styles={customStyles}
																						id="currencyCode"
																						name="currencyCode"
																						options={
																							currency_convert_list
																								? selectCurrencyFactory.renderOptions(
																									'currencyName',
																									'currencyCode',
																									currency_convert_list,
																									'Currency',
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
																										+props.values.currency,
																								)
																						}
																						onChange={(option) => {
																							props.handleChange('currency')(option);
																							this.setExchange(option.value);
																							this.setCurrency(option.value)
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
																		</Row>
																	)}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Expense' && (
																		<Row>
																			<Col lg={2}>
																				<Input
																					disabled
																					id="1"
																					name="1"
																					value={
																						1}

																				/>
																			</Col>
																			<Col lg={2}>
																				<FormGroup className="mb-3">
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
																					<div>
																						<Input
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
																					value={
																						this.state.basecurrency.currencyIsoCode}

																				/>
																			</Col>
																		</Row>
																	)}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Sales' &&
																	(
																		<Row>
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="currencyCode">
																						Currency
																						</Label>
																					<Select
																						styles={customStyles}
																						id="currencyCode"
																						name="currencyCode"
																						options={
																							currency_convert_list
																								? selectCurrencyFactory.renderOptions(
																									'currencyName',
																									'currencyCode',
																									currency_convert_list,
																									'Currency',
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
																										+props.values.currency,
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
																							this.setExchange(option.value);
																							this.setCurrency(option.value)
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
																		</Row>
																	)}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Sales' && (
																		<Row>
																			<Col lg={2}>
																				<Input
																					disabled
																					id="1"
																					name="1"
																					value={
																						1}

																				/>
																			</Col>
																			<Col lg={2}>
																				<FormGroup className="mb-3">
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
																					<div>
																						<Input
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
																					value={
																						this.state.basecurrency.currencyIsoCode}

																				/>
																			</Col>
																		</Row>
																	)}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Supplier Invoice' &&
																	(
																		<Row>
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="currencyCode">
																						Currency
																						</Label>
																					<Select
																						styles={customStyles}
																						id="currencyCode"
																						name="currencyCode"
																						options={
																							currency_convert_list
																								? selectCurrencyFactory.renderOptions(
																									'currencyName',
																									'currencyCode',
																									currency_convert_list,
																									'Currency',
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
																										 +this.state.supplier_currency,
																								)
																						}
																						isDisabled={true}
																						onChange={(option) => {
																							props.handleChange('currency')(option);
																							this.setExchange(option.value);
																							this.setCurrency(option.value)
																						   }}
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
																	)}
																{props.values.coaCategoryId &&
																	props.values.coaCategoryId.label ===
																	'Supplier Invoice' && (
																		<Row>
																			<Col lg={2}>
																				<Input
																					disabled
																					id="1"
																					name="1"
																					value={
																						1}

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
																							value={this.state.supplier_currency_des}
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
																					value={
																						this.state.basecurrency.currencyIsoCode}

																				/>
																			</Col>
																		</Row>
																	)}
																<Row>
																	<Col lg={8}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="description">
																				Description
																		</Label>
																			<Input
																				type="textarea"
																				name="description"
																				id="description"
																				rows="6"
																				placeholder="Description..."
																				onChange={(option) =>
																					props.handleChange('description')(
																						option,
																					)
																				}
																				value={props.values.description}
																			/>
																		</FormGroup>
																	</Col>
																</Row>
																<Row>
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
																										this.handleFileChange(
																											e,
																											props,
																										);
																									}}
																								/>
																							</div>
																						)}
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
																					{props.errors.attachment &&
																						props.touched.attachment && (
																							<div className="invalid-file">
																								{props.errors.attachment}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col lg={12}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="date">
																						<span className="text-danger">*</span>
																					Transaction Date
																				</Label>
																					<DatePicker
																						id="date"
																						name="date"
																						readOnly={
																							this.state.creationMode === 'MANUAL'
																								? false
																								: true
																						}
																						placeholderText="Transaction Date"
																						showMonthDropdown
																						showYearDropdown
																						dateFormat="dd/MM/yyyy"
																						dropdownMode="select"
																						value={
																							props.values.date
																								? moment(
																									props.values.date,
																									'DD/MM/YYYY',
																								).format('DD/MM/YYYY')
																								: ''
																						}
																						//selected={props.values.date}
																						onChange={(value) =>
																							props.handleChange('date')(value)
																						}
																						className={`form-control ${props.errors.date &&
																								props.touched.date
																								? 'is-invalid'
																								: ''
																							}`}
																					/>
																					{props.errors.date &&
																						props.touched.date && (
																							<div className="invalid-feedback">
																								{props.errors.date}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		</Row>
																	</Col>
																</Row>
																<Row>
																	<Col lg={4}>
																		<Row>
																			<Col lg={12}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="reference">
																						Reference Number
																				</Label>
																					<Input
																						type="text"
																						id="reference"
																						name="reference"
																						placeholder="Reference Number"
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExBoth.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange('reference')(
																									option,
																								);
																							}
																						}}
																						value={props.values.reference}
																					/>
																				</FormGroup>
																			</Col>
																		</Row>
																	</Col>
																</Row>
																{transactionCategoryList.dataList && (
																	<Row>
																		{props.values.coaCategoryId === 12 ||
																			(props.values.coaCategoryId === 6 && (
																				<Col lg={4}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="employeeId">
																							User
																					</Label>
																						<Select
																							styles={customStyles}
																							options={
																								transactionCategoryList.dataList
																									? transactionCategoryList
																										.dataList[0].options
																									: []
																							}
																							value={
																								transactionCategoryList.dataList &&
																								transactionCategoryList.dataList[0].options.find(
																									(option) =>
																										option.value ===
																										+props.values.employeeId,
																								)
																							}
																							onChange={(option) => {
																								if (option && option.value) {
																									props.handleChange(
																										'employeeId',
																									)(option);
																								} else {
																									props.handleChange(
																										'employeeId',
																									)('');
																								}
																							}}
																							placeholder="Select Contact"
																							id="employeeId"
																							name="employeeId"
																							className={
																								props.errors.employeeId &&
																									props.touched.employeeId
																									? 'is-invalid'
																									: ''
																							}
																						/>
																					</FormGroup>
																				</Col>
																			))}
																	</Row>
																)}

																<Row>
																	{props.values.explinationStatusEnum !==
																		'RECONCILED' && (
																			<Col lg={12} className="mt-5">
																				<FormGroup className="text-left">
																					{props.values.explinationStatusEnum !==
																						'FULL' ? (
																							<div>
																								<Button
																									type="button"
																									color="primary"
																									className="btn-square mr-3"
																									onClick={props.handleSubmit}
																								>
																									<i className="fa fa-dot-circle-o"></i>{' '}
																						Explain
																					</Button>
																								<Button
																									color="secondary"
																									className="btn-square"
																									onClick={() =>
																										this.closeTransaction(
																											props.values.transactionId,
																										)
																									}
																								>
																									<i className="fa fa-ban"></i> Delete
																					</Button>
																							</div>
																						) : (
																							<div>
																								<Button
																									type="button"
																									color="primary"
																									className="btn-square mr-3"
																									onClick={() =>
																										this.UnexplainTransaction(
																											props.values.transactionId,
																										)
																									}
																								>
																									<i className="fa fa-dot-circle-o"></i>{' '}
																						Unexplain
																					</Button>
																								<Button
																									color="secondary"
																									className="btn-square"
																									onClick={props.handleSubmit}
																								>
																									<i className="fa fa-dot-circle-o"></i>{' '}
																						Update
																					</Button>
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		)}
																</Row>
															</Form>
														)}
													</Formik>
												</Col>
											</Row>
										</CardBody>
									</Card>
								)}
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ExplainTrasactionDetail);
