import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import * as ProductActions from '../../product/actions';
import { Formik } from 'formik';
import * as Yup from 'yup';

import '../../product/screens/create/style.scss';
import { toast } from 'react-toastify';
import { selectOptionsFactory } from 'utils';

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

const mapDispatchToProps = (dispatch) => {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
	};
};

class ProductModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			openWarehouseModal: false,
			initValue: {
				productName: '',
				productDescription: '',
				productCode: '',
				vatCategoryId: '',
				productCategoryId: '',
				productWarehouseId: '',
				vatIncluded: false,
				productType: 'GOODS',
				salesUnitPrice: '',
				purchaseUnitPrice: '',
				productPriceType: ['SALES'],
				salesTransactionCategoryId: { value: 84, label: 'Sales' },
				purchaseTransactionCategoryId: {
					value: 49,
					label: 'Cost of Goods Sold',
				},

				salesDescription: '',
				purchaseDescription: '',
				productSalesPriceType: '',
				productPurchasePriceType: '',
				disabled: false,
			},
			purchaseCategory: [],
			salesCategory: [],
			createMore: false,
			exist: false,
		};
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9 ]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	getData = (data) => {
		let temp = {};
		for (let item in data) {
			if (typeof data[`${item}`] !== 'object') {
				temp[`${item}`] = data[`${item}`];
			} else {
				temp[`${item}`] = data[`${item}`].value;
			}
		}
		return temp;
	};

	// Create or Edit Product
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const productCode = data['productCode'];
		const salesUnitPrice = data['salesUnitPrice'];
		const salesTransactionCategoryId = data['salesTransactionCategoryId'];
		const salesDescription = data['salesDescription'];
		const purchaseDescription = data['purchaseDescription'];
		const purchaseTransactionCategoryId = data['purchaseTransactionCategoryId'];
		const purchaseUnitPrice = data['purchaseUnitPrice'];
		const vatCategoryId = data['vatCategoryId'];
		const vatIncluded = data['vatIncluded'];
		let productPriceType;
		if (data['productPriceType'].includes('SALES')) {
			productPriceType = 'SALES';
		}
		if (data['productPriceType'].includes('PURCHASE')) {
			productPriceType = 'PURCHASE';
		}
		if (
			data['productPriceType'].includes('SALES') &&
			data['productPriceType'].includes('PURCHASE')
		) {
			productPriceType = 'BOTH';
		}
		const productName = data['productName'];
		const productType = data['productType'];
		const dataNew = {
			productCode,
			productName,
			productType,
			productPriceType,
			vatCategoryId,
			vatIncluded,

			...(salesUnitPrice.length !== 0 && {
				salesUnitPrice,
			}),
			...(salesTransactionCategoryId.length !== 0 && {
				salesTransactionCategoryId,
			}),
			...(salesDescription.length !== 0 && {
				salesDescription,
			}),
			...(purchaseDescription.length !== 0 && {
				purchaseDescription,
			}),
			...(purchaseTransactionCategoryId.length !== 0 && {
				purchaseTransactionCategoryId,
			}),
			...(purchaseUnitPrice.length !== 0 && {
				purchaseUnitPrice,
			}),
		};
		const postData = this.getData(dataNew);
		this.props
			.createProduct(postData)
			.then((res) => {
				if (res.status === 200) {
					resetForm();
					this.props.closeProductModal(true);
					this.props.getCurrentProduct(res.data);
				}
			})
			.catch((err) => {
				this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});
	};

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 1,
			name: value,
		};
		this.props.productActions.checkValidation(data).then((response) => {
			if (response.data === 'Product name already exists') {
				this.setState({
					exist: true,
				});
			} else {
				this.setState({
					exist: false,
				});
			}
		});
	};

	render() {
		const {
			openProductModal,
			closeProductModal,
			vat_list,
			product_category_list,
			salesCategory,
			purchaseCategory,
		} = this.props;
		const { initValue } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openProductModal}
					className="modal-success contact-modal"
				>
					<Formik
						initialValues={initValue}
						onSubmit={(values, { resetForm }) => {
							this.handleSubmit(values, resetForm);
						}}
						validate={(values) => {
							let errors = {};
							if (!values.productName) {
								errors.productName = 'Product Name is  required';
							}
							if (this.state.exist === true) {
								errors.productName = 'Product  Name is already exist';
							}
							return errors;
						}}
						validationSchema={Yup.object().shape({
							purchaseUnitPrice: Yup.string().when('productPriceType', {
								is: (value) => value.includes('PURCHASE'),
								then: Yup.string().required('Purchase Price is Required'),
								otherwise: Yup.string(),
							}),
							purchaseTransactionCategoryId: Yup.string().when(
								'productPriceType',
								{
									is: (value) => value.includes('PURCHASE'),
									then: Yup.string().required('Purchase Category is Required'),
									otherwise: Yup.string(),
								},
							),
							salesTransactionCategoryId: Yup.string().when(
								'productPriceType',
								{
									is: (value) => value.includes('SALES'),
									then: Yup.string().required('Selling Category is Required'),
									otherwise: Yup.string(),
								},
							),
							salesUnitPrice: Yup.string().when('productPriceType', {
								is: (value) => value.includes('SALES'),
								then: Yup.string().required('Selling Price is Required'),
								otherwise: Yup.string(),
							}),
							productPriceType: Yup.string().required(
								'At least one Selling type is required',
							),
							productCode: Yup.string().required('Product code is required'),
							vatCategoryId: Yup.string()
								.required('Vat Category is Required')
								.nullable(),
						})}
					>
						{(props) => {
							const { handleBlur } = props;
							return (
								<Form onSubmit={props.handleSubmit}>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">Create Product</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
										<Row>
											<Col lg={12}>
												<FormGroup check inline className="mb-3">
													<Label className="productlabel mb-0 mr-1">Type</Label>
													<div className="wrapper">
														<Label
															className="form-check-label mr-1"
															check
															htmlFor="producttypeone"
														>
															<Input
																className="form-check-input"
																type="radio"
																id="producttypeone"
																name="producttypeone"
																value="GOODS"
																onChange={(value) => {
																	props.handleChange('productType')(value);
																}}
																checked={props.values.productType === 'GOODS'}
															/>
															Goods
														</Label>
														<Label
															className="form-check-label"
															check
															htmlFor="producttypetwo"
														>
															<Input
																className="form-check-input"
																type="radio"
																id="producttypetwo"
																name="producttypetwo"
																value="SERVICE"
																onChange={(value) => {
																	props.handleChange('productType')(value);
																}}
																checked={props.values.productType === 'SERVICE'}
															/>
															Service
														</Label>
													</div>
												</FormGroup>
											</Col>
										</Row>
										<Row>
											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="productName">
														<span className="text-danger">*</span>Name
													</Label>
													<Input
														type="text"
														maxLength="70"
														id="productName"
														name="productName"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('productName')(option);
															}
															this.validationCheck(option.target.value);
														}}
														onBlur={handleBlur}
														value={props.values.productName}
														placeholder="Enter Product Name"
														className={
															props.errors.productName &&
															props.touched.productName
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.productName &&
														props.touched.productName && (
															<div className="invalid-feedback">
																{props.errors.productName}
															</div>
														)}
												</FormGroup>
											</Col>

											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="productCode">
														<span className="text-danger">*</span>
														Product Code
														<i
															id="ProductCodeTooltip"
															className="fa fa-question-circle ml-1"
														></i>
														<UncontrolledTooltip
															placement="right"
															target="ProductCodeTooltip"
														>
															Product Code - Unique identifier code for the
															product
														</UncontrolledTooltip>
													</Label>
													<Input
														type="text"
														maxLength="70"
														id="productCode"
														name="productCode"
														placeholder="Enter Product Code"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('productCode')(option);
															}
														}}
														value={props.values.productCode}
													/>
												</FormGroup>
											</Col>
										</Row>
										<Row>
											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="productCategoryId">
														Product Category
													</Label>
													<Select
														styles={customStyles}
														className="select-default-width"
														options={
															product_category_list &&
															product_category_list.data
																? selectOptionsFactory.renderOptions(
																		'productCategoryName',
																		'id',
																		product_category_list.data,
																		'Product Category',
																  )
																: []
														}
														id="productCategoryId"
														name="productCategoryId"
														placeholder="Select Product Category"
														value={props.values.productCategoryId}
														onChange={(option) => {
															// this.setState({
															//   selectedParentProduct: option.value
															// })
															if (option && option.value) {
																props.handleChange('productCategoryId')(option);
															} else {
																props.handleChange('productCategoryId')('');
															}
														}}
													/>
												</FormGroup>
											</Col>
											{/* <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="unitPrice">
                                    Product Price
                                  </Label>
                                  <Input
                                    type="text"
                                    id="unitPrice"
                                    name="unitPrice"
                                    placeholder="Enter Product Price"
                                    onChange={(option) => {
                                      if (
                                        option.target.value === '' ||
                                        this.regEx.test(option.target.value)
                                      ) {
                                        props.handleChange('unitPrice')(option);
                                      }
                                    }}
                                    value={props.values.unitPrice}
                                  />
                                </FormGroup>
                              </Col> */}
											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="vatCategoryId">
														<span className="text-danger">*</span>Vat Percentage
													</Label>
													<Select
														styles={customStyles}
														options={
															vat_list
																? selectOptionsFactory.renderOptions(
																		'name',
																		'id',
																		vat_list,
																		'Vat',
																  )
																: []
														}
														id="vatCategoryId"
														name="vatCategoryId"
														placeholder="Select Vat Category"
														value={props.values.vatCategoryId}
														onChange={(option) => {
															// this.setState({
															//   selectedVatCategory: option.value
															// })
															if (option && option.value) {
																props.handleChange('vatCategoryId')(option);
															} else {
																props.handleChange('vatCategoryId')('');
															}
														}}
														className={
															props.errors.vatCategoryId &&
															props.touched.vatCategoryId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.vatCategoryId &&
														props.touched.vatCategoryId && (
															<div className="invalid-feedback">
																{props.errors.vatCategoryId}
															</div>
														)}
												</FormGroup>
											</Col>
										</Row>
										{/* <Row>
															<Col lg={12}>
																<FormGroup check inline className="mb-3">
																	<Input
																		className="form-check-input"
																		type="checkbox"
																		id="vatIncluded"
																		name="vatIncluded"
																		onChange={(value) => {
																			props.handleChange('vatIncluded')(value);
																		}}
																		checked={props.values.vatIncluded}
																	/>
																	<Label
																		className="form-check-label"
																		check
																		htmlFor="vatIncluded"
																	>
																		Vat Include
																	</Label>
																</FormGroup>
															</Col>
														</Row> */}

										{/* <Row>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="productWarehouseId">
                                    Warehourse
                                  </Label>
                                  <Select
                                    className="select-default-width"
                                    options={
                                      product_warehouse_list
                                        ? selectOptionsFactory.renderOptions(
                                            'warehouseName',
                                            'warehouseId',
                                            product_warehouse_list,
                                            'Warehouse',
                                          )
                                        : []
                                    }
                                    id="productWarehouseId"
                                    name="productWarehouseId"
                                    value={props.values.productWarehouseId}
                                    onChange={(option) => {
                                      // this.setState({
                                      //   selectedWareHouse: option.value
                                      // })
                                      if (option && option.value) {
                                        props.handleChange(
                                          'productWarehouseId',
                                        )(option);
                                      } else {
                                        props.handleChange(
                                          'productWarehouseId',
                                        )('');
                                      }
                                    }}
                                  />
                                </FormGroup>
                              </Col>
                            </Row> */}
										{/* <Row>
                              <Col lg={4}>
                                <FormGroup className="text-right">
                                  <Button
                                    color="primary"
                                    type="button"
                                    className="btn-square"
                                    onClick={this.showWarehouseModal}
                                  >
                                    <i className="fa fa-plus"></i> Add a
                                    Warehouse
                                  </Button>
                                </FormGroup>
                              </Col>
                            </Row> */}
										{/* <Row>
                              <Col lg={8}>
                                <FormGroup className="">
                                  <Label htmlFor="description">
                                    Description
                                  </Label>
                                  <Input
                                    type="textarea"
                                    name="productDescription"
                                    id="productDescription"
                                    rows="6"
                                    placeholder="Description..."
                                    onChange={(value) => {
                                      props.handleChange('productDescription')(
                                        value,
                                      );
                                    }}
                                    value={props.values.productDescription}
                                  />
                                </FormGroup>
                              </Col>
                            </Row> */}
										<Row className="secondary-info">
											<Col lg={4}>
												<FormGroup check inline className="mb-3">
													<Label
														className="form-check-label"
														check
														htmlFor="productPriceTypeOne"
													>
														<Input
															type="checkbox"
															id="productPriceTypeOne"
															name="productPriceTypeOne"
															onChange={(event) => {
																if (
																	props.values.productPriceType.includes(
																		'SALES',
																	)
																) {
																	const nextValue = props.values.productPriceType.filter(
																		(value) => value !== 'SALES',
																	);
																	props.setFieldValue(
																		'productPriceType',
																		nextValue,
																	);
																} else {
																	const nextValue = props.values.productPriceType.concat(
																		'SALES',
																	);
																	props.setFieldValue(
																		'productPriceType',
																		nextValue,
																	);
																}
															}}
															checked={props.values.productPriceType.includes(
																'SALES',
															)}
															className={
																props.errors.productPriceType &&
																props.touched.productPriceType
																	? 'is-invalid'
																	: ''
															}
														/>
														Sales Information
														{props.errors.productPriceType &&
															props.touched.productPriceType && (
																<div className="invalid-feedback">
																	{props.errors.productPriceType}
																</div>
															)}
													</Label>
												</FormGroup>
												<FormGroup className="mb-3">
													<Label htmlFor="salesUnitPrice">
														<span className="text-danger">*</span> Selling Price
														<i
															id="SalesTooltip"
															className="fa fa-question-circle ml-1"
														></i>
														<UncontrolledTooltip
															placement="right"
															target="SalesTooltip"
														>
															Selling price – Price at which your product is
															sold
														</UncontrolledTooltip>
													</Label>
													<Input
													type="number"
														maxLength="10"
														id="salesUnitPrice"
														name="salesUnitPrice"
														placeholder="Enter Selling Price"
														readOnly={
															props.values.productPriceType.includes('SALES')
																? false
																: true
														}
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regEx.test(option.target.value)
															) {
																props.handleChange('salesUnitPrice')(option);
															}
														}}
														value={props.values.salesUnitPrice}
														className={
															props.errors.salesUnitPrice &&
															props.touched.salesUnitPrice
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.salesUnitPrice &&
														props.touched.salesUnitPrice && (
															<div className="invalid-feedback">
																{props.errors.salesUnitPrice}
															</div>
														)}
												</FormGroup>
												<FormGroup className="mb-3">
													<Label htmlFor="transactionCategoryId">
														<span className="text-danger">*</span> Account
													</Label>
													<Select
														styles={customStyles}
														isDisabled={
															props.values.productPriceType.includes('SALES')
																? false
																: true
														}
														options={salesCategory ? salesCategory : []}
														value={
															salesCategory
																? props.values.salesTransactionCategoryId
																: ''
														}
														id="salesTransactionCategoryId"
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange(
																	'salesTransactionCategoryId',
																)(option);
															} else {
																props.handleChange(
																	'salesTransactionCategoryId',
																)('');
															}
														}}
														className={
															props.errors.salesTransactionCategoryId &&
															props.touched.salesTransactionCategoryId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.salesTransactionCategoryId &&
														props.touched.salesTransactionCategoryId && (
															<div className="invalid-feedback">
																{props.errors.salesTransactionCategoryId}
															</div>
														)}
												</FormGroup>
												<FormGroup className="">
													<Label htmlFor="salesDescription">Description</Label>
													<Input
														readOnly={
															props.values.productPriceType.includes('SALES')
																? false
																: true
														}
														type="textarea"
														maxLength="200"
														name="salesDescription"
														id="salesDescription"
														rows="3"
														placeholder="Description..."
														onChange={(value) => {
															props.handleChange('salesDescription')(value);
														}}
														value={props.values.salesDescription}
													/>
												</FormGroup>
											</Col>
											<Col lg={4}>
												<FormGroup check inline className="mb-3">
													<Label
														className="form-check-label"
														check
														htmlFor="productPriceTypetwo"
													>
														<Input
															type="checkbox"
															id="productPriceTypetwo"
															name="productPriceTypetwo"
															onChange={(event) => {
																if (
																	props.values.productPriceType.includes(
																		'PURCHASE',
																	)
																) {
																	const nextValue = props.values.productPriceType.filter(
																		(value) => value !== 'PURCHASE',
																	);
																	props.setFieldValue(
																		'productPriceType',
																		nextValue,
																	);
																} else {
																	const nextValue = props.values.productPriceType.concat(
																		'PURCHASE',
																	);
																	console.log(nextValue);
																	props.setFieldValue(
																		'productPriceType',
																		nextValue,
																	);
																}
															}}
															checked={props.values.productPriceType.includes(
																'PURCHASE',
															)}
															className={
																props.errors.productPriceType &&
																props.touched.productPriceType
																	? 'is-invalid'
																	: ''
															}
														/>
														Purchase Information
														{props.errors.productPriceType &&
															props.touched.productPriceType && (
																<div className="invalid-feedback">
																	{props.errors.productPriceType}
																</div>
															)}
													</Label>
												</FormGroup>
												<FormGroup className="mb-3">
													<Label htmlFor="salesUnitPrice">
														<span className="text-danger">*</span> Purchase
														Price
														<i
															id="PurchaseTooltip"
															className="fa fa-question-circle ml-1"
														></i>
														<UncontrolledTooltip
															placement="right"
															target="PurchaseTooltip"
														>
															Purchase price – Amount of money you paid for the
															product
														</UncontrolledTooltip>
													</Label>
													<Input
														type="number"
														maxLength="10"
														id="purchaseUnitPrice"
														name="purchaseUnitPrice"
														placeholder="Enter Selling Price"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regEx.test(option.target.value)
															) {
																props.handleChange('purchaseUnitPrice')(option);
															}
														}}
														readOnly={
															props.values.productPriceType.includes('PURCHASE')
																? false
																: true
														}
														value={props.values.purchaseUnitPrice}
														className={
															props.errors.purchaseUnitPrice &&
															props.touched.purchaseUnitPrice
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.purchaseUnitPrice &&
														props.touched.purchaseUnitPrice && (
															<div className="invalid-feedback">
																{props.errors.purchaseUnitPrice}
															</div>
														)}
												</FormGroup>

												<FormGroup className="mb-3">
													<Label htmlFor="salesUnitPrice">
														<span className="text-danger">*</span> Account
													</Label>
													<Select
														styles={customStyles}
														isDisabled={
															props.values.productPriceType.includes('PURCHASE')
																? false
																: true
														}
														options={purchaseCategory ? purchaseCategory : []}
														value={
															purchaseCategory
																? props.values.purchaseTransactionCategoryId
																: ''
														}
														id="purchaseTransactionCategoryId"
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange(
																	'purchaseTransactionCategoryId',
																)(option);
															} else {
																props.handleChange(
																	'purchaseTransactionCategoryId',
																)('');
															}
														}}
														className={
															props.errors.purchaseTransactionCategoryId &&
															props.touched.purchaseTransactionCategoryId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.purchaseTransactionCategoryId &&
														props.touched.purchaseTransactionCategoryId && (
															<div className="invalid-feedback">
																{props.errors.purchaseTransactionCategoryId}
															</div>
														)}
												</FormGroup>
												<FormGroup className="">
													<Label htmlFor="purchaseDescription">
														Description
													</Label>
													<Input
														readOnly={
															props.values.productPriceType.includes('PURCHASE')
																? false
																: true
														}
														type="textarea"
														maxLength="200"
														name="purchaseDescription"
														id="purchaseDescription"
														rows="3"
														placeholder="Description..."
														onChange={(value) => {
															props.handleChange('purchaseDescription')(value);
														}}
														value={props.values.purchaseDescription}
													/>
												</FormGroup>
											</Col>
										</Row>
									</ModalBody>
									<ModalFooter>
										<Button
											type="button"
											color="primary"
											className="btn-square mr-3"
											onClick={() => {
												this.setState({ createMore: false }, () => {
													props.handleSubmit();
												});
											}}
										>
											<i className="fa fa-dot-circle-o"></i> Create
										</Button>
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeProductModal(false);
											}}
										>
											<i className="fa fa-ban"></i> Cancel
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>
				</Modal>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(ProductModal);
