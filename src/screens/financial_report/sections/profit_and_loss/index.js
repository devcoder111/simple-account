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

import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';
import { Loader, Currency } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent from '../filterComponent';
import FilterComponent2 from '../filterComponet2';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
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

class ProfitAndLossReport extends React.Component {
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
				totalOperatingIncome: 0.0,
				totalCostOfGoodsSold: 0.0,
				grossProfit: 0.0,
				totalOperatingExpense: 0.0,
				operatingProfit: 0.0,
				totalNonOperatingIncome: 0.0,
				totalNonOperatingExpense: 0.0,
				nonOperatingIncome: {},
				nonOperatingExpense: {},
				nonOperatingIncomeExpense: 0.0,
				netProfitLoss: 0.0,
				operatingIncome: {},
				nonOperatingIncome: {},
				costOfGoodsSold: {},
				operatingExpense: {},
				nonOperatingExpense: {},
			},
		};
		this.columnHeader = [
			{ label: 'Account', value: 'Account', sort: true },
			{ label: '', value: 'Account Code', sort: false },
			{ label: 'Total', value: 'Total', sort: true },
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
			.getProfitAndLossReport(postData)
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
																filename={'profitloss.csv'}
															>
																CSV (Comma Separated Value)
															</CSVLink>
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'profitloss', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'profitloss', 'xlsx');
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
								<FilterComponent2
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
											<br style={{ marginBottom: '5px' }} />
											<b style ={{ fontSize: '18px'}}>Profit And Loss</b>
											<br style={{ marginBottom: '5px' }} />
											From {initValue.startDate} To {initValue.endDate}
											
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
																	className={column.align ? 'text-right' : '' }
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
																<td className="mainLable ">Operating Income</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(
																this.state.data['operatingIncome'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0"></td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data['operatingIncome'][
																				`${item}`
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td className="mainLable ">
																	Total Operating Income
																</td>
																<td></td>
																<td className="text-right">
																	{this.state.data['totalOperatingIncome'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalOperatingIncome'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td className="mainLable ">
																	Cost of Goods Sold
																</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(
																this.state.data['costOfGoodsSold'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0"></td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data['costOfGoodsSold'][
																				`${item}`
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td className="mainLable ">
																	Total Cost of Goods Sold
																</td>
																<td></td>
																<td className="text-right">
																	{this.state.data['totalCostOfGoodsSold'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalCostOfGoodsSold'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td></td>
																<td className="mainLable ">Gross Profit</td>
																<td className="text-right">
																	{this.state.data['grossProfit'] != null ? (
																		<Currency
																			value={this.state.data[
																				'grossProfit'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td className="mainLable ">Operating Expense</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(
																this.state.data['operatingExpense'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0"></td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data[
																				'operatingExpense'
																			][`${item}`].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td className="mainLable ">
																	Total Operating Expense
																</td>
																<td></td>
																<td className="text-right">
																	{this.state.data['totalOperatingExpense'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalOperatingExpense'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td></td>
																<td className="mainLable ">Operating Profit </td>
																<td className="text-right">
																	{this.state.data['operatingProfit'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'operatingProfit'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td className="mainLable ">
																	Non Operating Income
																</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(
																this.state.data['nonOperatingIncome'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0"></td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data[
																				'nonOperatingIncome'
																			][`${item}`].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td className="mainLable ">
																	Total Non Operating Income
																</td>
																<td></td>
																<td className="text-right">
																	{this.state.data['totalNonOperatingIncome'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalNonOperatingIncome'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td className="mainLable ">
																	Non Operating Expense
																</td>
																<td></td>
																<td></td>
															</tr>
															{Object.keys(
																this.state.data['nonOperatingExpense'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0"></td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data[
																				'nonOperatingExpense'
																			][`${item}`].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td className="mainLable ">
																	Total Non Operating Expense
																</td>
																<td></td>
																<td className="text-right">
																	{this.state.data[
																		'totalNonOperatingExpense'
																	] != null ? (
																		<Currency
																			value={this.state.data[
																				'totalNonOperatingExpense'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
																</td>
															</tr>
															<tr>
																<td></td>
																<td className="mainLable ">Net Profit/Loss </td>
																<td className="text-right">
																	{this.state.data['netProfitLoss'] != null ? (
																		<Currency
																			value={this.state.data[
																				'netProfitLoss'
																			].toFixed(2)}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		'0.0'
																	)}
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

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ProfitAndLossReport);
