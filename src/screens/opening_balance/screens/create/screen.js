import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Input,
	FormGroup,
	Label,
	Row,
	Col,
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import { Loader } from 'components';

import { AuthActions,CommonActions } from 'services/global';
import * as OpeningBalanceActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';

import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

import * as CreateOpeningBalancesActions from './actions';
import { selectOptionsFactory } from 'utils';

import { Formik } from 'formik';


const mapStateToProps = (state) => {
	return {
		
		currency_list: state.common.currency_list,
		transaction_category_list: state.opening_balance.transaction_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch),
		createOpeningBalancesActions: bindActionCreators(CreateOpeningBalancesActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
	}
};

class CreateOpeningBalance extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {
				effectiveDate : new Date(),
				openingBalance : '',
				transactionCategoryId : '',
			},
			data: '',
			basecurrency:[],
			loading: false,
			createMore: false,
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.formRef = React.createRef();

		
	}
	

	componentDidMount = () => {
		this.props.authActions.getCurrencylist() ;
		//this.getCompanyCurrency();
	
		this.initializeData();
	};
	
	initializeData = () => {
		this.props.openingBalanceActions.getTransactionCategoryList();
		
	}

	// Create  Currency conversion
	handleSubmit = (data,resetForm) =>{
		const postData = {
			openingBalance: data.openingBalance,
			transactionCategoryId: data.transactionCategoryId.value,
			effectiveDate:data.effectiveDate,
		};
			this.props.createOpeningBalancesActions
				.addOpeningBalance(postData)
				.then((res) => {
					this.setState({ disabled: false });
					if (res.status === 200) {
						resetForm(this.state.initValue);
						this.props.commonActions.tostifyAlert(
							'success',
							'New Opening balance Created Successfully.',
						);
						if (this.state.createMore) {
							this.setState({
								createMore: false,
							});
						} else {
							this.props.history.push('/admin/accountant/opening-balance');
						}
					}
				})
				.catch((err) => {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		
	};

	render() {
		const { loading, initValue} = this.state;
		
		const{transaction_category_list} =this.props;
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
			<div className="vat-code-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase mr-1" />
										<span>New Opening Balance</span>
									</div>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={10}>
											<Formik
												initialValues={initValue}
												ref={this.formRef}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (!values.transactionCategoryId) {
														errors.transactionCategoryId =
															'Transaction Category is  required';
													}
													if (!values.effectiveDate) {
														errors.effectiveDate =
															'Date is  required';
													}
													if (!values.openingBalance) {
														errors.openingBalance =
															'Amount is  required';
													}
													return errors;
												}}
											>
												{(props) => {
													const {
														values,
														touched,
														errors,
														handleChange,
														handleSubmit,
														handleBlur,
													} = props;
													return (
														<form onSubmit={handleSubmit}>
																<Row>
																<Col lg={4}>
																<FormGroup className="mb-3">
																<Label htmlFor="transactionCategoryBalanceId">
																<span className="text-danger">*</span>
																	Transaction Category
																</Label>
																		<Select
																		styles={customStyles}
																		id="transactionCategoryId"
																		name="transactionCategoryId"
																		placeholder="Select Transaction Category"
																		options={
																			transaction_category_list
																				? selectOptionsFactory.renderOptions(
																								'transactionCategoryName',
																								'transactionCategoryId',
																								transaction_category_list,
																									'Chart of Account',
																											  )
																									: []
																						}
																		value={props.values.transactionCategoryId}
																		className={
																			props.errors.transactionCategoryId &&
																			props.touched.transactionCategoryId
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>
																			props.handleChange('transactionCategoryId')(
																				option,
																			)
																		}
																	/>
																	{props.errors.transactionCategoryId &&
																		props.touched.transactionCategoryId && (
																			<div className="invalid-feedback">
																				{props.errors.transactionCategoryId}
																			</div>
																		)}
																			</FormGroup>
																				</Col>
															
																<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="effectiveDate">
																		<span className="text-danger">*</span>
																		Opening Date
																	</Label>
																	<DatePicker
																		id="date"
																		name="effectiveDate"
																		className={`form-control ${
																			props.errors.effectiveDate &&
																			props.touched.effectiveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText="Effective date"
																		selected={props.values.effectiveDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd/MM/yyyy"
																		maxDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('effectiveDate')(value);
																		}}
																	/>
																	{props.errors.effectiveDate &&
																		props.touched.effectiveDate && (
																			<div className="invalid-feedback">
																				{props.errors.effectiveDate}
																			</div>
																		)}
																</FormGroup>
															</Col>

																
															</Row>
															<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="openingBalance">
																		<span className="text-danger">*</span>Amount
																	</Label>
																	<Input
																		type="number"
																		maxLength="10"
																		name="openingBalance"
																		id="openingBalance"
																		rows="5"
																		className={
																			props.errors.openingBalance &&
																			props.touched.openingBalance
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regDecimal.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('openingBalance')(
																					option,
																				);
																			}
																		}}
																		value={props.values.openingBalance}
																		placeholder="Amount"
																	/>
																	{props.errors.openingBalance &&
																		props.touched.openingBalance && (
																			<div className="invalid-feedback">
																				{props.errors.openingBalance}
																			</div>
																		)}
																</FormGroup>
															</Col>
															</Row>
														<Row>
																<FormGroup className="text-right ml-3 mt-5">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																>
																	<i className="fa fa-dot-circle-o"></i> Create
																</Button>

																<Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/accountant/opening-balance',
																		);
																	}}
																>
																	<i className="fa fa-ban"></i> Cancel
																</Button>
																</FormGroup>
																</Row></form>
													);
												}}
											</Formik>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
					{loading ? <Loader></Loader> : ''}
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateOpeningBalance);
