import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	selectCurrencyFactory,
} from 'utils';
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
import _ from 'lodash';
import { Loader } from 'components';

import { AuthActions,CommonActions } from 'services/global';

import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

import * as CreateCurrencyConvertActions from './actions';
import * as CurrencyConvertActions from '../../actions';

import { Formik } from 'formik';


const mapStateToProps = (state) => {
	return {
		
		currency_list: state.common.currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		createCurrencyConvertActions: bindActionCreators(CreateCurrencyConvertActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
	}
};

class CreateCurrencyConvert extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {
				currencyCode: '',
				exchangeRate:'',
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
		this.getCompanyCurrency();
	};

	getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
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
	// Save Updated Field's Value to State	
	handleChange = (e, name) => {
		this.setState({
			vatData: _.set(
				{ ...this.state.vatData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};

	// Show Success Toast
	// success() {
	//   toast.success('Product Category Created successfully... ', {
	//     position: toast.POSITION.TOP_RIGHT
	//   })
	// }

	// Create or Edit Currency conversion
	handleSubmit = (data, resetForm) => {
		this.props.createCurrencyConvertActions
			.createCurrencyConvert(data)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'New Currency Conversion is Created Successfully!',
					);

					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.setState({
							createMore: false,
						});
					} else {
						this.props.history.push('/admin/master/CurrencyConvert');
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
			
	};

	render() {
		const { loading, initValue} = this.state;
		
		const{currencyList,currency_list} =this.props;
		return (
			<div className="vat-code-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase" />
										<span className="ml-2">New Currency Conversion</span>
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
													if (!values.exchangeRate) {
														errors.exchangeRate =
															'Exchange Rate is  required';
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
																	<Col lg={1}>
																	<FormGroup className="mt-2">
																	<Label>
																							Value
																						</Label>
																	<Input
																			disabled
																				id="1"
																				name="1"
																				value=	{
																					1 }
																				
																	/>
																	</FormGroup>
																	</Col>
																					<Col lg={4}>
																						<FormGroup className="mt-2">
																						<Label htmlFor="exchangecurrencyCode">
																							Exchange Currency
																						</Label>
																						<Select
																							options={
																								currency_list
																									? selectCurrencyFactory.renderOptions(
																											'currencyName',
																											'currencyCode',
																											currency_list,
																											'Currency',
																									  )
																									: []
																							}
																							value={
																								currency_list &&
																								selectCurrencyFactory
																									.renderOptions(
																										'currencyName',
																										'currencyCode',
																										currency_list,
																										'Currency',
																									)
																									.find(
																										(option) =>
																											option.value ===
																											+props.values
																												.currencyCode,
																									)
																							}
																							onChange={(options) => {
																								if (options && options.value) {
																									props.handleChange(
																										'currencyCode',
																									)(options.value);
																								} else {
																									props.handleChange(
																										'currencyCode',
																									)('');
																								}
																							}}
																							placeholder="Select Currency"
																							id="currencyCode"
																							name="currencyCode"
																							className={
																								props.errors.currencyCode &&
																								props.touched.currencyCode
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.currencyCode &&
																							props.touched.currencyCode && (
																								<div className="invalid-feedback">
																									{props.errors.currencyCode}
																								</div>
																							)}
																			</FormGroup>
																				</Col>
																				<FormGroup className="mt-5"><label><b>=</b></label>	</FormGroup>
																	<Col lg={3}>
																	<FormGroup className="mt-2">
																	<Label htmlFor="Exchange rate">
																	Exchange rate
																	{/* <i
																		id="ProductcatcodeTooltip"
																		className="fa fa-question-circle ml-1"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="ProductcatcodeTooltip"
																	>
																		Product Category Code - Unique identifier code of the product 
																	</UncontrolledTooltip> */}
																	</Label>
																	<Input
																	type="number" maxLength='20'
																	id="exchangeRate"
																	name="exchangeRate"
																	placeholder="Enter Exchange Rate"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regDecimal.test(option.target.value)
																		) {
																			handleChange('exchangeRate')(
																				option,
																			);
																		}
																	}}
																	onBlur={handleBlur}
																	value={values.exchangeRate}
																	className={
																		errors.exchangeRate &&
																		touched.exchangeRate
																			? 'is-invalid'
																			: ''
																	}
																	/>
															
																	{errors.exchangeRate &&
																	touched.exchangeRate && (
																		<div className="invalid-feedback">
																			{errors.exchangeRate}
																		</div>
																	)}
																	</FormGroup >
																	</Col>
																	<Col lg={3}>
																		<FormGroup className="mt-2">
																		<Label htmlFor="currencyName">
																			Base Currency 
																		</Label>
																		<Input
																		disabled
																				type="text"
																				id="currencyName"
																				name="currencyName"
																				value=	{
																					this.state.basecurrency.currencyName }
																			/>
																		</FormGroup>
																			</Col>
															</Row>
														
																<FormGroup className="text-right mt-5">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																>
																	<i className="fa fa-dot-circle-o"></i> Create
																</Button>

																<Button
																	name="button"
																	color="primary"
																	className="btn-square mr-3"
																	onClick={() => {
																		this.setState({ createMore: true }, () => {
																			props.handleSubmit();
																		});
																	}}
																>
																	<i className="fa fa-refresh"></i> Create and
																	More
																</Button>

																<Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/master/CurrencyConvert',
																		);
																	}}
																>
																	<i className="fa fa-ban"></i> Cancel
																</Button>
																</FormGroup>
																</form>
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
)(CreateCurrencyConvert);
