import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Input,
	Form,
	FormGroup,
	Label,
	Row,
	Col,
} from 'reactstrap';
import { Loader } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import { CommonActions } from 'services/global';

import * as ChartOfAccontActions from '../../actions';
import * as CreateChartOfAccontActions from './actions';

import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';

const mapStateToProps = (state) => {
	return {
		sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		ChartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
		createChartOfAccontActions: bindActionCreators(
			CreateChartOfAccontActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
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
class CreateChartAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {
				// transactionCategoryCode: '',
				transactionCategoryName: '',
				chartOfAccount: '',
			},
			loading: false,
			createMore: false,
			chartOfAccountCategory: [],
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.ChartOfAccontActions.getSubTransactionTypes().then((res) => {
			if (res.status === 200) {
				let val = Object.assign({}, res.data);
				let temp = [];
				Object.keys(val).map((item) => {
					temp.push({
						label: item,
						options: val[`${item}`],
					});
					return item;
				});
				this.setState({
					chartOfAccountCategory: temp,
				});
			}
		});
	};
	// Show Success Toast
	// success() {
	//   toast.success('Chart Of Account Created Successfully... ', {
	//     position: toast.POSITION.TOP_RIGHT
	//   })
	// }

	// Create or Edit Vat
	handleSubmit = (data, resetForm) => {
		const postData = {
			transactionCategoryName: data.transactionCategoryName,
			chartOfAccount: data.chartOfAccount.value,
		};
		this.props.createChartOfAccontActions
			.createTransactionCategory(postData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'New Chart of Account Created Successfully',
					);
					if (this.state.createMore) {
						this.setState({
							createMore: false,
						});
						resetForm();
					} else {
						this.props.history.push('/admin/master/chart-account');
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

	renderOptions = (options) => {
		return options.map((option) => {
			return (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			);
		});
	};

	render() {
		const { loading } = this.state;
		// const { sub_transaction_type_list } = this.props
		return (
			<div className="chart-account-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-area-chart" />
										<span className="ml-2">New Chart Account</span>
									</div>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={6}>
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validationSchema={Yup.object().shape({
													// transactionCategoryCode: Yup.string()
													//   .required("Code Name is Required"),
													transactionCategoryName: Yup.string()
														.required('Name is Required')
														.min(2, 'Name Is Too Short!')
														.max(40, 'Name Is Too Long!'),
													chartOfAccount: Yup.string().required(
														'Type is Required',
													),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit} name="simpleForm">
														{/* <FormGroup>
                              <Label htmlFor="transactionCategoryCode">Code</Label>
                              <Input
                                type="text"
                                id="transactionCategoryCode"
                                name="transactionCategoryCode"
                                placeholder="Enter Code"
                                onChange={(val) => { props.handleChange('transactionCategoryCode')(val) }}
                                value={props.values.transactionCategoryCode}
                                className={
                                  props.errors.transactionCategoryCode && props.touched.transactionCategoryCode
                                    ? "is-invalid"
                                    : ""
                                }
                              />
                              {props.errors.transactionCategoryCode && props.touched.transactionCategoryCode && (
                                <div className="invalid-feedback">{props.errors.transactionCategoryCode}</div>
                              )}
                            </FormGroup> */}
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">*</span>Name
															</Label>
															<Input
																type="text" maxLength='50'
																id="transactionCategoryName"
																name="transactionCategoryName"
																placeholder="Enter Name"
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.regExAlpha.test(option.target.value)
																	) {
																		props.handleChange(
																			'transactionCategoryName',
																		)(option);
																	}
																}}
																value={props.values.transactionCategoryName}
																className={
																	props.errors.transactionCategoryName &&
																	props.touched.transactionCategoryName
																		? 'is-invalid'
																		: ''
																}
															/>
															{props.errors.transactionCategoryName &&
																props.touched.transactionCategoryName && (
																	<div className="invalid-feedback">
																		{props.errors.transactionCategoryName}
																	</div>
																)}
														</FormGroup>
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">*</span>Type
															</Label>
															{/* <Select
                                className="select-default-width"
                                options={transaction_type_list ? selectOptionsFactory.renderOptions('chartOfAccountName', 'chartOfAccountId', transaction_type_list,'Type') : ''}
                                value={props.values.chartOfAccount}
                                onChange={(option) => {
                                  if(option && option.value) {
                                    props.handleChange('chartOfAccount')(option.value)
                                  } else {
                                    props.handleChange('chartOfAccount')('')
                                  }
                                }}
                                placeholder="Select Type"
                                id="chartOfAccount"
                                name="chartOfAccount"
                                className={
                                  props.errors.chartOfAccount && props.touched.chartOfAccount
                                    ? "is-invalid"
                                    : ""
                                }
                              />
                              {props.errors.chartOfAccount && props.touched.chartOfAccount && (
                                <div className="invalid-feedback">{props.errors.chartOfAccount}</div>
                              )} */}
															<Select
															styles={customStyles}
																id="chartOfAccount"
																name="chartOfAccount"
																placeholder='Select type'
																value={props.values.chartOfAccount}
																// size="1"
																onChange={(val) => {
																	props.handleChange('chartOfAccount')(val);
																}}
																options={this.state.chartOfAccountCategory}
																className={`
                                 ${
																		props.errors.chartOfAccount &&
																		props.touched.chartOfAccount
																			? 'is-invalid'
																			: ''
																	}`}
															/>
															{props.errors.chartOfAccount &&
																props.touched.chartOfAccount && (
																	<div className="invalid-feedback">
																		{props.errors.chartOfAccount}
																	</div>
																)}
														</FormGroup>
														<FormGroup className="text-right mt-5">
															<Button
																type="button"
																name="submit"
																color="primary"
																className="btn-square mr-3"
																onClick={() => {
																	this.setState({ createMore: false });
																	props.handleSubmit();
																}}
															>
																<i className="fa fa-dot-circle-o"></i> Create
															</Button>
															<Button
																name="button"
																color="primary"
																className="btn-square mr-3"
																onClick={() => {
																	this.setState({ createMore: true });
																	props.handleSubmit();
																}}
															>
																<i className="fa fa-refresh"></i> Create and
																More
															</Button>
															<Button
																type="submit"
																color="secondary"
																className="btn-square"
																onClick={() => {
																	this.props.history.push(
																		'/admin/master/chart-account',
																	);
																}}
															>
																<i className="fa fa-ban"></i> Cancel
															</Button>
														</FormGroup>
													</Form>
												)}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateChartAccount);
