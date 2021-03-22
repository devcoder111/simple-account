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
	NavLink,
} from 'reactstrap';
import Select from 'react-select';
import _ from 'lodash';
import { selectOptionsFactory } from 'utils';
import { Formik, Field } from 'formik';
import DatePicker from 'react-datepicker';
import * as Yup from 'yup';
import { Loader } from 'components';
import moment from 'moment';

import API_ROOT_URL from '../../../../constants/config';
import 'react-datepicker/dist/react-datepicker.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import './style.scss';
import * as PaymentActions from '../../actions';
import * as CreatePaymentActions from './actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';

import { CommonActions } from 'services/global';

const mapStateToProps = (state) => {
	return {
		supplier_list: state.payment.supplier_list,
		invoice_list: state.payment.invoice_list,
		deposit_list: state.supplier_invoice.deposit_list,
		pay_mode: state.supplier_invoice.pay_mode,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		SupplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		createPaymentActions: bindActionCreators(CreatePaymentActions, dispatch),
		paymentActions: bindActionCreators(PaymentActions, dispatch),
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

class CreatePayment extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			initValue: {
				contactId: '',
				amount: '',
				paymentNo: 1,
				paymentDate: new Date(),
				payMode: '',
				notes: '',
				depositeTo: '',
				paidInvoiceListStr: [],
				deleteFlag: true,
			},
			data: [],
			paidInvoiceListStr: [],
			currentData: {},
			openSupplierModal: false,
			contactType: 1,
		};

		this.options = {};
		this.selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
		};
		this.regEx = /^[0-9\d]+$/;
		this.formRef = React.createRef();
	}

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.paidInvoiceListStr);
			tempList.push(row);
		} else {
			this.state.paidInvoiceListStr.map((item) => {
				if (item !== row) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState(
			{
				initValue: {
					...this.state.initValue,
					...{
						amount: tempList.reduce(function (acc, val) {
							return acc + val.totalAount;
						}, 0),
					},
				},
				paidInvoiceListStr: tempList,
			},
			() => {
				this.formRef.current.setFieldValue(
					'paidInvoiceListStr',
					tempList,
					true,
				);
				this.formRef.current.setFieldValue(
					'amount',
					tempList.reduce(function (acc, val) {
						return acc + val.totalAount;
					}, 0),
					true,
				);
			
			},
		);
	};

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.paymentActions.getSupplierContactList(this.state.contactType);
		this.props.paymentActions.getSupplierInvoiceList();
		this.props.SupplierInvoiceActions.getDepositList();
		this.props.SupplierInvoiceActions.getPaymentMode();
	};

	getList = (id) => {
		this.props.createPaymentActions
			.getList(id)
			.then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							data: res.data,
							initValue: {
								...this.state.initValue,
								...{
									amount: res.data.reduce(function (acc, val) {
										return acc + val.totalAount;
									}, 0),
								},
							},
						},
						() => {
							this.formRef.current.setFieldValue(
								'amount',
								res.data.reduce(function (acc, val) {
									return acc + val.totalAount;
								}, 0),
								true,
							);
						},
					);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	renderActions = (cell, row) => {
		return (
			<Button size="sm" className="btn-twitter btn-brand icon">
				<i className="fas fa-trash"></i>
			</Button>
		);
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

	handleSubmit = (data, resetForm) => {
		const {
			paymentNo,
			paymentDate,
			contactId,
			amount,
			depositeTo,
			payMode,
			notes,
			referenceCode,
			deleteFlag,
		} = data;
		console.log(data);
		let formData = new FormData();
		formData.append('paymentNo', paymentNo !== null ? paymentNo : '');
		formData.append(
			'paymentDate',
			typeof paymentDate === 'string'
				? moment(paymentDate, 'DD/MM/YYYY').toDate()
				: paymentDate,
		);
		formData.append('amount', amount !== null ? amount : '');
		formData.append('deleteFlag', deleteFlag !== null ? deleteFlag : '');
		formData.append('notes', notes !== null ? notes : '');
		formData.append(
			'referenceCode',
			referenceCode !== null ? referenceCode : '',
		);
		formData.append(
			'paidInvoiceListStr',
			JSON.stringify(this.state.paidInvoiceListStr),
		);
		formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
		if (payMode) {
			formData.append('payMode', payMode !== null ? payMode.value : '');
		}
		if (contactId) {
			formData.append('contactId', contactId.value);
		}
		if (this.uploadFile.files[0]) {
			formData.append('attachmentFile', this.uploadFile.files[0]);
		}

		this.props.createPaymentActions
			.createPayment(formData)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Payment Created Successfully.',
				);
				if (this.state.createMore) {
					this.setState({
						createMore: false,
					});
					resetForm(this.state.initValue);
				} else {
					this.props.history.push('/admin/expense/payment');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	renderProductName = (cell, row) => {
		return (
			<div className="d-flex align-items-center">
				<Select
					className="select-default-width flex-grow-1 mr-1"
					options={[]}
				/>
				<Button size="sm" color="primary" className="btn-brand icon">
					<i className="fas fa-plus"></i>
				</Button>
			</div>
		);
	};

	renderQuantity = (cell, row) => {
		return <Input type="number" value="0" />;
	};

	renderUnitPrice = (cell, row) => {
		return <Input type="number" value="0.00" />;
	};

	renderVat = (cell, row) => {
		return (
			<Select
				className="select-default-width"
				options={[]}
				id="currency"
				name="currency"
			/>
		);
	};

	renderSubTotal = (cell, row) => {};

	getCurrentUser = (data) => {
		let option;
		if (data.label || data.value) {
			option = data;
		} else {
			option = {
				label: `${data.fullName}`,
				value: data.id,
			};
		}
		this.setState({
			selectedSupplier: option,
		});
		this.formRef.current.setFieldValue('supplier', option, true);
	};

	date = (cell, rows, props) => {
		return <div>{moment.utc(rows.date).format('DD/MM/YYYY')}</div>;
	};

	renderAmount = (cell, rows, props) => {
		let data = this.state.data;
		let idx;
		data.map((obj, index) => {
			if (obj.id === rows.id) {
				obj['paidAmount'] = rows.totalAount;
				idx = index;
			}
			return obj;
		});
		return (
			<Field
				name="paidAmount"
				render={({ field, form }) => (
					<Input
					type="number"
						readOnly
						value={rows.totalAount}
						// onChange={(e) => {
						// 	this.selectItem(e, row, 'description', form, field);
						// }}
						placeholder="Amount"
						className={`form-control`}
					/>
				)}
			/>
		);
	};

	render() {
		const { supplier_list, deposit_list, pay_mode } = this.props;

		const { initValue, data } = this.state;
		const { loading } = this.state;

		return (
			<div className="create-payment-screen">
				<div className="animated fadeIn">
					{loading ? (
						<Loader />
					) : (
						<Row>
							<Col lg={12} className="mx-auto">
								<Card>
									<CardHeader>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="fas fa-money-check" />
													<span className="ml-2">Create Payment</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<CardBody>
										<Formik
											ref={this.formRef}
											initialValues={initValue}
											onSubmit={(values, { resetForm }) => {
												this.handleSubmit(values, resetForm);
											}}
											validationSchema={Yup.object().shape({
												contactId: Yup.string().required(
													'Supplier is required',
												),
												paymentDate: Yup.date().required(
													'Payment Date is Required',
												),
												depositeTo: Yup.string().required(
													'Deposit to is required',
												),
												paidInvoiceListStr: Yup.string().required(
													'Please select atleast one invoice',
												),
												amount: Yup.string()
													.required('Amount is required')
													.matches(/^[0-9]+([,.][0-9]+)?$/, {
														message: 'Please enter valid Amount.',
														excludeEmptyString: false,
													}),
											})}
										>
											{(props) => (
												<Form onSubmit={props.handleSubmit}>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="contactId">
																	<span className="text-danger">*</span>
																	Supplier Name
																</Label>
																<Select
																	styles={customStyles}
																	id="contactId"
																	name="contactId"
																	options={
																		supplier_list
																			? selectOptionsFactory.renderOptions(
																					'label',
																					'value',
																					supplier_list,
																					'Supplier Name',
																			  )
																			: []
																	}
																	value={props.values.contactId}
																	onChange={(option) => {
																		if (option && option.value) {
																			props.handleChange('contactId')(option);
																		} else {
																			props.handleChange('contactId')('');
																		}
																		this.getList(option.value);
																	}}
																	className={
																		props.errors.contactId &&
																		props.touched.contactId
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.contactId &&
																	props.touched.contactId && (
																		<div className="invalid-feedback">
																			{props.errors.contactId}
																		</div>
																	)}
															</FormGroup>
														</Col>
														{/* <Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="project">
																	<span className="text-danger">*</span> Payment
																</Label>
																<Input
																	type="text"
																	id="paymentNo"
																	name="paymentNo"
																	placeholder=""
																	disabled
																	value={props.values.paymentNo}
																	onChange={(value) => {
																		props.handleChange('paymentNo')(value);
																	}}
																	className={
																		props.errors.paymentNo &&
																		props.touched.paymentNo
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.paymentNo &&
																	props.touched.paymentNo && (
																		<div className="invalid-feedback">
																			{props.errors.paymentNo}
																		</div>
																	)}
															</FormGroup>
														</Col> */}
													</Row>
													<hr />
													{props.values.contactId && (
														<div>
															{this.state.data.length > 0 ? (
																<div>
																	<Row>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="amount">
																					<span className="text-danger">*</span>
																					Amount Paid
																				</Label>
																				<Input
																					type="number"
																					id="amount"
																					name="amount"
																					readOnly
																					placeholder="Amount"
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regEx.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange('amount')(
																								option,
																							);
																						}
																					}}
																					value={props.values.amount}
																					className={`form-control ${
																						props.errors.amount &&
																						props.touched.amount
																							? 'is-invalid'
																							: ''
																					}`}
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
																	<hr />
																	<Row>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="date">
																					<span className="text-danger">*</span>
																					Payment Date
																				</Label>
																				<DatePicker
																					id="paymentDate"
																					name="paymentDate"
																					placeholderText="Payment Date"
																					showMonthDropdown
																					showYearDropdown
																					dateFormat="dd/MM/yyyy"
																					dropdownMode="select"
																					value={props.values.paymentDate}
																					selected={props.values.paymentDate}
																					onChange={(value) => {
																						props.handleChange('paymentDate')(
																							moment(value).format(
																								'DD/MM/YYYY',
																							),
																						);
																					}}
																					className={`form-control ${
																						props.errors.paymentDate &&
																						props.touched.paymentDate
																							? 'is-invalid'
																							: ''
																					}`}
																				/>
																				{props.errors.paymentDate &&
																					props.touched.paymentDate && (
																						<div className="invalid-feedback">
																							{props.errors.paymentDate}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="payMode">
																					Payment Mode
																				</Label>
																				<Select
																					styles={customStyles}
																					options={
																						pay_mode
																							? selectOptionsFactory.renderOptions(
																									'label',
																									'value',
																									pay_mode,
																									'Mode',
																							  )
																							: []
																					}
																					value={props.values.payMode}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('payMode')(
																								option,
																							);
																						} else {
																							props.handleChange('payMode')('');
																						}
																					}}
																					placeholder="Select Payment Mode"
																					id="payMode"
																					name="payMode"
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
																		</Col>{' '}
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="depositeTo">
																					<span className="text-danger">*</span>{' '}
																					Deposit To
																				</Label>
																				<Select
																					styles={customStyles}
																					options={deposit_list}
																					value={props.values.depositeTo}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('depositeTo')(
																								option,
																							);
																						} else {
																							props.handleChange('depositeTo')(
																								'',
																							);
																						}
																					}}
																					placeholder="Select Deposit To"
																					id="depositeTo"
																					name="depositeTo"
																					className={
																						props.errors.depositeTo &&
																						props.touched.depositeTo
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.depositeTo &&
																					props.touched.depositeTo && (
																						<div className="invalid-feedback">
																							{props.errors.depositeTo}
																						</div>
																					)}
																			</FormGroup>
																		</Col>{' '}
																	</Row>
																	<hr />
																	<Row>
																		<Col lg={8}>
																			<Row>
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="referenceCode">
																							Reference Number
																						</Label>
																						<Input
																							type="text"
																							id="referenceCode"
																							name="referenceCode"
																							placeholder="Enter Reference Number"
																							onChange={(option) => {
																								if (
																									option.target.value === '' ||
																									this.regExBoth.test(
																										option.target.value,
																									)
																								) {
																									props.handleChange(
																										'referenceCode',
																									)(option);
																								}
																							}}
																							value={props.values.referenceCode}
																						/>
																					</FormGroup>
																				</Col>
																			</Row>
																			<Row>
																				<Col lg={12}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="notes">Notes</Label>
																						<Input
																							type="textarea"
																							name="notes"
																							id="notes"
																							rows="5"
																							placeholder="Notes"
																							onChange={(option) =>
																								props.handleChange('notes')(
																									option,
																								)
																							}
																							defaultValue={props.values.notes}
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
																							name="attachmentFile"
																							render={({ field, form }) => (
																								<div>
																									<Label>Attachment</Label>{' '}
																									<br />
																									<div className="file-upload-cont">
																										<Button
																											color="primary"
																											onClick={() => {
																												document
																													.getElementById(
																														'fileInput',
																													)
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
																											style={{
																												display: 'none',
																											}}
																											onChange={(e) => {
																												this.handleFileChange(
																													e,
																													props,
																												);
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
																										{this.state.fileName ? (
																											this.state.fileName
																										) : (
																											<NavLink
																												href={`${API_ROOT_URL.API_ROOT_URL}${initValue.filePath}`}
																												download={
																													this.state.initValue
																														.fileName
																												}
																												style={{
																													fontSize: '0.875rem',
																												}}
																												target="_blank"
																											>
																												{
																													this.state.initValue
																														.fileName
																												}
																											</NavLink>
																										)}
																									</div>
																								</div>
																							)}
																						/>
																						{props.errors.attachmentFile && (
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
																		<div
																			className={
																				props.errors.paidInvoiceListStr &&
																				props.touched.paidInvoiceListStr
																					? 'is-invalid'
																					: ''
																			}
																		></div>
																		{props.errors.paidInvoiceListStr &&
																			props.touched.paidInvoiceListStr && (
																				<div
																					className="invalid-feedback"
																					style={{ fontSize: '20px' }}
																				>
																					{props.errors.paidInvoiceListStr}
																				</div>
																			)}
																	</Row>
																	<Row>
																		<BootstrapTable
																			selectRow={this.selectRowProp}
																			data={data}
																			version="4"
																			hover
																			keyField="id"
																			className="invoice-create-table"
																		>
																			<TableHeaderColumn
																				dataField="date"
																				dataFormat={(cell, rows) =>
																					this.date(cell, rows, props)
																				}
																			>
																				Date
																			</TableHeaderColumn>
																			<TableHeaderColumn dataField="referenceNo">
																				Invoice Number
																			</TableHeaderColumn>
																			<TableHeaderColumn dataField="totalAount">
																				Invoice Amount
																			</TableHeaderColumn>
																			<TableHeaderColumn dataField="dueAmount">
																				Amount Due
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				dataField="paidAmount"
																				dataFormat={(cell, rows) =>
																					this.renderAmount(cell, rows, props)
																				}
																			>
																				Payment
																			</TableHeaderColumn>
																		</BootstrapTable>
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
																					type="button"
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
																					<i className="fa fa-repeat"></i>{' '}
																					Create and More
																				</Button>
																				<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						this.props.history.push(
																							'/admin/expense/payment',
																						);
																					}}
																				>
																					<i className="fa fa-ban"></i> Cancel
																				</Button>
																			</FormGroup>
																		</Col>
																	</Row>
																</div>
															) : (
																<div>
																	There are no pending invoices for selected
																	supplier. Please select different supplier or
																	create a new invoice to proceed further.
																</div>
															)}
														</div>
													)}
												</Form>
											)}
										</Formik>
									</CardBody>
								</Card>
							</Col>
						</Row>
					)}
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePayment);
