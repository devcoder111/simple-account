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
	Input,
	ButtonGroup,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import { Loader, ConfirmDeleteModal } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';

import * as VatActions from './actions';
import { CSVLink } from 'react-csv';

import { CommonActions } from 'services/global';
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";

function NumberFormatCustom(props) {
	const { inputRef, onChange, ...other } = props;
  
	return (
	  <NumberFormat
		{...other}
		getInputRef={inputRef}
		onValueChange={values => {
		  onChange({
			target: {
			  value: values.value
			}
		  });
		}}
		thousandSeparator
		suffix="%"
	  />
	);
  }
  
  NumberFormatCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired
  };

const mapStateToProps = (state) => {
	return {
		vat_list: state.vat.vat_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		vatActions: bindActionCreators(VatActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class VatCode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			openDeleteModal: false,
			loading: true,
			selectedRows: [],
			filterData: {
				name: '',
				vatPercentage: '',
			},
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
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};

		this.csvLink = React.createRef();
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = (search) => {
		let { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage ? this.options.sizePerPage : 10,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.vatActions
			.getVatList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({
					loading: false,
				});
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	onRowSelect = (row, isSelected) => {
		if (isSelected) {
			this.state.selectedRows.push(row.id);
			this.setState({
				selectedRows: this.state.selectedRows,
			});
		} else {
			this.setState({
				selectedRows: this.state.selectedRows.filter((el) => el !== row.id),
			});
		}
	};

	onSelectAll = (isSelected, rows) => {
		this.setState({
			selectedRows: isSelected ? rows.map((row) => row.id) : [],
		});
	};

	// -------------------------
	// Data Table Custom Fields
	//--------------------------

	vatPercentageFormat = (cell, row) => {
		return `${row.vat} %`;
	};

	goToDetail = (row) => {
		this.props.history.push('/admin/master/vat-category/detail', {
			id: row.id,
		});
	};

	// Show Success Toast
	success = () => {
		return toast.success('Vat Code Deleted Successfully... ', {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
		}
	};

	onPageChange = (page) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.initializeData();
		}
	};

	// -------------------------
	// Actions
	//--------------------------

	// Delete Vat By ID
	bulkDelete = () => {
		const { selectedRows } = this.state;
		console.log(selectedRows);
		this.props.vatActions
			.getVatCount(selectedRows)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the product',
					);
				} else {
		const message1 =
        <text>
        <b>Delete Vat Code?</b>
        </text>
        const message = 'This Vat Code will be deleted permanently and cannot be recovered. ';
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
		let { selectedRows } = this.state;
		const { vat_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.removeDialog();
		this.props.vatActions
			.deleteVat(obj)
			.then((res) => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					'Vat Code Deleted Successfully',
				);
				if (vat_list && vat_list.data && vat_list.data.length > 0) {
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

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.vatActions.getVatList(obj).then((res) => {
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
					name: '',
					vatPercentage: '',
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
			selectedRows,
			dialog,
			csvData,
			view,
			filterData,
		} = this.state;
		const { vat_list } = this.props;

		return (
			<div className="vat-code-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<div className="h4 mb-0 d-flex align-items-center">
								<i className="nav-icon icon-briefcase" />
								<span className="ml-2">Vat Categories</span>
							</div>
						</CardHeader>
						<CardBody>
							{dialog}
							{loading ? (
								<Loader></Loader>
							) : (
								<Row>
									<Col lg={12}>
										<div className="d-flex justify-content-end">
											<ButtonGroup className="toolbar" size="sm">
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
														filename={'VatCode.csv'}
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
												<Col lg={4} className="mb-1">
													<TextField
														type="text"
														id="outlined-basic"
														size="small"
														fullWidth
												 		variant="outlined"
														value={filterData.name}
														placeholder="Name"
														onChange={(e) => {
															this.handleChange(e.target.value, 'name');
														}}
													/>
													
												</Col>
												<Col lg={4} className="mb-1">
													{/* <Input
														type="text"
														value={filterData.vatPercentage}
														placeholder="Vat Percentage"
														onChange={(e) => {
															e.preventDefault();
															this.handleChange(
																e.target.value,
																'vatPercentage',
															);
														}}
													/> */}
													<TextField
														id="outlined-basic"
														variant="outlined"
														fullWidth
														type="text"
														value={filterData.vatPercentage}
														placeholder="Vat Percentage"
														size="small"
														onChange={(e) => {
															this.handleChange(
																e.target.value,
																'vatPercentage',
															);
														}}
														InputProps={{
															inputComponent: NumberFormatCustom
														  }}
													/>
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
										</div>
										<Button
											color="primary"
											className="btn-square pull-right"
											style={{ marginBottom: '10px' }}
											onClick={() =>
												this.props.history.push(
													`/admin/master/vat-category/create`,
												)
											}
										>
											<i className="fas fa-plus mr-1" />
											Add New Vat
										</Button>
										<BootstrapTable
											data={
												vat_list && vat_list.data && vat_list.data.length > 0
													? vat_list.data
													: []
											}
											hover
											version="4"
											pagination={
												vat_list && vat_list.data && vat_list.data.length > 0
													? true
													: false
											}
											search={false}
											selectRow={this.selectRowProp}
											options={this.options}
											remote
											fetchInfo={{
												dataTotalSize: vat_list.count ? vat_list.count : 0,
											}}
											trClassName="cursor-pointer"
											csvFileName="vat_code.csv"
											ref={(node) => {
												this.table = node;
											}}
										>
											<TableHeaderColumn isKey dataField="name" dataSort className="table-header-bg">
												Vat Name
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="vat"
												dataFormat={this.vatPercentageFormat}
												dataSort			
												className="table-header-bg"
											>
												Vat Percentage
											</TableHeaderColumn>
										</BootstrapTable>
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

export default connect(mapStateToProps, mapDispatchToProps)(VatCode);
