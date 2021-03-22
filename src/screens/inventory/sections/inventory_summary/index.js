import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	FormGroup,
	Form,
	ButtonGroup,
	Input,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import { DateRangePicker2 } from 'components';
import moment from 'moment';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';
import { Loader, Currency } from 'components';
import * as InventoryActions from '../../actions';

import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';

const mapStateToProps = (state) => {
	return {
		summary_list: state.inventory.summary_list,
		vat_list: state.product.vat_list,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.common.company_profile,

	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		inventoryActions: bindActionCreators(InventoryActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class InventorySummary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dropdownOpen: false,
			view: false,
			initValue: {
				startDate: moment().startOf('month').format('DD/MM/YYYY'),
				endDate: moment().endOf('month').format('DD/MM/YYYY'),
				
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
			
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
		this.columnHeader = [
			{ label: 'Account', value: 'Account', sort: true },
			{ label: 'Account Code', value: 'Account Code', sort: false },
			{ label: 'Total', value: 'Total', sort: false },
		];
	}
	

	generateReport = (value) => {
		this.setState(
			{
				initValue: {
					endDate: moment(value.endDate).format('DD/MM/YYYY'),
				},
				loading: true,
				view: !this.state.view,
			},
			() => {
				this.initializeData();
			},
		);
	};

	componentDidMount = () => {
		this.initializeData();
		this.props.commonActions.getCompany() 
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
		this.props.inventoryActions
			.getProductInventoryList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};
	
	exportFile = (csvData, fileName, type) => {
		const fileType =
			type === 'xls'
				? 'application/vnd.ms-excel'
				: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
		const fileExtension = `.${type}`;
		const ws = XLSX.utils.json_to_sheet(csvData);
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
		const excelBuffer = XLSX.write(wb, { bookType: type, type: 'array' });
		const data = new Blob([excelBuffer], { type: fileType });
		FileSaver.saveAs(data, fileName + fileExtension);
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

	toggle = () =>
		this.setState((prevState) => {
			return { dropdownOpen: !prevState.dropdownOpen };
		});

	viewFilter = () =>
		this.setState((prevState) => {
			return { view: !prevState.view };
		});

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		const { loading, initValue, dropdownOpen, csvData, view } = this.state;
		const { summary_list, vat_list, universal_currency_list,company_profile} = this.props;

		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
							<CardHeader>
							
							</CardHeader>
							
							<CardBody id="section-to-print">
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A4"
								>
							<div style={{	
									
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '1rem'}}>
									<div>
									<img
										src={ 
											company_profile &&
											company_profile.companyLogoByteArray
												? 'data:image/jpg;base64,' +
											company_profile.companyLogoByteArray
												: logo
										}
										className=""
										alt=""
										style={{ width: ' 150px' }}></img>
								
									
									</div>			
									<div style={{textAlign:'center'}} >
								
										<h2>
										{company_profile &&
											company_profile['companyName']
												? company_profile['companyName']
												: ''}
											</h2>	
										
											<b style ={{ fontSize: '18px'}}>Inventory Summary</b>
											<br/>
											As on {initValue.endDate}
											
									</div>
									
									<div>
									<Form onSubmit={this.handleSubmit} name="simpleForm">
								<div className="flex-wrap d-flex justify-content-end">
									<FormGroup>
										<ButtonGroup className="mr-3">
											<Button
												color="primary"
												className="btn-square"
												onClick={() => this.table.handleExportCSV()}
											>
												<i className="fa glyphicon glyphicon-export fa-download mr-1" />
												Export
											</Button>
										</ButtonGroup>
									</FormGroup>
									</div>
									</Form>
										</div>
							</div>
									{loading ? (
										<Loader />
									) : (
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													summary_list && summary_list.data
														? summary_list.data
														: []
												}
												version="4"
												hover
												pagination={
													summary_list &&
													summary_list.data &&
													summary_list.data.length > 0
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: summary_list.count
														? summary_list.count
														: 0,
												}}
												className="product-table"
												trClassName="cursor-pointer"
												csvFileName="summary_list.csv"
												ref={(node) => (this.table = node)}
											>
												<TableHeaderColumn isKey dataField="productName" dataSort className="table-header-bg">
													Product	Name
												</TableHeaderColumn >
												<TableHeaderColumn dataField="productCode" dataSort className="table-header-bg">
													Product Code
												</TableHeaderColumn>
												<TableHeaderColumn  dataField="purchaseOrder" dataSort className="table-header-bg">
												 Order Quantity
												</TableHeaderColumn >
												<TableHeaderColumn  dataField="quantitySold" dataSort className="table-header-bg">
												Quantity Sold
												</TableHeaderColumn >
												<TableHeaderColumn  dataField="stockInHand" dataSort className="table-header-bg">
												Stock In Hand
												</TableHeaderColumn >
												<TableHeaderColumn  dataField="supplierName" dataSort className="table-header-bg">
												Supplier Name
												</TableHeaderColumn >
											</BootstrapTable>
										</div>
									)}
									<div style={{ textAlignLast:'center'}}> Powered By <b>SimpleAccounts</b></div> 
								</PDFExport>
							</CardBody>
						</div>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InventorySummary);
