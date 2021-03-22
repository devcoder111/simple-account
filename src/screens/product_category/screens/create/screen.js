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
	UncontrolledTooltip,
} from 'reactstrap';
import _ from 'lodash';
import { Loader } from 'components';

import * as Yup from 'yup';
import { CommonActions } from 'services/global';

import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

import * as CreateProductCategoryActions from './actions';
import * as ProductCategoryActions from '../../actions';

import { Formik } from 'formik';

const mapStateToProps = (state) => {
	return {
		product_category_list: state.product_category.product_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		createProductCategoryActions: bindActionCreators(
			CreateProductCategoryActions,
			dispatch,
		),
		productCategoryActions: bindActionCreators(
			ProductCategoryActions,
			dispatch,
		),
	};
};

class CreateProductCategory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {
				productCategoryCode: '',
				productCategoryName: '',
			},

			loading: false,
			createMore: false,
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
	}

	componentDidMount = () => {
		this.props.productCategoryActions.getProductCategoryList().then((res) => {
			if (res.status === 200) {
				this.setState({
					product_category_list: res.data.data,
				});
			}
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

	// Create or Edit Vat
	handleSubmit = (data, resetForm) => {
		this.props.createProductCategoryActions
			.createProductCategory(data)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'New Product Category is Created Successfully!',
					);

					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.setState({
							createMore: false,
						});
					} else {
						this.props.history.push('/admin/master/product-category');
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
		const { loading, initValue, product_category_list } = this.state;
		if (product_category_list) {
			var ProductCategoryList = product_category_list.map((item) => {
				return item.productCategoryCode;
			});
		}
		return (
			<div className="vat-code-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase" />
										<span className="ml-2">New Product Category</span>
									</div>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={6}>
											<Formik
												initialValues={initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (!values.productCategoryName) {
														errors.productCategoryName =
															'Product Category Name is  required';
													}

													if (
														product_category_list &&
														ProductCategoryList.includes(
															values.productCategoryCode,
														)
													) {
														errors.productCategoryCode =
															'Product Category Code already Exists';
													}

													if (!values.productCategoryCode) {
														errors.productCategoryCode =
															'Product Category Code is Required';
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
															<FormGroup>
																<Label htmlFor="productCategoryCode">
																	<span className="text-danger">*</span>Product
																	Category Code
																	<i
																		id="ProductcatcodeTooltip"
																		className="fa fa-question-circle ml-1"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="ProductcatcodeTooltip"
																	>
																		Product Category Code - Unique identifier code of the product 
																	</UncontrolledTooltip>
																</Label>
																<Input
																	type="text" maxLength='20'
																	id="productCategoryCode"
																	name="productCategoryCode"
																	placeholder="Enter Product Category Code"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExBoth.test(option.target.value)
																		) {
																			handleChange('productCategoryCode')(
																				option,
																			);
																		}
																	}}
																	onBlur={handleBlur}
																	value={values.productCategoryCode}
																	className={
																		errors.productCategoryCode &&
																		touched.productCategoryCode
																			? 'is-invalid'
																			: ''
																	}
																/>
																{errors.productCategoryCode &&
																	touched.productCategoryCode && (
																		<div className="invalid-feedback">
																			{errors.productCategoryCode}
																		</div>
																	)}
															</FormGroup>
															<FormGroup>
																<Label htmlFor="name">
																	<span className="text-danger">*</span>Product
																	Category Name
																</Label>
																<Input
																	type="text" maxLength='50'
																	id="productCategoryName"
																	name="productCategoryName"
																	placeholder="Enter Product Category Name"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExAlpha.test(option.target.value)
																		) {
																			handleChange('productCategoryName')(
																				option,
																			);
																		}
																	}}
																	onBlur={handleBlur}
																	value={values.productCategoryName}
																	className={
																		errors.productCategoryName &&
																		touched.productCategoryName
																			? 'is-invalid'
																			: ''
																	}
																/>
																{errors.productCategoryName &&
																	touched.productCategoryName && (
																		<div className="invalid-feedback">
																			{errors.productCategoryName}
																		</div>
																	)}
															</FormGroup>
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
																			'/admin/master/product-category',
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
)(CreateProductCategory);
