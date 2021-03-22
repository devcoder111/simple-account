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
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import * as ContactActions from './actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import { CSVLink } from 'react-csv';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		contact_list: state.contact.contact_list,
		contact_type_list: state.contact.contact_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		contactActions: bindActionCreators(ContactActions, dispatch),
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

class Contact extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			selectedRows: [],
			dialog: null,
			filterData: {
				name: '',
				email: '',
				contactType: '',
			},
			selectedContactType: '',
			csvData: [],
			view: false,
		};

		this.options = {
			onRowClick: this.goToDetail,
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};

		this.selectRowProp = {
			//mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.csvLink = React.createRef();
	}

	componentDidMount = () => {
		this.props.contactActions.getContactTypeList();
		this.initializeData();
	};

	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
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
		this.props.contactActions
			.getContactList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						loading: false,
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

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
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
			rows.map((item) => tempList.push(item.id));
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	goToDetail = (row) => {
		this.props.history.push('/admin/master/contact/detail', { id: row.id });
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		this.props.contactActions
			.getInvoicesCountContact(selectedRows)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the contact',
					);
				} else {
					const message1 =
		<text>
		<b>Delete Contact?</b>
		</text>
		const message ='This Contact will be deleted permanently and cannot be recovered.';
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
				}
			});
	};

	removeBulk = () => {
		this.removeDialog();
		let { selectedRows } = this.state;
		const { contact_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.contactActions
			.removeBulk(obj)
			.then((res) => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					'Contacts Deleted Successfully',
				);
				if (contact_list && contact_list.data && contact_list.data.length > 0) {
					this.setState({
						selectedRows: [],
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err !== null ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ isLoading: false });
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

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.contactActions.getContactList(obj).then((res) => {
				if (res.status === 200) {
					var result = res.data.data.map((o) => ({
						'First Name': o.firstName,
						'Last Name': o.lastName,
						Email: o.email,
						'Mobile Number': o.mobileNumber,
						Currency: o.currencySymbol,
						Type: o.contactTypeString,
					}));

					this.setState({ csvData: result, view: true }, () => {
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
					name: '',
					email: '',
					contactType: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	customEmail(cell, row) {
		if (row.email.length > 15) {
			return `${cell}`;
		}
	}
	customName(cell, row) {
		if (row.firstName.length > 15) {
			return `${cell}`;
		}
	}

	render() {
		const {
			loading,
			dialog,
			selectedRows,
			csvData,
			view,
			filterData,
		} = this.state;
		const { contact_list, contact_type_list } = this.props;

		return (
			<div className="contact-screen">
				<div className="animated fadeIn">
					{dialog}
					{/* // <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-id-card-alt" />
										<span className="ml-2">Contact</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							{loading ? (
								<Row>
									<Col lg={12}>
										<Loader />
									</Col>
								</Row>
							) : (
								<Row>
									<Col lg={12}>
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
														filename={'Contact.csv'}
														className="hidden"
														ref={this.csvLink}
														enclosingCharacter={`'`}
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
											<form>
												<Row>
													<Col lg={3} className="mb-1">
														<Input
															type="text"
															placeholder="Name"
															value={filterData.name}
															onChange={(e) => {
																this.handleChange(e.target.value, 'name');
															}}
														/>
													</Col>

													<Col lg={3} className="mb-1">
														<Input
															type="text"
															placeholder="Email"
															value={filterData.email}
															onChange={(e) => {
																this.handleChange(e.target.value, 'email');
															}}
														/>
													</Col>

													<Col lg={3} className="mb-1">
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
															onChange={(val) => {
																if (val && val.value) {
																	this.handleChange(val, 'contactType');
																	this.setState({ selectedContactType: val });
																} else {
																	this.handleChange('', 'contactType');
																	this.setState({ selectedContactType: '' });
																}
															}}
															className="select-default-width"
															placeholder="Contact Type"
															value={filterData.contactType}
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
											</form>
										</div>
										<Button
											color="primary"
											className="btn-square pull-right"
											style={{ marginBottom: '10px' }}
											onClick={() =>
												this.props.history.push(`/admin/master/contact/create`)
											}
										>
											<i className="fas fa-plus mr-1" />
											Add New Contact
										</Button>
										
													<BootstrapTable
														selectRow={this.selectRowProp}
														search={false}
														options={this.options}
														data={
															contact_list && contact_list.data
																? contact_list.data
																: []
														}
														version="4"
														hover
														pagination={
															contact_list &&
															contact_list.data &&
															contact_list.data.length > 0
																? true
																: false
														}
														remote
														fetchInfo={{
															dataTotalSize: contact_list.count
																? contact_list.count
																: 0,
														}}
														className="product-table"
														trClassName="cursor-pointer"
														csvFileName="Contact.csv"
														ref={(node) => {
															this.table = node;
														}}
													>
														<TableHeaderColumn
															isKey
															dataField="firstName"
															dataSort
															columnTitle={this.customName}
															className="table-header-bg"
														>
															Name
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="email"
															columnTitle={this.customEmail}
															dataSort
															className="table-header-bg"
														>
															email
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="contactTypeString"
															dataSort
															// dataFormat={this.typeFormatter}
															className="table-header-bg"
														>
															Type
														</TableHeaderColumn>
													</BootstrapTable>
												</Col>
												{/* <Col xs="12" lg="4">
                            <div className="contact-info p-4">
                              <h4>Mr. Admin Admin</h4>
                              <hr />
                              <div className="d-flex">
                                <div className="contact-name mr-4">AA</div>
                                <div className="info">
                                  <p><strong>Company: </strong> admin </p>
                                  <p><strong>Email: </strong> admin@admin.com </p>
                                  <p><strong>Tel No: </strong> 1231 </p>
                                  <p><strong>Next Due Date: </strong> 11/01/2019 </p>
                                  <p><strong>Due Amount: </strong> Lek 400 </p>
                                  <p><strong>Contact Type: </strong>Customer </p>
                                </div>

                              </div>
                              <div className="text-right mt-3">
                                <Button
                                  color="primary"
                                  className="btn-square "
                                  onClick={() => this.props.history.push(`/admin/invoice/create`)}
                                >
                                  <i className="fas fa-plus mr-1" />
                                  New Invoice
                                </Button>
                              </div>
                            </div>
                          </Col> */}
											</Row>
									
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Contact);
