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
	FormGroup,
	Input,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Select from 'react-select';

import { Loader, ConfirmDeleteModal } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import * as ChartAccountActions from './actions';
import { selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';
import { CSVLink } from 'react-csv';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		transaction_category_list: state.chart_account.transaction_category_list,
		transaction_type_list: state.chart_account.transaction_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		chartOfAccountActions: bindActionCreators(ChartAccountActions, dispatch),
	};
};

class ChartAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			selectedRows: [],
			dialog: null,
			filterData: {
				transactionCategoryCode: '',
				transactionCategoryName: '',
				chartOfAccountId: '',
			},
			selectedTransactionType: '',
			csvData: [],
			view: false,
			unselectable: [],
		};

		this.options = {
			onRowClick: this.goToDetailPage,
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
			unselectable: this.state.unselectable,
		};
		this.csvLink = React.createRef();
	}

	unselectable(res) {
		return res.data.map((unselect) => {
			if (unselect.editableFlag === false) {
				this.state.unselectable.push(unselect.transactionCategoryId);
			}
		});
	}

	componentDidMount = () => {
		this.props.chartOfAccountActions.getTransactionTypes();
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
		this.props.chartOfAccountActions
			.getTransactionCategoryList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.unselectable(res.data);
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

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	goToDetailPage = (row) => {
		if (row.editableFlag) {
			this.props.history.push(`/admin/master/chart-account/detail`, {
				id: row.transactionCategoryId,
			});
		}
	};

	goToCreatePage = () => {
		this.props.history.push('/admin/master/chart-account/create');
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
			tempList.push(row.transactionCategoryId);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.transactionCategoryId) {
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
				tempList.push(item.transactionCategoryId);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		const message1 =
		<text>
		<b>Delete Chart of Account?</b>
		</text>
		const message ='This Chart of Account will be deleted permanently and cannot be recovered.';
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
		let { selectedRows } = this.state;
		const { transaction_category_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.chartOfAccountActions
			.removeBulk(obj)
			.then(() => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					'Chart of Accounts Deleted Successfully',
				);
				if (
					transaction_category_list &&
					transaction_category_list.data &&
					transaction_category_list.data.length > 0
				) {
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

	typeFormatter = (cell, row) => {
		return row['transactionTypeName'] ? row['transactionTypeName'] : '';
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
			this.props.chartOfAccountActions
				.getTransactionCategoryExportList(obj)
				.then((res) => {
					if (res.status === 200) {
						this.setState({ csvData: res.data, view: true }, () => {
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
					transactionCategoryCode: '',
					transactionCategoryName: '',
					chartOfAccountId: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	editFormatter = (cell, row) => {
		return row['editableFlag'] ? (
			<i className="fas fa-lock-open"></i>
		) : (
			<i className="fas fa-lock"></i>
		);
	};

	customName(cell, row) {
		if (row.transactionCategoryName.length > 15) {
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
		const { transaction_category_list, transaction_type_list } = this.props;
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
			<div className="chart-account-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-area-chart" />
										<span className="ml-2">Chart of Accounts</span>
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
														filename={'ChartOfAccount.csv'}
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
											<form>
												<Row>
													<Col lg={3} className="mb-1">
														<Input
															type="text"
															placeholder="Code"
															value={filterData.transactionCategoryCode}
															onChange={(e) => {
																this.handleChange(
																	e.target.value,
																	'transactionCategoryCode',
																);
															}}
														/>
													</Col>
													<Col lg={3} className="mb-2">
														<Input
															type="text"
															placeholder="Name"
															value={filterData.transactionCategoryName}
															onChange={(e) => {
																this.handleChange(
																	e.target.value,
																	'transactionCategoryName',
																);
															}}
														/>
													</Col>
													<Col lg={3} className="mb-1">
														<FormGroup className="mb-3">
															<Select
																styles={customStyles}
																options={
																	transaction_type_list
																		? selectOptionsFactory.renderOptions(
																				'chartOfAccountName',
																				'chartOfAccountId',
																				transaction_type_list,
																				'Type',
																		  )
																		: []
																}
																onChange={(val) => {
																	if (val && val['value']) {
																		this.handleChange(val, 'chartOfAccountId');
																		this.setState({
																			selectedTransactionType: val,
																		});
																	} else {
																		this.handleChange('', 'chartOfAccountId');
																		this.setState({
																			selectedTransactionType: '',
																		});
																	}
																}}
																className="select-default-width"
																placeholder="Transaction Type"
																value={filterData.chartOfAccountId}
															/>
														</FormGroup>
													</Col>
													<Col lg={3} className="pl-0 pr-0">
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
											onClick={this.goToCreatePage}
											style={{ marginBottom: '10px' }}
										>
											<i className="fas fa-plus mr-1" />
											Add New Account
										</Button>
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													transaction_category_list &&
													transaction_category_list.data
														? transaction_category_list.data
														: []
												}
												version="4"
												hover
												pagination={
													transaction_category_list &&
													transaction_category_list.data &&
													transaction_category_list.data.length
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: transaction_category_list.count
														? transaction_category_list.count
														: 0,
												}}
												className="product-table"
												trClassName="cursor-pointer"
												csvFileName="Chart_Of_Account.csv"
												keyField="transactionCategoryId"
												ref={(node) => (this.table = node)}
											>
												<TableHeaderColumn
													dataField="transactionCategoryCode"
													dataSort
													className="table-header-bg"
												>
													Code
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="transactionCategoryName"
													dataSort
													columnTitle={this.customName}
													className="table-header-bg"
												>
													Name
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="chartOfAccountId"
													dataSort
													dataFormat={this.typeFormatter}
													className="table-header-bg"
												>
													Type
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="isEditable"
													dataFormat={this.editFormatter}
													className="table-header-bg"
												>
													Status
												</TableHeaderColumn>
											</BootstrapTable>
										</div>
									</Col>
								</Row>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartAccount);
