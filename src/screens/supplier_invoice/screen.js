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
	ButtonGroup,
	Input,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import Select from 'react-select';
// import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { CSVLink } from 'react-csv';

import EmailModal from '../customer_invoice/sections/email_template';

import { Loader, ConfirmDeleteModal, Currency } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';

import moment from 'moment';

import * as SupplierInvoiceActions from './actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		supplier_invoice_list: state.supplier_invoice.supplier_invoice_list,
		supplier_list: state.supplier_invoice.supplier_list,
		status_list: state.supplier_invoice.status_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		supplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
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

const invoiceimage = require('assets/images/invoice/invoice.png');
const overWeekly = require('assets/images/invoice/week1.png');
const overduemonthly = require('assets/images/invoice/month.png');
const overdue = require('assets/images/invoice/due1.png');

class SupplierInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dialog: false,
			openEmailModal: false,
			actionButtons: {},
			filterData: {
				supplierId: '',
				referenceNumber: '',
				invoiceDate: '',
				invoiceDueDate: '',
				amount: '',
				status: '',
				contactType: 1,
			},
			selectedRows: [],
			contactType: 1,
			openInvoicePreviewModal: false,
			selectedId: '',
			csvData: [],
			view: false,
			overDueAmountDetails: {
				overDueAmount: '',
				overDueAmountWeekly: '',
				overDueAmountMonthly: '',
			},
		};

		this.options = {
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};
		this.selectRowProp = {
			//	mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.csvLink = React.createRef();
	}

	componentDidMount = () => {
		let { filterData } = this.state;
		this.props.supplierInvoiceActions.getStatusList();
		this.props.supplierInvoiceActions.getSupplierList(filterData.contactType);
		this.initializeData();
		this.getOverdue();
	};

	getOverdue = () => {
		let { filterData } = this.state;
		this.props.supplierInvoiceActions
			.getOverdueAmountDetails(filterData.contactType)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ overDueAmountDetails: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	initializeData = (search) => {
		let { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.supplierInvoiceActions
			.getSupplierInvoiceList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false }, () => {
						if (this.props.location.state && this.props.location.state.id) {
							this.openInvoicePreviewModal(this.props.location.state.id);
						}
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
	};
	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
		});
	};

	renderInvoiceNumber = (cell, row) => {
		return (
			<label
				className="mb-0 my-link"
				onClick={() =>
					this.props.history.push('/admin/expense/supplier-invoice/detail')
				}
			>
				{row.transactionCategoryName}
			</label>
		);
	};

	renderInvoiceStatus = (cell, row) => {
		let classname = '';
		if (row.status === 'Paid') {
			classname = 'label-success';
		} else if (row.status === 'Draft') {
			classname = 'label-currency';
		} else if (row.status === 'Partially Paid') {
			classname = 'label-PartiallyPaid';
		}else if (row.status === 'Due Today') {
			classname = 'label-due';
		} else {
			classname = 'label-overdue';
		}
		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{row.status}
			</span>
		);
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	renderInvoiceAmount = (cell, row, extraData) => {
		return(
			<div>
								<div>
						<label className="font-weight-bold mr-2 ">Invoice Amount : </label>
						<label>
							{row.invoiceAmount  === 0 ? row.invoiceAmount.toFixed(2) : row.invoiceAmount.toFixed(2)}
						</label>
					</div>
					<div>
					<label className="font-weight-bold mr-2">Vat Amount : </label>
					<label>{row.vatAmount === 0  ?  row.vatAmount.toFixed(2) :  row.vatAmount.toFixed(2)}</label>
					</div>
					<div>
						<label className="font-weight-bold mr-2">Due Amount : </label>
						<label>{row.dueAmount === 0  ?  row.dueAmount.toFixed(2) :  row.dueAmount.toFixed(2)}</label>
					</div>
					
			</div>);
		};

	renderDueAmount =(cell,row,extraData) => {
		return row.dueAmount === 0  ? row.currencySymbol+row.dueAmount.toFixed(2) : row.currencySymbol+row.dueAmount.toFixed(2);
	}

	renderVatAmount = (cell, row, extraData) => {
		return row.vatAmount === 0 ? row.currencySymbol+row.vatAmount.toFixed(2) : row.currencySymbol+row.vatAmount.toFixed(2);
	};
	renderCurrency = (cell, row) => {
		if (row.currencyName) {
			return (
				<label className="badge label-currency mb-0">{row.currencyName}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
	};
	sendCustomEmail = (id) => {
		this.setState({ openEmailModal: true });
	};

	closeEmailModal = (res) => {
		this.setState({ openEmailModal: false });
	};

	invoiceDueDate = (cell, row) => {
		return row.invoiceDueDate ? row.invoiceDueDate : '';
	};
	invoiceDate = (cell, row) => {
		return row.invoiceDate ? row.invoiceDate : '';
	};

	toggleActionButton = (index) => {
		let temp = Object.assign({}, this.state.actionButtons);
		if (temp[parseInt(index, 10)]) {
			temp[parseInt(index, 10)] = false;
		} else {
			temp[parseInt(index, 10)] = true;
		}
		this.setState({
			actionButtons: temp,
		});
	};

	renderActions = (cell, row) => {
		return (
			<div>
				<ButtonDropdown
					isOpen={this.state.actionButtons[row.id]}
					toggle={() => this.toggleActionButton(row.id)}
				>
					<DropdownToggle size="sm" color="primary" className="btn-brand icon">
						{this.state.actionButtons[row.id] === true ? (
							<i className="fas fa-chevron-up" />
						) : (
							<i className="fas fa-chevron-down" />
						)}
					</DropdownToggle>
					<DropdownMenu right>
						{row.statusEnum !== 'Paid' && row.statusEnum !== 'Sent' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/expense/supplier-invoice/detail',
										{ id: row.id },
									)
								}
							>
								<i className="fas fa-edit" /> Edit
							</DropdownItem>
						)}
						{row.statusEnum !== 'Sent' && row.statusEnum !== 'Paid' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem
								onClick={() => {
									this.postInvoice(row);
								}}
							>
								<i className="fas fa-send" /> Post
							</DropdownItem>
						)}
						{/* <DropdownItem  onClick={() => {this.openInvoicePreviewModal(row.id)}}>
              <i className="fas fa-eye" /> View
            </DropdownItem> */}
						<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/supplier-invoice/view',
									{ id: row.id },
								)
							}
						>
							<i className="fas fa-eye" /> View
						</DropdownItem>
						{row.statusEnum === 'Sent' && (
							<DropdownItem
								onClick={() => {
									this.unPostInvoice(row);
								}}
							>
								<i className="fas fa-file" /> Draft
							</DropdownItem>
						)}
						{row.statusEnum !== 'Draft' && row.statusEnum !== 'Paid' && (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/expense/supplier-invoice/record-payment',
										{ id: row },
									)
								}
							>
								<i className="fas fa-university" /> Record Payment
							</DropdownItem>
						)}
						{/* {row.statusEnum !== 'Paid' && row.statusEnum !== 'Sent' && (
							<DropdownItem
								onClick={() => {
									this.closeInvoice(row.id, row.status);
								}}
							>
								<i className="fa fa-trash-o" /> Delete
							</DropdownItem>
						)} */}
						{/* {row.statusEnum !== 'Paid' && row.statusEnum !== 'Sent' && (
							<DropdownItem
								onClick={() => {
									this.sendCustomEmail(row.id);
								}}
							>
								<i className="fa fa-send" /> Send Custom Email
							</DropdownItem>
						)} */}
					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};

	sendMail = (id) => {
		this.props.supplierInvoiceActions
			.sendMail(id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Invoice Send Successfully',
					);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					'Please First fill The Mail Configuration Detail',
				);
			});
	};

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
		}
	};

	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.initializeData();
		}
	};

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.id);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.id) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};
	onSelectAll = (isSelected, rows) => {
		let tempList = [];
		if (isSelected) {
			rows.map((item) => {
				tempList.push(item.id);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		const message1 = (
			<text>
				<b>Delete Supplier Invoice?</b>
			</text>
		);
		const message =
			'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
		if (selectedRows.length > 0) {
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={this.removeBulk}
						cancelHandler={this.removeDialog}
						message={message}
						message1={message1}
					/>
				),
			});
		} else {
			this.props.commonActions.tostifyAlert(
				'info',
				'Please select the rows of the table and try again.',
			);
		}
	};

	removeBulk = () => {
		this.removeDialog();
		let { selectedRows, filterData } = this.state;
		const { supplier_invoice_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.supplierInvoiceActions
			.removeBulk(obj)
			.then((res) => {
				this.initializeData(filterData);
				this.props.commonActions.tostifyAlert(
					'success',
					'Supplier Invoice Deleted Successfully',
				);
				if (supplier_invoice_list && supplier_invoice_list.length > 0) {
					this.setState({
						selectedRows: [],
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

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};

	handleSearch = () => {
		this.initializeData();
	};

	postInvoice = (row) => {
		this.setState({
			loading: true,
		});
		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'INVOICE',
		};
		this.props.supplierInvoiceActions
			.postInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Invoice Posted Successfully',
					);
					this.setState({
						loading: false,
					});
					this.getOverdue();
					this.initializeData();
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

	unPostInvoice = (row) => {
		this.setState({
			loading: true,
		});
		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'INVOICE',
		};
		this.props.supplierInvoiceActions
			.unPostInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Invoice Moved To Draft Successfully',
					);
					this.setState({
						loading: false,
					});
					this.getOverdue();
					this.initializeData();
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

	openInvoicePreviewModal = (id) => {
		this.setState(
			{
				selectedId: id,
			},
			() => {
				this.setState({
					openInvoicePreviewModal: true,
				});
			},
		);
	};

	closeInvoicePreviewModal = (res) => {
		this.setState({ openInvoicePreviewModal: false });
	};

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
		}
	};

	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.initializeData();
		}
	};

	closeInvoice = (id, status) => {
		if (status === 'Paid') {
			this.props.commonActions.tostifyAlert(
				'error',
				'Please delete the receipt first to delete the invoice',
			);
		} else {
			const message1 = (
				<text>
					<b>Delete Supplier Invoice?</b>
				</text>
			);
			const message =
				'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={() => this.removeInvoice(id)}
						cancelHandler={this.removeDialog}
						message={message}
						message1={message1}
					/>
				),
			});
		}
	};

	removeInvoice = (id) => {
		this.removeDialog();
		this.props.supplierInvoiceActions
			.deleteInvoice(id)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Invoice Deleted Successfully',
				);
				this.initializeData();
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.supplierInvoiceActions
				.getSupplierInvoiceList(obj)
				.then((res) => {
					if (res.status === 200) {
						this.setState({ csvData: res.data.data, view: true }, () => {
							setTimeout(() => {
								this.csvLink.current.link.click();
							}, 0);
						});
					}
				});
		} else {
			this.csvLink.current.link.click();
		}
	};

	clearAll = () => {
		this.setState(
			{
				filterData: {
					supplierId: '',
					referenceNumber: '',
					invoiceDate: '',
					invoiceDueDate: '',
					amount: '',
					status: '',
					statusEnum: '',
					contactType: 1,
					contactId: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	render() {
		const {
			loading,
			filterData,
			dialog,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const {
			status_list,
			supplier_list,
			supplier_invoice_list,
			universal_currency_list,
		} = this.props;
		// const containerStyle = {
		//   zIndex: 1999
		// }

		const supplier_invoice_data =
			supplier_invoice_list && supplier_invoice_list.data
				? this.props.supplier_invoice_list.data.map((supplier) => ({
						id: supplier.id,
						status: supplier.status,
						statusEnum: supplier.statusEnum,
						customerName: supplier.name,
						dueAmount:supplier.dueAmount,
						invoiceNumber: supplier.referenceNumber,
						invoiceDate: supplier.invoiceDate ? supplier.invoiceDate : '',
						invoiceDueDate: supplier.invoiceDueDate
							? supplier.invoiceDueDate
							: '',
						invoiceAmount: supplier.totalAmount,
						vatAmount: supplier.totalVatAmount,
						currencyName:supplier.currencyName ? supplier.currencyName:'',
						currencySymbol: supplier.currencySymbol ? supplier.currencySymbol : '',
						contactId: supplier.contactId,
				  }))
				: '';

		
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})		

		return (
			<div className="supplier-invoice-screen">
				<div className="animated fadeIn">
					{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<img
											alt="invoiceimage"
											src={invoiceimage}
											style={{ width: '40px' }}
										/>
										<span className="ml-2">Supplier Invoices</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							{dialog}
							{loading && (
								<Row>
									<Col lg={12} className="rounded-loader">
										<Loader />
									</Col>
								</Row>
							)}

							<Row>
								<Col lg={12}>
									<div className="mb-4 status-panel p-3">
										<Row className="align-items-center justify-content-around">
											<div className="h4 mb-0 d-flex align-items-center ">
												<img
													alt="overdue"
													src={overdue}
													style={{ width: '60px' }}
												/>
												<div>
													<h5 className="ml-3">Overdue</h5>
													<h3 className="invoice-detail ml-3">
														{universal_currency_list[0] &&
														this.state.overDueAmountDetails.overDueAmount ? (
															<Currency
																value={
																	this.state.overDueAmountDetails.overDueAmount
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={
																	this.state.overDueAmountDetails.overDueAmount
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</h3>
												</div>
											</div>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="overWeekly"
													src={overWeekly}
													style={{ width: '60px' }}
												/>
												<div>
													<h5 className="ml-3">Due Within This Week</h5>
													<h3 className="invoice-detail ml-3">
														{universal_currency_list[0] &&
														this.state.overDueAmountDetails
															.overDueAmountWeekly ? (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountWeekly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountWeekly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</h3>
												</div>
											</div>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="overduemonthly"
													src={overduemonthly}
													style={{ width: '60px' }}
												/>
												<div>
													<h5 className="ml-3">Due Within 30 Days</h5>
													<h3 className="invoice-detail ml-3">
														{universal_currency_list[0] &&
														this.state.overDueAmountDetails
															.overDueAmountMonthly ? (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountMonthly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountMonthly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</h3>
												</div>
											</div>
										</Row>
									</div>
									<div className="d-flex justify-content-end">
										<ButtonGroup size="sm">
											{/* <Button
												color="primary"
												className="btn-square mr-1"
												onClick={() => this.getCsvData()}
											>
												<i className="fa glyphicon glyphicon-export fa-download mr-1" />
												Export To CSV
											</Button>
											{view && (
												<CSVLink
													data={csvData}
													filename={'SupplierInvoice.csv'}
													className="hidden"
													ref={this.csvLink}
													target="_blank"
												/>
											)} */}
											{/* <Button
												color="primary"
												className="btn-square mr-1"
												onClick={this.bulkDelete}
												disabled={selectedRows.length === 0}
											>
												<i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
												Bulk Delete
											</Button> */}
										</ButtonGroup>
									</div>
									<div className="py-3">
										<h5>Filter : </h5>
										<Row>
											<Col lg={2} className="mb-1">
												<Select
													styles={customStyles}
													className="select-default-width"
													placeholder="Select Supplier"
													id="supplier"
													name="supplier"
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
													value={filterData.supplierId}
													onChange={(option) => {
														if (option && option.value) {
															this.handleChange(option, 'supplierId');
														} else {
															this.handleChange('', 'supplierId');
														}
													}}
												/>
											</Col>
											<Col lg={2} className="mb-1">
												<DatePicker
													className="form-control"
													id="date"
													name="invoiceDate"
													placeholderText="Invoice Date"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													dropdownMode="select"
													dateFormat="dd/MM/yyyy"
													selected={filterData.invoiceDate}
													// value={filterData.invoiceDate}
													onChange={(value) => {
														this.handleChange(value, 'invoiceDate');
													}}
												/>
											</Col>
											<Col lg={2} className="mb-1">
												<DatePicker
													className="form-control"
													id="date"
													name="invoiceDueDate"
													placeholderText="Invoice Due Date"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													dropdownMode="select"
													dateFormat="dd/MM/yyyy"
													selected={filterData.invoiceDueDate}
													onChange={(value) => {
														this.handleChange(value, 'invoiceDueDate');
													}}
												/>
											</Col>
											<Col lg={2} className="mb-1">
												<Input
													type="number"
													value={filterData.amount}
													placeholder="Amount"
													onChange={(e) => {
														this.handleChange(e.target.value, 'amount');
													}}
												/>
											</Col>
											<Col lg={2} className="mb-1">
												<Select
													styles={customStyles}
													className=""
													// options={status_list ? status_list.map((item) => {
													//   return { label: item, value: item }
													// }) : ''}
													options={
														status_list
															? selectOptionsFactory.renderOptions(
																	'label',
																	'value',
																	status_list,
																	'Status',
															  )
															: []
													}
													value={filterData.status}
													onChange={(option) => {
														if (option && option.value) {
															this.handleChange(option, 'status');
														} else {
															this.handleChange('', 'status');
														}
													}}
													placeholder="Status"
												/>
											</Col>
											<Col lg={2} className="pl-0 pr-0">
												<Button
													type="button"
													color="primary"
													className="btn-square mr-1"
													onClick={this.handleSearch}
												>
													<i className="fa fa-search"></i>
												</Button>
												<Button
													type="button"
													color="primary"
													className="btn-square"
													onClick={this.clearAll}
												>
													<i className="fa fa-refresh"></i>
												</Button>
											</Col>
										</Row>
									</div>
									<Row>
									<div style={{width:"1650px"}}>
									<Button
										color="primary"
										style={{ marginBottom: '10px' }}
										className="btn-square pull-right"
										onClick={() =>
											this.props.history.push(
												`/admin/expense/supplier-invoice/create`,
											)
										}
									>
										<i className="fas fa-plus mr-1" />
										Add New Invoice
									</Button>
									</div>
									</Row> 
									<div style={{overflowX:'auto'}}>
										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={supplier_invoice_data ? supplier_invoice_data : []}
											version="4"
											hover
											keyField="id"
											pagination={
												supplier_invoice_data &&
												supplier_invoice_data.length > 0
													? true
													: false
											}
											remote
											fetchInfo={{
												dataTotalSize: supplier_invoice_list.count
													? supplier_invoice_list.count
													: 0,
											}}
											className="supplier-invoice-table"
											ref={(node) => (this.table = node)}
										>
											<TableHeaderColumn
												dataField="invoiceNumber"
												// dataFormat={this.renderInvoiceNumber}
												dataSort
											//	width="10%"
												className="table-header-bg"
											>
												Invoice Number
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="customerName"
												dataSort
											//	width="12%"
												className="table-header-bg"
											>
												Supplier Name
											</TableHeaderColumn>
											<TableHeaderColumn
											//	width="10%"
												dataField="status"
												dataFormat={this.renderInvoiceStatus}
												dataSort
												className="table-header-bg"
											>
												Status
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="invoiceDate"
												dataSort
											//	width="7%"
												dataFormat={this.invoiceDate}
												className="table-header-bg"
											>
												Invoice Date
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="invoiceDueDate"
												dataSort
											//	width="7%"
												dataFormat={this.invoiceDueDate}
												className="table-header-bg"
											>
												Due Date
											</TableHeaderColumn>
											<TableHeaderColumn
													dataSort
											//		width="5%"
													dataField="currencyName"
													dataFormat={this.renderCurrency}
													className="table-header-bg"
												>
													Currency
												</TableHeaderColumn>
											{/* <TableHeaderColumn
												dataSort
												width="5%"
												dataFormat={this.renderVatAmount}
												formatExtraData={universal_currency_list}
												className="table-header-bg"
											>
												VAT Amount
											</TableHeaderColumn> */}
											<TableHeaderColumn
												dataField="totalAmount"
												dataSort
											//	width="5%"
												dataFormat={this.renderInvoiceAmount}
												className="table-header-bg"
												
											>
												Invoice Amount
											</TableHeaderColumn>
											{/* <TableHeaderColumn
												dataField="dueAmount"
												dataSort
												width="5%"
												dataFormat={this.renderDueAmount}
												className="table-header-bg"
											>
												Due Amount
											</TableHeaderColumn> */}
											<TableHeaderColumn
												className="text-right"
												columnClassName="text-right"
												//width="5%"
												dataFormat={this.renderActions}
												className="table-header-bg"
											></TableHeaderColumn>
										</BootstrapTable>
									</div>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</div>
				{/* <PreviewInvoiceModal
          openInvoicePreviewModal={this.state.openInvoicePreviewModal}
          closeInvoicePreviewModal={(e) => { this.closeInvoicePreviewModal(e) }}
          getInvoiceById={this.props.supplierInvoiceActions.getInvoiceById}
          id={this.state.selectedId}
          currency_list={this.props.currency_list}
          history={this.props.history}
        /> */}
				<EmailModal
					openEmailModal={this.state.openEmailModal}
					closeEmailModal={(e) => {
						this.closeEmailModal(e);
					}}
				/>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SupplierInvoice);
