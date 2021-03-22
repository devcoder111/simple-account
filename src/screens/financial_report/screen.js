import React from 'react';
import { connect } from 'react-redux';
import {
	Card,
	CardHeader,
	CardBody,
	Row,
	Col,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
} from 'reactstrap';

import { ProfitAndLoss, BalanceSheet, CashFlowStatement } from './sections';
import {VatReturnsReport} from './sections';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import './style.scss';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {};
};

class FinancialReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: new Array(4).fill('3'),
		};
	}

	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		console.log(tab);
		this.setState({
			activeTab: newArray,
		});
	};

	render() {
		return (
			<div className="financial-report-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-usd" />
										<span className="ml-2">Financial Report</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Nav tabs>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '1'}
										onClick={() => {
											this.toggle(0, '1');
										}}
									>
										Profit and Loss
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '2'}
										onClick={() => {
											this.toggle(0, '2');
										}}
									>
										Balance Sheet
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '3'}
										onClick={() => {
											this.toggle(0, '3');
										}}
									>
										Trial Balance
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '4'}
										onClick={() => {
											this.toggle(0, '4');
										}}
									>
										Vat Returns Report
									</NavLink>
								</NavItem>
							</Nav>
							<TabContent activeTab={this.state.activeTab[0]}>
								<TabPane tabId="1">
									<div className="table-wrapper">
										<ProfitAndLoss />
									</div>
								</TabPane>
								<TabPane tabId="2">
									<div className="table-wrapper">
										<BalanceSheet />
									</div>
								</TabPane>
								<TabPane tabId="3">
									<div className="table-wrapper">
										<CashFlowStatement />
									</div>
								</TabPane>
								<TabPane tabId="4">
									<div className="table-wrapper">
										<VatReturnsReport />
									</div>
								</TabPane>
							</TabContent>
							{/* <Card className="report-card">
								<CardHeader>High Level</CardHeader>
								<CardBody>
									<Row xs="4">
										<Col  className="report-section">
											<h5><a href="#">Profit & Loss</a></h5>
											<p>Your business's income less its day-to-day running costs over a given period of time. You can also compare profit & loss reports.</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Balance Sheet</a></h5>
											<p>What your business owns and owes as at a given point in time.</p>
										</Col>
									
									</Row>
								</CardBody>
							</Card> */}
							{/* <Card className="report-card">
								<CardHeader>Breakdown</CardHeader>
								<CardBody>
									<Row>
										<Col className="report-section">
											<h5><a href="#">Aged Debtors</a></h5>
											<p>Shows you customers who owe you money and how long that money has been outstanding for.</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Aged Creditors</a></h5>
											<p>Shows you supplier bills that you've yet to pay and how long those suppliers have been waiting for payment.</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Capital Assets</a></h5>
											<p>A list of the capital assets owned by your business and how they depreciate over time.</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Customer Sales</a></h5>
											<p>A breakdown of your sales by customer over different time periods.</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Spending Categories</a></h5>
											<p>A breakdown of your expenditure by category over time.</p>
										</Col>
										
									</Row>
								</CardBody>
							</Card> */}
							{/* <Card className="report-card">
								<CardHeader>Detailed</CardHeader>
								<CardBody>
									<Row>
										<Col className="report-section">
											<h5><a href="#">Show Transactions</a></h5>
											<p>A breakdown of what's in all or any of your FreeAgent categories.</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Trial Balance</a></h5>
											<p>A list of the total amounts in all of your FreeAgent categories at a given point in time. You can also export this report</p>
										</Col>
										<Col className="report-section">
											<h5><a href="#">Audit Trail</a></h5>
											<p>A record of the changes that have been made to your FreeAgent data, including who made them and when they were made.</p>
										</Col>
										<Col></Col>									
										<Col></Col>									
									</Row>
								</CardBody>
							</Card> */}
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(FinancialReport);
