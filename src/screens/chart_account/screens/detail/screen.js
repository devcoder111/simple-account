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
import { toast } from 'react-toastify';
import _ from 'lodash';
import { Loader, ConfirmDeleteModal } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import * as ChartOfAccontActions from '../../actions';
import * as DetailChartOfAccontActions from './actions';
import Select from 'react-select';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { CommonActions } from 'services/global';

const mapStateToProps = (state) => {
	return {
		sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		chartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
		detailChartOfAccontActions: bindActionCreators(
			DetailChartOfAccontActions,
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

class DetailChartAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: null,
			loading: true,
			createMore: false,
			dialog: false,
			currentData: {},
			chartOfAccountCategory: [],
			coaId: '',
		};
		this.regExAlpha = /^[a-zA-Z]+$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		const id = this.props.location.state.id;
		if (this.props.location.state && id) {
			this.props.detailChartOfAccontActions
				.getTransactionCategoryById(id)
				.then((res) => {
					if (res.status === 200) {
						this.getSubTransactionTypes();
						this.setState({
							loading: false,
							coaId: res.data.transactionCategoryId,
							initValue: {
								// transactionCategoryCode: res.data.transactionCategoryCode,
								transactionCategoryName: res.data.transactionCategoryName,
								chartOfAccount: res.data.transactionTypeId
									? {
											label: res.data.transactionTypeName,
											value: res.data.transactionTypeId,
									  }
									: '',
							},
						});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.setState({ loading: false });
					// this.props.history.push('/admin/master/chart-account')
				});
		} else {
			// this.props.history.push('/admin/master/chart-account')
		}
	};

	getSubTransactionTypes = () => {
		this.props.chartOfAccontActions.getSubTransactionTypes().then((res) => {
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

	handleChange = (e, name) => {
		this.setState({
			currentData: _.set(
				{ ...this.state.currentData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};
	// Show Success Toast
	success = (msg) => {
		toast.success(msg, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	deleteChartAccount = () => {
		const { coaId } = this.state;
		this.props.chartOfAccontActions
			.getExplainedTransactionCountForTransactionCategory(coaId)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the chart of account',
					);
				} else {
					const message1 =
		<text>
		<b>Delete Chart of Account?</b>
		</text>
		const message ='This Chart of Account will be deleted permanently and cannot be recovered.';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={this.removeChartAccount}
								cancelHandler={this.removeDialog}
								message={message}
								message1={message1}
							/>
						),
					});
				}
			});
	};

	removeChartAccount = () => {
		const id = this.props.location.state.id;
		this.props.detailChartOfAccontActions
			.deleteChartAccount(id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Account Deleted Successfully',
					);
					this.props.history.push('/admin/master/chart-account');
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

	// Create or Edit Vat
	handleSubmit = (data, resetForm) => {
		const id = this.props.location.state.id;
		const postData = {
			transactionCategoryName: data.transactionCategoryName,
			chartOfAccount: data.chartOfAccount.value,
			transactionCategoryId: id,
		};
		this.props.detailChartOfAccontActions
			.updateTransactionCategory(postData)
			.then((res) => {
				if (res.status === 200) {
					resetForm();
					this.props.commonActions.tostifyAlert(
						'success',
						'Chart Account Updated Successfully',
					);
					this.props.history.push('/admin/master/chart-account');
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
		const { loading, dialog } = this.state;
		// const { sub_transaction_type_list } = this.props

		return (
			<div className="chart-account-screen">
				<div className="animated fadeIn">
					{dialog}
					{loading ? (
						<Loader></Loader>
					) : (
						<Row>
							<Col lg={12}>
								<Card>
									<CardHeader>
										<div className="h4 mb-0 d-flex align-items-center">
											<i className="nav-icon fas fa-area-chart" />
											<span className="ml-2">Update Chart Account</span>
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
														transactionCategoryName: Yup.string().required(
															'Account is Required',
														),
														chartOfAccount: Yup.string()
															.required('Type is Required')
															.nullable(),
													})}
												>
													{(props) => (
														<Form
															onSubmit={props.handleSubmit}
															name="simpleForm"
														>
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
																<Label htmlFor="transactionCategoryName">
																	<span className="text-danger">*</span>Name
																</Label>
																<Input
																	type="text"
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
																<Label htmlFor="chartOfAccount">
																	<span className="text-danger">*</span>Type
																</Label>
																{/* <Select
                                    className="select-default-width"
                                    options={sub_transaction_type_list ? selectOptionsFactory.renderOptions('chartOfAccountName', 'chartOfAccountId', sub_transaction_type_list,'Type') : []}
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
                                  /> */}
																<Select
																	styles={customStyles}
																	id="chartOfAccount"
																	name="chartOfAccount"
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

															<Row>
																<Col
																	lg={12}
																	className="d-flex align-items-center justify-content-between flex-wrap mt-5"
																>
																	<FormGroup>
																		<Button
																			type="button"
																			name="button"
																			color="danger"
																			className="btn-square"
																			onClick={this.deleteChartAccount}
																		>
																			<i className="fa fa-trash"></i> Delete
																		</Button>
																	</FormGroup>
																	<FormGroup className="text-right">
																		<Button
																			type="submit"
																			name="submit"
																			color="primary"
																			className="btn-square mr-3"
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			Update
																		</Button>
																		<Button
																			type="button"
																			name="button"
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
																</Col>
															</Row>
														</Form>
													)}
												</Formik>
											</Col>
										</Row>
									</CardBody>
								</Card>
							</Col>
						</Row>
					)}
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailChartAccount);
