import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';

import * as ExpenseDetailsAction from '../detail/actions';
import * as ExpenseActions from '../../actions';
import ReactToPrint from 'react-to-print';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';

import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';

import './style.scss';
import { ExpenseTemplate } from './sections/';

const mapStateToProps = (state) => {
	return {
		expense_detail: state.expense.expense_detail,
		profile: state.auth.profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		expenseActions: bindActionCreators(
			ExpenseActions,
			dispatch,
		),
		expenseDetailsAction: bindActionCreators(
			ExpenseDetailsAction,
			dispatch,
		),
		
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ViewExpense extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expenseData: {},
			id: '',
		};

		this.formRef = React.createRef();
		this.termList = [
			{ label: 'Net 7', value: 'NET_7' },
			{ label: 'Net 10', value: 'NET_10' },
			{ label: 'Net 30', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.expenseId) {
			console.log(this.props.location.state.expenseId)
			this.props.expenseDetailsAction
				.getExpenseDetail(this.props.location.state.expenseId)
				.then((res) => {
					let val = 0;
					if (res.status === 200) {
						
						
						this.setState(
							{
								expenseData: res.data,								
								expenseId: this.props.location.state.expenseId,
							},
						);
					}
				});
		}
	};

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		const { expenseData, currencyData, id } = this.state;
		const { profile } = this.props;
		return (
			<div className="view-expense-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<div className="action-btn-container">
						
								<Button
									className="btn btn-sm pdf-btn"
									onClick={() => {
										this.exportPDFWithComponent();
									}}
								>
									<i className="fa fa-file-pdf-o"></i>
								</Button>
								<ReactToPrint
									trigger={() => (
										<Button
											type="button"
											className="btn btn-sm print-btn"
											onClick={() => window.print()}
										>
											<i className="fa fa-print"></i>
										</Button>
									)}
									content={() => this.componentRef}
								/>

								<p
									className="close"
									onClick={() => {
										this.props.history.push('/admin/expense');
									}}
								>
									X
								</p>
							</div>
							<div>
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
								>
									<ExpenseTemplate
										expenseData={expenseData}
										ref={(el) => (this.componentRef = el)}								
									/>
								</PDFExport>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewExpense);
