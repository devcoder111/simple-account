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
import DatePicker from 'react-datepicker';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import * as ReceiptActions from '../../actions';
import * as ReceiptCreateActions from './actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';
import API_ROOT_URL from '../../../../constants/config';
import 'react-datepicker/dist/react-datepicker.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import './style.scss';
import moment from 'moment';

const mapStateToProps = (state) => {
	return {
		contact_list: state.receipt.contact_list,
		invoice_list: state.receipt.invoice_list,
		deposit_list: state.customer_invoice.deposit_list,
		pay_mode: state.customer_invoice.pay_mode,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		receiptCreateActions: bindActionCreators(ReceiptCreateActions, dispatch),
		receiptActions: bindActionCreators(ReceiptActions, dispatch),
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

class CreateReceipt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			createMore: false,
			initValue: {
				receiptNo: 1,
				receiptDate: new Date(),
				contactId: '',
				amount: '',
				fileName: '',
				payMode: '',
				notes: '',
				depositeTo: '',
				referenceCode: '',
				attachmentFile: '',
				paidInvoiceListStr: [],
			},
			data: [],
			paidInvoiceListStr: [],
		};
		this.formRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
		};
		this.csvLink = React.createRef();
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
	}

	onRowSelect = (row, isSelected, e) => {
		console.log(this.state.initValue);
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
				console.log(this.state.paidInvoiceListStr);
				console.log(this.state.initValue);
			},
		);
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

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.receiptActions.getContactList(2);
		this.props.customerInvoiceActions.getDepositList();
		this.props.customerInvoiceActions.getPaymentMode();
	};

	handleSubmit = (data, resetForm) => {
		//const { invoiceId } = this.state;
		const {
			receiptNo,
			receiptDate,
			contactId,
			amount,
			depositeTo,
			payMode,
			notes,
			referenceCode,
		} = data;
		console.log(data);
		let formData = new FormData();
		formData.append('receiptNo', receiptNo !== null ? receiptNo : '');
		formData.append(
			'receiptDate',
			typeof receiptDate === 'string'
				? moment(receiptDate, 'DD/MM/YYYY').toDate()
				: receiptDate,
		);
		formData.append('amount', amount !== null ? amount : '');
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
		this.props.receiptCreateActions
			.createReceipt(formData)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Invoice Updated Successfully.',
				);
				this.props.history.push('/admin/income/customer-invoice');
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	getList = (id) => {
		this.props.receiptCreateActions
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
	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon"
				disabled={this.state.data.length === 1 ? true : false}
				// onClick={(e) => {
				// 	this.deleteRow(e, rows, props);
				// }}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
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
		const { contact_list, deposit_list, pay_mode } = this.props;
		const { initValue, data } = this.state;
		return (
			<div className="create-receipt-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa fa-file-o" />
												<span className="ml-2">Create Receipt</span>
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
													receiptDate: Yup.date().required(
														'Receipt Date is Required',
													),
													contactId: Yup.string().required(
														'Customer is required',
													),
													depositeTo: Yup.string().required(
														'Deposit to is required',
													),
													payMode: Yup.string().required(
														'Payment mode is Required',
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
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="customer_name">
																		<span className="text-danger">*</span>
																		Customer Name
																	</Label>
																	<Select
																		styles={customStyles}
																		options={
																			contact_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						contact_list,
																						'Customer Name',
																				  )
																				: []
																		}
																		// className="select-default-width"
																		placeholder="Customer Name"
																		value={props.values.contactId}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('contactId')(option);
																			} else {
																				props.handleChange('contactId')('');
																			}
																			this.getList(option.value);
																		}}
																		className={`${
																			props.errors.contactId &&
																			props.touched.contactId
																				? 'is-invalid'
																				: ''
																		}`}
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
																	<Label htmlFor="receiptNo">Payment</Label>
																	<Input
																		type="text"
																		id="receiptNo"
																		name="receiptNo"
																		readOnly
																		placeholder="Payment Number"
																		value={props.values.receiptNo}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExBoth.test(option.target.value)
																			) {
																				props.handleChange('receiptNo')(option);
																			}
																		}}
																	/>
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
																						<span className="text-danger">
																							*
																						</span>
																						Amount Received
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
																					<Label htmlFor="receipt_date">
																						<span className="text-danger">
																							*
																						</span>
																						Payment Date
																					</Label>
																					<DatePicker
																						id="date"
																						name="receiptDate"
																						placeholderText="Receipt Date"
																						selected={props.values.receiptDate}
																						showMonthDropdown
																						showYearDropdown
																						dateFormat="dd/MM/yyyy"
																						dropdownMode="select"
																						onChange={(value) => {
																							props.handleChange('receiptDate')(
																								value,
																							);
																						}}
																						className={`form-control ${
																							props.errors.receiptDate &&
																							props.touched.receiptDate
																								? 'is-invalid'
																								: ''
																						}`}
																					/>
																					{props.errors.receiptDate &&
																						props.touched.receiptDate && (
																							<div className="invalid-feedback">
																								{props.errors.receiptDate}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col lg={4}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="payMode">
																						<span className="text-danger">
																							*
																						</span>{' '}
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
																								props.handleChange('payMode')(
																									'',
																								);
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
																						<span className="text-danger">
																							*
																						</span>{' '}
																						Deposit To
																					</Label>
																					<Select
																						styles={customStyles}
																						options={deposit_list}
																						value={props.values.depositeTo}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange(
																									'depositeTo',
																								)(option);
																							} else {
																								props.handleChange(
																									'depositeTo',
																								)('');
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
																										option.target.value ===
																											'' ||
																										this.regExBoth.test(
																											option.target.value,
																										)
																									) {
																										props.handleChange(
																											'referenceCode',
																										)(option);
																									}
																								}}
																								value={
																									props.values.referenceCode
																								}
																							/>
																						</FormGroup>
																					</Col>
																				</Row>
																				<Row>
																					<Col lg={12}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="notes">
																								Notes
																							</Label>
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
																								defaultValue={
																									props.values.notes
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
																								name="attachmentFile"
																								render={({ field, form }) => (
																									<div>
																										<Label>
																											Reciept Attachment
																										</Label>{' '}
																										<br />
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
																							{props.errors.attachmentFile &&
																								props.touched
																									.attachmentFile && (
																									<div className="invalid-file">
																										{
																											props.errors
																												.attachmentFile
																										}
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
																							this.setState({
																								createMore: false,
																							});
																							props.handleSubmit();
																						}}
																					>
																						<i className="fa fa-dot-circle-o"></i>{' '}
																						Create
																					</Button>
																					<Button
																						type="button"
																						color="secondary"
																						className="btn-square"
																						onClick={() => {
																							this.props.history.push(
																								'/admin/income/receipt',
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
																		customer. Please select different customer
																		or create a new invoice to proceed further.
																	</div>
																)}
															</div>
														)}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateReceipt);
