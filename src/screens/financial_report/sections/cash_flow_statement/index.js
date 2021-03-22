import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	Card,
	CardHeader,
	CardBody,
	Row,
	Col,
	Table,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';

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
import * as FinancialReportActions from '../../actions';
import FilterComponent from '../filterComponent';
import logo from 'assets/images/brand/logo.png';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.common.company_profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		financialReportActions: bindActionCreators(
			FinancialReportActions,
			dispatch,
		),
	};
};

class CashFlowStatement extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dropdownOpen: false,
			view: false,
			initValue: {
				startDate: moment().startOf('month').format('DD/MM/YYYY'),
				endDate: moment().endOf('month').format('DD/MM/YYYY'),
				reportBasis: 'ACCRUAL',
				chartOfAccountId: '',
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
			data: {
				transactionCategoryMapper: {
					'Capital Asset Depreciation Brought Forward': 'Credit',
					Sales: 'Credit',
					'Capital Asset Brought Forward': 'Debit',
					'Accommodation and Meals': 'Debit',
					'Accountancy Fees': 'Debit',
					'Retained Earnings': 'Credit',
					'Input VAT': 'Debit',
					'SBI-Adil khan': 'Debit',
					'SBI-Imran khan': 'Debit',
					'Accounts Payable': 'Credit',
				},
				assets: {
					'Input VAT': 0.0,
				},
				fixedAsset: {
					'Capital Asset Depreciation Brought Forward': 1200.0,
					'Capital Asset Brought Forward': 1100.0,
				},
				liabilities: {},
				equities: {},
				income: {
					Sales: 1200.0,
				},
				expense: {
					'Accommodation and Meals': 5200.0,
					'Accountancy Fees': 3400.0,
				},
				accountReceivable: {},
				accountpayable: {
					'Accounts Payable': 2300.0,
				},
				bank: {
					'SBI-Adil khan': 2400.0,
					'SBI-Imran khan': 400.0,
				},
				totalCreditAmount: 5300.0,
				totalDebitAmount: 12500.0,
			},
		};
		this.columnHeader = [
			{ label: 'Account', value: 'Account', sort: true },
			{ label: 'Net Debit', value: 'Net Debit', sort: false },
			{ label: 'Net Credit', value: 'Net Credit', sort: false },
		];
	}

	generateReport = (value) => {
		this.setState(
			{
				initValue: {
					startDate: moment(value.startDate).format('DD/MM/YYYY'),
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
	};

	initializeData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
		};
		this.props.financialReportActions
			.getTrialBalanceReport(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						data: res.data,
						loading: false,
					});
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
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
		const { profile, universal_currency_list,company_profile } = this.props;
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
							<CardHeader>
								<Row>
									<Col lg={12}>
										<div
											className="h4 mb-0 d-flex align-items-center"
											style={{ justifyContent: 'space-between' }}
										>
											<div>
												<p
													className="mb-0"
													style={{
														cursor: 'pointer',
														fontSize: '1rem',
														paddingLeft: '15px',
													}}
													onClick={this.viewFilter}
												>
													<i className="fa fa-cog mr-2"></i>Customize Report
												</p>
											</div>
											<div className="d-flex">
												<div
													className="mr-2 print-btn-cont"
													onClick={() => window.print()}
													style={{
														cursor: 'pointer',
														}}
												>
													<i className="fa fa-print"></i>
												</div>
												<div
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.exportPDFWithComponent();
												}}
												style={{
													cursor: 'pointer',
													}}
												>
												<i className="fa fa-file-pdf-o"></i>
											</div>
												{/* <Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
													<DropdownToggle caret>Export As</DropdownToggle>
													<DropdownMenu>
														<DropdownItem onClick={this.exportPDFWithComponent}>
															Pdf
														</DropdownItem>
														<DropdownItem>
															<CSVLink
																data={csvData}
																className="csv-btn"
																filename={'trialBalance.csv'}
															>
																CSV (Comma Separated Value)
															</CSVLink>
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'trialBalance', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(
																	csvData,
																	'trialBalance',
																	'xlsx',
																);
															}}
														>
															XLSX (Microsoft Excel)
														</DropdownItem>
													</DropdownMenu>
												</Dropdown> */}
											</div>
										</div>
									</Col>
								</Row>
							</CardHeader>
							<div className={`panel ${view ? 'view-panel' : ''}`}>
								<FilterComponent
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
								/>{' '}
							</div>
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
										
											<b style ={{ fontSize: '18px'}}>Trial Balance Report</b>
											<br/>
											As on {initValue.endDate}
											
									</div>
									<div>
									</div>									
							</div>
									{loading ? (
										<Loader />
									) : (
										<div className="table-wrapper">
											<Table responsive className="table-bordered">
												<thead className="thead-dark ">
													<tr className="header-row">
														{this.columnHeader.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600' }}
																	className={column.align ? 'text-right' : ''}
																	className="table-header-color"
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{Object.keys(this.state.data).length > 0 ? (
														<>
															<tr>
																<td className="mainLable ">Assets</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['assets']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['assets'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['assets'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">Fixed Assets</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['fixedAsset']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['fixedAsset'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['fixedAsset'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">Bank </td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['bank']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['bank'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['bank'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">Liabilities</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['liabilities']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['liabilities'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['liabilities'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">Equities</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['equities']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['equities'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['equities'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">Income</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['income']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['income'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['income'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">Expense</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(this.state.data['expense']).map(
																(item) => (
																	<tr>
																		<td className="pt-0 pb-0">{item}</td>
																		<td className="pt-0 pb-0 text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Debit' ? (
																				<Currency
																					value={this.state.data['expense'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																		<td className="text-right">
																			{this.state.data[
																				'transactionCategoryMapper'
																			][`${item}`] === 'Credit' ? (
																				<Currency
																					value={this.state.data['expense'][
																						`${item}`
																					].toFixed(2)}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				''
																			)}
																		</td>
																	</tr>
																),
															)}
															<tr>
																<td className="mainLable ">
																	Account Receivable
																</td>
																<td className="text-right">
																	{this.state.data['transactionCategoryMapper'][
																		'Accounts Receivable'
																	] === 'Debit' ? (
																		<Currency
																			value={this.state.data[
																				'accountReceivable'
																			]['Accounts Receivable'].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		''
																	)}
																</td>
																<td className="text-right">
																	{this.state.data['transactionCategoryMapper'][
																		'Accounts Receivable'
																	] === 'Credit' ? (
																		<Currency
																			value={this.state.data[
																				'accountReceivable'
																			]['Accounts Receivable'].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		''
																	)}
																</td>
															</tr>
															<tr>
																<td className="mainLable ">Account Payable</td>
																<td className="text-right">
																	{' '}
																	{this.state.data['transactionCategoryMapper'][
																		'Accounts Payable'
																	] === 'Debit' ? (
																		<Currency
																			value={this.state.data['accountpayable'][
																				'Accounts Payable'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		''
																	)}
																</td>
																<td className="text-right">
																	{this.state.data['transactionCategoryMapper'][
																		'Accounts Payable'
																	] === 'Credit' ? (
																		<Currency
																			value={this.state.data['accountpayable'][
																				'Accounts Payable'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		''
																	)}
																</td>
															</tr>
															<tr>
																<td className="mainLable text-right ">Total</td>
																<td className="text-right">
																	<Currency
																		value={this.state.data['totalDebitAmount']}
																		currencySymbol={
																			universal_currency_list[0]
																				? universal_currency_list[0]
																						.currencyIsoCode
																				: 'USD'
																		}
																	/>
																</td>
																<td className="text-right">
																	<Currency
																		value={this.state.data['totalCreditAmount']}
																		currencySymbol={
																			universal_currency_list[0]
																				? universal_currency_list[0]
																						.currencyIsoCode
																				: 'USD'
																		}
																	/>
																</td>
															</tr>
														</>
													) : (
														<tr className="mainLable ">
															<td style={{ textAlign: 'center' }} colSpan="9">
																There is no data to display
															</td>
														</tr>
													)}
												</tbody>
											</Table>
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

export default connect(mapStateToProps, mapDispatchToProps)(CashFlowStatement);
