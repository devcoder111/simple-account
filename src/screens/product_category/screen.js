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
import { CommonActions } from 'services/global';

import { Loader, ConfirmDeleteModal } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';

import * as ProductCategoryActions from './actions';
import { CSVLink } from 'react-csv';

const mapStateToProps = (state) => {
	return {
		product_category_list: state.product_category.product_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		productCategoryActions: bindActionCreators(
			ProductCategoryActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ProductCategory extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// openDeleteModal: true,
			loading: true,
			selectedRows: [],
			filterData: {
				productCategoryCode: '',
				productCategoryName: '',
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
			clickToSelect: false,
		};
		this.csvLink = React.createRef();
	}

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

	goToDetail = (row) => {
		this.props.history.push(`/admin/master/product-category/detail`, {
			id: row.id,
		});
	};

	// Show Success Toast
	success = () => {
		return toast.success('Product Category Deleted Successfully... ', {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = (search) => {
		const { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.productCategoryActions
			.getProductCategoryList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : '',
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

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	// -------------------------
	// Actions
	//--------------------------

	// Delete Vat By ID
	bulkDelete = () => {
		const { selectedRows } = this.state;
		const message1 =
			<text>
			<b>Delete Product Category?</b>
			</text>
			const message = 'This Product Category will be deleted permanently and cannot be recovered. ';
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
		let { selectedRows } = this.state;
		const { product_category_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.removeDialog();
		this.props.productCategoryActions
			.deleteProductCategory(obj)
			.then((res) => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					'Product Category Deleted Successfully',
				);
				if (
					product_category_list &&
					product_category_list.data &&
					product_category_list.data.length > 0
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
	// deleteProductCategory() {
	//   // this.setState({ loading: true })
	//   this.setState({ openDeleteModal: false })
	//   const data = {
	//     ids: this.state.selectedRows
	//   }
	//   this.props.productCategoryActions.deleteProductCategory(data).then((res) => {
	//     if (res.status === 200) {
	//       // this.setState({ loading: false })
	//       this.initializeData()
	//     }
	//   }).catch((err) => {
	//     this.setState({ openDeleteModal: false })
	//   })
	// }

	// Open Confirm Modal
	// showConfirmModal() {
	//   this.setState({ openDeleteModal: true })
	// }
	// // Delete Confirm Modal
	// closeConfirmModal() {
	//   this.setState({ openDeleteModal: false })
	// }

	handleFilterChange = (e, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: e.target.value,
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
			this.props.productCategoryActions
				.getProductCategoryList(obj)
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
					productCategoryCode: '',
					productCategoryName: '',
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
		const { product_category_list } = this.props;

		// let display_data = this.filterVatList(vatList)

		return (
			<div className="vat-code-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<div className="h4 mb-0 d-flex align-items-center">
								<i className="nav-icon icon-briefcase" />
								<span className="ml-2">Product Category</span>
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
														filename={'ProductCategory.csv'}
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
											<form onSubmit={this.handleSubmit}>
												<Row>
													<Col lg={4} className="mb-1">
														<Input
															type="text"
															name="code"
															placeholder="Product Category Code"
															value={filterData.productCategoryCode}
															// value={productCategoryCode ? productCategoryCode: ''}
															onChange={(e) => {
																this.handleFilterChange(
																	e,
																	'productCategoryCode',
																);
															}}
														/>
													</Col>
													<Col lg={4} className="mb-1">
														<Input
															type="text"
															name="name"
															placeholder="Product Category Name"
															value={filterData.productCategoryName}
															autoComplete="off"
															// value={productCategoryName ?  productCategoryName : ''}
															onChange={(e) => {
																this.handleFilterChange(
																	e,
																	'productCategoryName',
																);
															}}
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
												this.props.history.push(
													`/admin/master/product-category/create`,
												)
											}
										>
											<i className="fas fa-plus mr-1" />
											Add New Product Category
										</Button>
										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={
												product_category_list && product_category_list.data
													? product_category_list.data
													: []
											}
											version="4"
											hover
											pagination={
												product_category_list &&
												product_category_list.data &&
												product_category_list.data.length
													? true
													: false
											}
											keyField="id"
											remote
											fetchInfo={{
												dataTotalSize: product_category_list.count
													? product_category_list.count
													: 0,
											}}
											className="product-table"
											trClassName="cursor-pointer"
											csvFileName="product_category.csv"
											ref={(node) => (this.table = node)}
										>
											<TableHeaderColumn
												dataField="productCategoryCode"
												dataSort
												className="table-header-bg"
											>
												Code
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="productCategoryName"
												dataSort
												className="table-header-bg"
											>
												Product Category Name
											</TableHeaderColumn>
										</BootstrapTable>
									</Col>
								</Row>
							)}
						</CardBody>
					</Card>
					{/* <Modal isOpen={this.state.openDeleteModal}
            className={'modal-danger ' + this.props.className}>
            <ModalHeader toggle={this.toggleDanger}>Delete</ModalHeader>
            <ModalBody>
              Are you sure want to delete this record?
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={this.deleteProductCategory}>Yes</Button>&nbsp;
                  <Button color="secondary" onClick={this.closeConfirmModal}>No</Button>
            </ModalFooter>
          </Modal> */}
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductCategory);
