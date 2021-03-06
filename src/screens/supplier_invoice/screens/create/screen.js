import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import { Currency } from 'components';
import * as Yup from 'yup';
import * as SupplierInvoiceCreateActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';

import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { InvoiceNumberModel } from '../../../customer_invoice/sections';


import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';

import './style.scss';
import moment from 'moment';

const mapStateToProps = (state) => {
	return {
		contact_list: state.supplier_invoice.contact_list,
		currency_list: state.supplier_invoice.currency_list,
		vat_list: state.supplier_invoice.vat_list,
		product_list: state.supplier_invoice.product_list,
		supplier_list: state.supplier_invoice.supplier_list,
		country_list: state.supplier_invoice.country_list,
		product_category_list: state.product.product_category_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.currencyConvert.currency_convert_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		supplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		ProductActions: bindActionCreators(ProductActions, dispatch),
		supplierInvoiceCreateActions: bindActionCreators(
			SupplierInvoiceCreateActions,
			dispatch,
		),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
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

const invoiceimage = require('assets/images/invoice/invoice.png');

class CreateSupplierInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			supplier_currency_symbol:'',
			loading: false,
			discountOptions: [
				{ value: 'FIXED', label: 'Fixed' },
				{ value: 'PERCENTAGE', label: 'Percentage' },
			],
			discount_option: '',
			disabled: false,
			data: [
				{
					id: 0,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					subTotal: 0,
					productId: '',
					transactionCategoryId: '',
					transactionCategoryLabel: '',
				},
			],
			idCount: 0,
			initValue: {
				receiptAttachmentDescription: '',
				receiptNumber: '',
				contact_po_number: '',
				currencyCode: '',
				invoiceDueDate: '',
				invoiceDate: new Date(),
				contactId: '',
				placeOfSupplyId: '',
				project: '',
				exchangeRate:'',
				lineItemsString: [
					{
						id: 0,
						description: '',
						quantity: 1,
						unitPrice: '',
						vatCategoryId: '',
						subTotal: 0,
						productId: '',
						transactionCategoryId: '',
					},
				],
				invoice_number: '',
				total_net: 0,
				invoiceVATAmount: 0,
				term: '',
				totalAmount: 0,
				notes: '',
				discount: 0,
				discountPercentage: 0,
				discountType: { value: 'FIXED', label: 'Fixed' },
			},
			currentData: {},
			contactType: 1,
			openSupplierModal: false,
			openProductModal: false,
			openInvoiceNumberModel: false,
			selectedContact: '',
			createMore: false,
			fileName: '',
			term: '',
			prefix: '',
			selectedType: { value: 'FIXED', label: 'Fixed' },
			discountPercentage: '',
			discountAmount: 0,
			purchaseCategory: [],
			exchangeRate:'',	
			basecurrency:[],
		};

		this.formRef = React.createRef();
		this.file_size = 1024000;
		this.supported_format = [
			'image/png',
			'image/jpeg',
			'text/plain',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];
		// this.options = {
		//   paginationPosition: 'top'
		// }
		this.termList = [
			{ label: 'Net 7 Days', value: 'NET_7' },
			{ label: 'Net 10 Days', value: 'NET_10' },
			{ label: 'Net 30 Days', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
		this.placelist = [
			{ label: 'Abu Dhabi', value: '1' },
			{ label: 'Dubai', value: '2' },
			{ label: 'Sharjah', value: '3' },
			{ label: 'Ajman', value: '4' },
			{ label: 'Umm Al Quwain', value: '5' },
			{ label: 'Ras Al Khalmah', value: '6' },
			{ label: 'Fujairah', value: '7' },
		];
		this.regEx = /^[0-9\b]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	renderProductName = (cell, row) => {
		return (
			<div className="d-flex align-items-center">
				<Input type="hidden" className="mr-1"></Input>
			</div>
		);
	};

	renderDescription = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.description`}
				render={({ field, form }) => (
					<Input
						type="text"
						value={row['description'] !== '' ? row['description'] : ''}
						onChange={(e) => {
							this.selectItem(
								e.target.value,
								row,
								'description',
								form,
								field,
								props,
							);
						}}
						placeholder="Description"
						className={`form-control 
            ${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].description &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].description
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderQuantity = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.quantity`}
				render={({ field, form }) => (
					<div>
						<Input
							type="number"
							maxLength="10"
							value={row['quantity'] !== 0 ? row['quantity'] : 0}
							onChange={(e) => {
								if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
									this.selectItem(
										e.target.value,
										row,
										'quantity',
										form,
										field,
										props,
									);
								}
							}}
							placeholder="Quantity"
							className={`form-control 
            ${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].quantity
								? 'is-invalid'
								: ''
						}`}
						/>
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].quantity && (
								<div className="invalid-feedback">
									{props.errors.lineItemsString[parseInt(idx, 10)].quantity}
								</div>
							)}
					</div>
				)}
			/>
		);
	};

	renderUnitPrice = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.unitPrice`}
				render={({ field, form }) => (
					<Input
					type="number"
						maxLength="10"
						value={row['unitPrice'] !== 0 ? row['unitPrice'] : 0}
						onChange={(e) => {
							if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
								this.selectItem(
									e.target.value,
									row,
									'unitPrice',
									form,
									field,
									props,
								);
							}
						}}
						placeholder="Unit Price"
						className={`form-control 
            ${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].unitPrice
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderSubTotal = (cell, row, extraData) => {
		// return row.subTotal === 0 ? (
		// 	<Currency
		// 		value={row.subTotal.toFixed(2)}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	<Currency
		// 		value={row.subTotal.toFixed(2)}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// );
		return row.subTotal === 0 ? row.subTotal.toFixed(2) : row.subTotal.toFixed(2);
	};

	componentDidMount = () => {
		this.getInitialData();
	};

	getInitialData = () => {
		this.getInvoiceNo();
		this.props.supplierInvoiceActions.getSupplierList(this.state.contactType);
		this.props.currencyConvertActions.getCurrencyConversionList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currencyCode: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
				},
			});
			// this.formRef.current.setFieldValue(
			// 	'currency',
			// 	response.data[0].currencyCode,
			// 	true,
			// );
		});
		this.props.supplierInvoiceActions.getInvoicePrefix().then((response) => {
			this.setState({prefixData:response.data
			
			});
		});
		this.props.supplierInvoiceActions.getVatList();
		this.props.supplierInvoiceActions.getCountryList();
		this.props.supplierInvoiceActions.getProductList();
		this.props.ProductActions.getProductCategoryList();
		this.purchaseCategory();
		this.salesCategory();
		this.getCompanyCurrency();
	};

	salesCategory = () => {
		try {
			this.props.ProductActions.getTransactionCategoryListForSalesProduct(
				'2',
			).then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							salesCategory: res.data,
						},
						() => {
							console.log(this.state.salesCategory);
						},
					);
				}
			});
		} catch (err) {
			console.log(err);
		}
	};

	purchaseCategory = () => {
		try {
			this.props.ProductActions.getTransactionCategoryListForPurchaseProduct(
				'10',
			).then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							purchaseCategory: res.data,
						},
						() => {},
					);
				}
			});
		} catch (err) {
			console.log(err);
		}
	};

	addRow = () => {
		const data = [...this.state.data];
		this.setState(
			{
				data: data.concat({
					id: this.state.idCount + 1,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					subTotal: 0,
					productId: '',
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
				this.formRef.current.setFieldValue(
					'lineItemsString',
					this.state.data,
					true,
				);
				this.formRef.current.setFieldTouched(
					`lineItemsString[${this.state.data.length - 1}]`,
					false,
					true,
				);
			},
		);
	};

	selectItem = (e, row, name, form, field, props) => {
		//e.preventDefault();
		let data = this.state.data;
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj[`${name}`] = e;
				idx = index;
			}
			return obj;
		});
		if (
			name === 'unitPrice' ||
			name === 'vatCategoryId' ||
			name === 'quantity'
		) {
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			this.updateAmount(data, props);
		} else {
			this.setState({ data }, () => {
				form.setFieldValue(
					field.name,
					this.state.data[parseInt(idx, 10)][`${name}`],
					true,
				);
			});
		}
	};

	renderVat = (cell, row, props) => {
		const { vat_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.vatCategoryId`}
				render={({ field, form }) => (
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
						value={
							vat_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', vat_list, 'Vat')
								.find((option) => option.value === +row.vatCategoryId)
						}
						id="vatCategoryId"
						placeholder="Select Vat"
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'vatCategoryId',
								form,
								field,
								props,
							);
						}}
						className={`${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].vatCategoryId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	prductValue = (e, row, name, form, field, props) => {
		const { product_list } = this.props;
		let data = this.state.data;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				obj['transactionCategoryId'] = result.transactionCategoryId;
				obj['transactionCategoryLabel'] = result.transactionCategoryLabel;
				idx = index;
			}
			return obj;
		});
		form.setFieldValue(
			`lineItemsString.${idx}.vatCategoryId`,
			result.vatCategoryId,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.unitPrice`,
			result.unitPrice,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.description`,
			result.description,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.transactionCategoryId`,
			result.transactionCategoryId,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.transactionCategoryLabel`,
			result.transactionCategoryLabel,
			true,
		);
		this.updateAmount(data, props);
	};
	renderAddProduct = (cell, rows, props) => {
		return (
			<Button
				color="primary"
				className="btn-twitter btn-brand icon"
				onClick={(e, props) => {
					this.openProductModal(props);
				}}
			>
				<i className="fas fa-plus"></i>
			</Button>
		);
	};

	renderProduct = (cell, row, props) => {
		const { product_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
		// if (product_list.length > 0) {
		return (
			<Field
				name={`lineItemsString.${idx}.productId`}
				render={({ field, form }) => (
					<Select
						styles={customStyles}
						options={
							product_list
								? selectOptionsFactory.renderOptions(
										'name',
										'id',
										product_list,
										'Product',
								  )
								: []
						}
						id="productId"
						placeholder="Select Product"
						onChange={(e) => {
							if (e && e.label !== 'Select Product') {
								this.selectItem(e.value, row, 'productId', form, field, props);
								this.prductValue(e.value, row, 'productId', form, field, props);
								// this.formRef.current.props.handleChange(field.name)(e.value)
							} else {
								form.setFieldValue(
									`lineItemsString.${idx}.productId`,
									e.value,
									true,
								);
								this.setState({
									data: [
										{
											id: 0,
											description: '',
											quantity: 1,
											unitPrice: '',
											vatCategoryId: '',
											subTotal: 0,
											productId: '',
										},
									],
								});
							}
						}}
						value={
							product_list && row.productId
								? selectOptionsFactory
										.renderOptions('name', 'id', product_list, 'Product')
										.find((option) => option.value === +row.productId)
								: []
						}
						className={`${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].productId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].productId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
		// } else {
		// 	return (
		// 		<Button
		// 			type="button"
		// 			color="primary"
		// 			className="btn-square mr-3 mb-3"
		// 			onClick={(e, props) => {
		// 				this.openProductModal(props);
		// 			}}
		// 		>
		// 			<i className="fa fa-plus"></i> Add a Product
		// 		</Button>
		// 	);
		// }
	};

	// selectCategory = (options, row, name, form, field, props) => {
	// 	let data = this.state.data;
	// 	let idx;
	// 	data.map((obj, index) => {
	// 		if (obj.id === row.id) {
	// 			obj['transactiomCategoryId'] = options;
	// 			idx = index;
	// 		}
	// 		return obj;
	// 	});
	// 	console.log(data);
	// 	form.setFieldValue(
	// 		`lineItemsString.${idx}.transactiomCategoryId`,
	// 		options,
	// 		true,
	// 	);
	// };

	renderAccount = (cell, row, props) => {
		const { purchaseCategory } = this.state;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.transactionCategoryId`}
				render={({ field, form }) => (
					<Select
						styles={{
							menu: (provided) => ({ ...provided, zIndex: 9999 }),
						}}
						options={purchaseCategory ? purchaseCategory : []}
						id="transactionCategoryId"
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'transactionCategoryId',
								form,
								field,
								props,
							);
						}}
						value={
							purchaseCategory && row.transactionCategoryLabel
								? purchaseCategory
										.find((item) => item.label === row.transactionCategoryLabel)
										.options.find(
											(item) => item.value === +row.transactionCategoryId,
										)
								: row.transactionCategoryId
						}
						placeholder="Select Account"
						className={`${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)]
								.transactionCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)]
								.transactionCategoryId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	deleteRow = (e, row, props) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const data = this.state.data;
		newData = data.filter((obj) => obj.id !== id);
		props.setFieldValue('lineItemsString', newData, true);
		this.updateAmount(newData, props);
	};

	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon"
				disabled={this.state.data.length === 1 ? true : false}
				onClick={(e) => {
					this.deleteRow(e, rows, props);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
	};

	checkedRow = () => {
		if (this.state.data.length > 0) {
			let length = this.state.data.length - 1;
			let temp = Object.values(this.state.data[`${length}`]).indexOf('');
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	setDate = (props, value) => {
		const { term } = this.state;
		const val = term ? term.value.split('_') : '';
		const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];
		const values = value
			? value
			: moment(props.values.invoiceDate, 'DD/MM/YYYY').toDate();
		if (temp && values) {
			const date = moment(values)
				.add(temp - 1, 'days')
				.format('DD/MM/YYYY');
			props.setFieldValue('invoiceDueDate', date, true);
		}
	};

	setExchange = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});

		this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
		};

	setCurrency = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		
	    this.formRef.current.setFieldValue('curreancyname', result[0].currencyName, true);
	};

	updateAmount = (data, props) => {
		const { vat_list } = this.props;
		const { discountPercentage, discountAmount } = this.state;
		console.log(discountAmount);
		let total_net = 0;
		let total = 0;
		let total_vat = 0;
		data.map((obj) => {
			const index =
				obj.vatCategoryId !== ''
					? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
					: '';
			const vat = index !== '' ? vat_list[`${index}`].vat : 0;
			if (props.values.discountType.value === 'PERCENTAGE') {
				var val =
					((+obj.unitPrice -
						+((obj.unitPrice * discountPercentage) / 100).toFixed(2)) *
						vat *
						obj.quantity) /
					100;
			} else if (props.values.discountType.value === 'FIXED') {
				var val =
					(obj.unitPrice * obj.quantity - discountAmount / data.length) *
					(vat / 100);
			} else {
				var val = (+obj.unitPrice * vat * obj.quantity) / 100;
			}
			obj.subTotal =
				obj.unitPrice && obj.vatCategoryId ? +obj.unitPrice * obj.quantity : 0;
			total_net = +(total_net + +obj.unitPrice * obj.quantity);
			total_vat = +(total_vat + val);
			total = total_vat + total_net;
			return obj;
		});

		const discount =
			props.values.discountType.value === 'PERCENTAGE'
				? +((total_net * discountPercentage) / 100).toFixed(2)
				: discountAmount;
		this.setState(
			{
				data,
				initValue: {
					...this.state.initValue,
					...{
						total_net: discount ? total_net - discount : total_net,
						invoiceVATAmount: total_vat,
						discount: total_net > discount ? discount : 0,
						totalAmount: total_net > discount ? total - discount : total,
					},
				},
			},
			() => {
				if (props.values.discountType.value === 'PERCENTAGE') {
					this.formRef.current.setFieldValue('discount', discount);
				}
			},
		);
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const {
			receiptAttachmentDescription,
			receiptNumber,
			contact_po_number,
			currency,
			invoiceDueDate,
			invoiceDate,
			contactId,
			placeOfSupplyId,
			project,
			exchangeRate,
			invoice_number,
			discount,
			discountType,
			discountPercentage,
			notes,
		} = data;
		const { term } = this.state;

		let formData = new FormData();
		formData.append(
			'referenceNumber',
			invoice_number ? this.state.prefix + invoice_number : '',
		);
		formData.append('invoiceDate', invoiceDate ? invoiceDate : '');
		formData.append(
			'invoiceDueDate',
			invoiceDueDate ? moment(invoiceDueDate, 'DD/MM/YYYY').toDate() : '',
		);
		formData.append('receiptNumber', receiptNumber ? receiptNumber : '');
		formData.append(
			'contactPoNumber',
			contact_po_number ? contact_po_number : '',
		);
		formData.append(
			'receiptAttachmentDescription',
			receiptAttachmentDescription ? receiptAttachmentDescription : '',
		);
		formData.append('notes', notes ? notes : '');
		formData.append('type', 1);
		formData.append('lineItemsString', JSON.stringify(this.state.data));
		formData.append('totalVatAmount', this.state.initValue.invoiceVATAmount);
		formData.append('totalAmount', this.state.initValue.totalAmount);
		formData.append('discount', discount);
		formData.append('exchangeRate', exchangeRate);

		if (discountType && discountType.value) {
			formData.append('discountType', discountType.value);
		}
		if (term && term.value) {
			formData.append('term', term.value);
		}

		if (discountType.value === 'PERCENTAGE') {
			formData.append('discountPercentage', discountPercentage);
		}
		if (placeOfSupplyId && placeOfSupplyId.value) {
			formData.append('placeOfSupplyId', placeOfSupplyId.value);
		}
		if (contactId && contactId.value) {
			formData.append('contactId', contactId.value);
		}
		if (currency !== null && currency) {
			formData.append('currencyCode', this.state.supplier_currency);
		}
		if (project !== null && project.value) {
			formData.append('projectId', project.value);
		}
		if (this.uploadFile.files[0]) {
			formData.append('attachmentFile', this.uploadFile.files[0]);
		}
		this.props.supplierInvoiceCreateActions
			.createInvoice(formData)
			.then((res) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'success',
					'New Invoice Created Successfully.',
				);
				if (this.state.createMore) {
					this.setState(
						{
							createMore: false,
							selectedContact: '',
							term: '',
							data: [
								{
									id: 0,
									description: '',
									quantity: 1,
									unitPrice: '',
									vatCategoryId: '',
									subTotal: 0,
									productId: '',
									transactionCategoryId: '',
									transactionCategoryLabel: '',
								},
							],
							initValue: {
								...this.state.initValue,
								...{
									total_net: 0,
									invoiceVATAmount: 0,
									totalAmount: 0,
									discountType: '',
									discount: 0,
									discountPercentage: '',
								},
							},
						},
						() => {
							resetForm(this.state.initValue);
							this.getInvoiceNo();
							this.formRef.current.setFieldValue(
								'lineItemsString',
								this.state.data,
								false,
							);
						},
					);
				} else {
					this.props.history.push('/admin/expense/supplier-invoice');
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
	openInvoiceNumberModel = (props) => {
		this.setState({ openInvoiceNumberModel : true });
	};

	openSupplierModal = (e) => {
		this.setState({ openSupplierModal: true });
	};

	openProductModal = (props) => {
		this.setState({ openProductModal: true });
	};

	handleFileChange = (e, props) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => {};
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};

	getCurrentUser = (data) => {
		
		let option;
		if (data.label || data.value) {
			option = data;
		} else {
			option = {
				label: `${data.fullName}`,
				value: data.id,
			};
		}
		
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === data.currencyCode;
		});
		
	    this.formRef.current.setFieldValue('currency', result[0].currencyCode, true);
		this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);

		this.setState({
			supplier_currency: data.currencyCode,
			supplier_currency_des: result[0].currencyName,
		})

		// this.setState({
		//   selectedContact: option
		// })
		this.formRef.current.setFieldValue('contactId', option, true);
	};

	closeSupplierModal = (res) => {
		if (res) {
			this.props.supplierInvoiceActions.getSupplierList(this.state.contactType);
			this.getInvoiceNo();
		}
		this.setState({ openSupplierModal: false });
	};

	closeProductModal = (res) => {
		this.setState({ openProductModal: false });
	};
	closeInvoiceNumberModel = (res) => {
		this.setState({ openInvoiceNumberModel: false });
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
	getCurrentProduct = () => {
		this.props.supplierInvoiceActions.getProductList().then((res) => {
			this.setState(
				{
					data: [
						{
							id: 0,
							description: res.data[0].description,
							quantity: 1,
							unitPrice: res.data[0].unitPrice,
							vatCategoryId: res.data[0].vatCategoryId,
							subTotal: res.data[0].unitPrice,
							productId: res.data[0].id,
							transactionCategoryId: res.data[0].transactionCategoryId,
							transactionCategoryLabel: res.data[0].transactionCategoryLabel,
						},
					],
				},
				() => {
					const values = {
						values: this.state.initValue,
					};
					this.updateAmount(this.state.data, values);
				},
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.unitPrice`,
				res.data[0].unitPrice,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.quantity`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.vatCategoryId`,
				res.data[0].vatCategoryId,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.productId`,
				res.data[0].id,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.transactionCategoryId`,
				res.data[0].transactionCategoryId,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.transactionCategoryLabel`,
				res.data[0].transactionCategoryLabel,
				true,
			);
		});
	};
	getCurrentNumber = (data) => {
		this.getInvoiceNo();
	};

	getInvoiceNo = () => {
		this.props.supplierInvoiceCreateActions.getInvoiceNo().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{
							invoice_number: res.data,
						},
					},
				});
				this.formRef.current.setFieldValue('invoice_number', res.data, true);
			}
		});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 6,
			name: value,
		};
		this.props.supplierInvoiceCreateActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Invoice Number already exists') {
					this.setState(
						{
							exist: true,
						},
						() => {
							console.log(this.state.exist);
						},
					);
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};

	getCurrency = (opt) => {
		let supplier_currencyCode = 0;

		this.props.supplier_list.map(item => {
			if(item.label.contactId == opt) {
				this.setState({
					supplier_currency: item.label.currency.currencyCode,
					supplier_currency_des: item.label.currency.currencyName,
					supplier_currency_symbol: item.label.currency.currencySymbol
				});

				supplier_currencyCode = item.label.currency.currencyCode;
			}
		})

		return supplier_currencyCode;
	}

	render() {
		const { data, discountOptions, initValue, prefix } = this.state;

		const {
			currency_list,
			supplier_list,
			universal_currency_list,
			currency_convert_list,
		} = this.props;

		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})

		return (
			<div className="create-supplier-invoice-screen">
				<div className=" fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="invoiceimage"
													src={invoiceimage}
													style={{ width: '40px' }}
												/>
												<span className="ml-2">Create Invoice</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<Formik
												initialValues={initValue}
												ref={this.formRef}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
													// resetForm(initValue)

													// this.setState({
													//   selectedCurrency: null,
													//   selectedProject: null,
													//   selectedBankAccount: null,
													//   selectedCustomer: null

													// })
												}}
												validate={(values) => {
													let errors = {};
													if (this.state.exist === true) {
														errors.invoice_number =
															'Invoice Number cannot be same';
													}
													return errors;
												}}
												validationSchema={Yup.object().shape({
													invoice_number: Yup.string().required(
														'Invoice Number is Required',
													),
													contactId: Yup.string().required(
														'Supplier is Required',
													),
													placeOfSupplyId: Yup.string().required('Place of supply is Required'),
													term: Yup.string().required('Term is Required'),
													invoiceDate: Yup.string().required(
														'Invoice Date is Required',
													),
													currency: Yup.string().required(
														'Currency is Required',
													),
													lineItemsString: Yup.array()
														.required(
															'Atleast one invoice sub detail is mandatory',
														)
														.of(
															Yup.object().shape({
																quantity: Yup.string()
																	.required('Value is Required')
																	.test(
																		'quantity',
																		'Quantity Should be Greater than 1',
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
																unitPrice: Yup.string()
																	.required('Value is Required')
																	.test(
																		'Unit Price',
																		'Unit Price Should be Greater than 1',
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
																vatCategoryId: Yup.string().required(
																	'Value is Required',
																),
																productId: Yup.string().required(
																	'Product is Required',
																),
																transactionCategoryId: Yup.string().required(
																	'Account is Required',
																),
															}),
														),
													attachmentFile: Yup.mixed()
														.test(
															'fileType',
															'*Unsupported File Format',
															(value) => {
																value &&
																	this.setState({
																		fileName: value.name,
																	});
																if (
																	!value ||
																	(value &&
																		this.supported_format.includes(value.type))
																) {
																	return true;
																} else {
																	return false;
																}
															},
														)
														.test(
															'fileSize',
															'*File Size is too large',
															(value) => {
																if (
																	!value ||
																	(value && value.size <= this.file_size)
																) {
																	return true;
																} else {
																	return false;
																}
															},
														),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="invoice_number">
																		<span className="text-danger">*</span>
																		Invoice Number
																	</Label>
																	<Input
																		type="text"
																		id="invoice_number"
																		name="invoice_number"
																		placeholder="Invoice Number"
																		value={props.values.invoice_number}
																		onBlur={props.handleBlur('invoice_number')}
																		onChange={(value) => {
																			props.handleChange('invoice_number')(
																				value,
																			);
																		}}
																		className={
																			props.errors.invoice_number &&
																			props.touched.invoice_number
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.invoice_number &&
																		props.touched.invoice_number && (
																			<div className="invalid-feedback">
																				{props.errors.invoice_number}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																		<span className="text-danger">*</span>
																		Supplier Name
																	</Label>
																	<Select
																		styles={customStyles}
																		id="contactId"
																		name="contactId"
																		placeholder="Select Supplier Name"
																		options={
																			tmpSupplier_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						tmpSupplier_list,
																						'Supplier Name',
																				  )
																				: []
																		}
																		value={props.values.contactId}
																		onChange={(option) => {
																			if (option && option.value) {
																				this.formRef.current.setFieldValue('currency', this.getCurrency(option.value), true);
																				this.setExchange( this.getCurrency(option.value) );
																				props.handleChange('contactId')(option);
																			} else {

																				props.handleChange('contactId')('');
																			}
																		}}
																		className={
																			props.errors.contactId &&
																			props.touched.contactId
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.contactId &&
																		props.touched.contactId && (
																			<div className="invalid-feedback">
																				{props.errors.contactId}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col>
																<Label
																	htmlFor="contactId"
																	style={{ display: 'block' }}
																>
																	Add New Supplier
																</Label>
																<Button
																	type="button"
																	color="primary"
																	className="btn-square"
																	onClick={this.openSupplierModal}
																>
																	<i className="fa fa-plus"></i> Add a Supplier
																</Button>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="placeOfSupplyId">
																		<span className="text-danger">*</span>
																		Place of Supply
																	</Label>
																	<Select
																		styles={customStyles}
																		id="placeOfSupplyId"
																		name="placeOfSupplyId"
																		placeholder="Select Place of Supply"
																		options={
																			this.placelist
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						this.placelist,
																						'Place of Supply',
																						
																				  )
																				: []
																		}
																		value={this.state.placelist}
																		className={
																			props.errors.placeOfSupplyId &&
																			props.touched.placeOfSupplyId
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>
																			props.handleChange('placeOfSupplyId')(
																				option,
																			)
																		}
																	/>
																	{props.errors.placeOfSupplyId &&
																		props.touched.placeOfSupplyId && (
																			<div className="invalid-feedback">
																				{props.errors.placeOfSupplyId}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<hr />
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="term">
																		<span className="text-danger">*</span>Terms{' '}
																		<i
																			id="UncontrolledTooltipExample"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="UncontrolledTooltipExample"
																		>
																			<p>
																				{' '}
																				Terms- The duration given to a buyer for
																				payment.
																			</p>
																			<p>
																				Net 7 ??? payment due in 7 days from
																				invoice date{' '}
																			</p>
																			<p>
																				{' '}
																				Net 10 ??? payment due in 10 days from
																				invoice date{' '}
																			</p>
																			<p>
																				{' '}
																				Net 30 ??? payment due in 30 days from
																				invoice date{' '}
																			</p>
																		</UncontrolledTooltip>
																	</Label>
																	<Select
																		styles={customStyles}
																		options={
																			this.termList
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						this.termList,
																						'Terms',
																				  )
																				: []
																		}
																		id="term"
																		name="term"
																		placeholder="Select Terms"
																		value={this.state.term}
																		onChange={(option) => {
																			props.handleChange('term')(option);
																			if (option.value === '') {
																				this.setState({
																					term: option,
																				});
																				props.setFieldValue(
																					'invoiceDueDate',
																					'',
																				);
																			} else {
																				this.setState(
																					{
																						term: option,
																					},
																					() => {
																						this.setDate(props, '');
																					},
																				);
																			}
																		}}
																		className={
																			props.errors.term && props.touched.term
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.term && props.touched.term && (
																		<div className="invalid-feedback">
																			{props.errors.term}
																		</div>
																	)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">
																		<span className="text-danger">*</span>
																		Invoice Date
																	</Label>
																	<DatePicker
																		id="invoiceDate"
																		name="invoiceDate"
																		placeholderText="Invoice Date"
																		showMonthDropdown
																		showYearDropdown
																		dateFormat="dd/MM/yyyy"
																		dropdownMode="select"
																		value={props.values.invoiceDate}
																		selected={props.values.invoiceDate}
																		onChange={(value) => {
																			props.handleChange('invoiceDate')(value);
																			this.setDate(props, value);
																		}}
																		className={`form-control ${
																			props.errors.invoiceDate &&
																			props.touched.invoiceDate
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.invoiceDate &&
																		props.touched.invoiceDate && (
																			<div className="invalid-feedback">
																				{props.errors.invoiceDate}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="due_date">
																		Invoice Due Date
																	</Label>
																	<div>
																		<DatePicker
																			id="invoiceDueDate"
																			name="invoiceDueDate"
																			placeholderText="Invoice Due Date"
																			value={props.values.invoiceDueDate}
																			showMonthDropdown
																			showYearDropdown
																			disabled
																			dateFormat="dd/MM/yyyy"
																			dropdownMode="select"
																			onChange={(value) => {
																				props.handleChange('invoiceDueDate')(
																					value,
																				);
																			}}
																			className={`form-control ${
																				props.errors.invoiceDueDate &&
																				props.touched.invoiceDueDate
																					? 'is-invalid'
																					: ''
																			}`}
																		/>
																		{props.errors.invoiceDueDate &&
																			props.touched.invoiceDueDate && (
																				<div className="invalid-feedback">
																					{props.errors.invoiceDueDate}
																				</div>
																			)}
																	</div>
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="currency">
																		<span className="text-danger">*</span>
																		Currency
																	</Label>
																	<Select
																		styles={customStyles}
																		options={
																			currency_convert_list
																				? selectCurrencyFactory.renderOptions(
																						'currencyName',
																						'currencyCode',
																						currency_convert_list,
																						'Currency',
																				  )
																				: []
																		}
																		id="currency"
																		name="currency"
																		value={																		
																			currency_convert_list &&
																			selectCurrencyFactory
																				.renderOptions(
																					'currencyName',
																					'currencyCode',
																					currency_convert_list,
																					'Currency',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						this.state.supplier_currency,
																				)
																		}
																		onChange={(option) => {
																			props.handleChange('currency')(option);
																			this.setExchange(option.value);
																			this.setCurrency(option.value)
																		   }}
																		className={`${
																			props.errors.currency &&
																			props.touched.currency
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.currency &&
																		props.touched.currency && (
																			<div className="invalid-feedback">
																				{props.errors.currency}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<hr />
																<Row style={{display: props.values.exchangeRate === 1 ? 'none' : ''}}>
																<Col>
																<Label>
																		Currency Exchange Rate
																	</Label>	
																</Col>
																</Row>
																<Row style={{display: props.values.exchangeRate === 1 ? 'none' : ''}}>
																<Col md={1}>
																<Input
																		disabled
																				id="1"
																				name="1"
																				value=	{
																					1 }
																				
																			/>
																</Col>
																<Col md={2}>
																<FormGroup className="mb-3">
																	{/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
																	<div>
																		<Input
																		disabled	
																			className="form-control"
																			id="curreancyname"
																			name="curreancyname"
																			
																			value={this.state.supplier_currency_des}
																			onChange={(value) => {
																				props.handleChange('curreancyname')(
																					value,
																				);
																			}}
																		/>
																	</div>
																</FormGroup>
															</Col>
															<FormGroup className="mt-2"><label><b>=</b></label>	</FormGroup>
															<Col lg={2}>
																<FormGroup className="mb-3">
																	{/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
																	<div>
																		<Input
																			type="number"
																			className="form-control"
																			id="exchangeRate"
																			name="exchangeRate"
																			
																			value={props.values.exchangeRate}
																			onChange={(value) => {
																				props.handleChange('exchangeRate')(
																					value,
																				);
																			}}
																		/>
																	</div>
																</FormGroup>
															</Col>
														
															<Col md={2}>
															<Input
																		disabled
																				id="currencyName"
																				name="currencyName"
																				value=	{
																					this.state.basecurrency.currencyName }
																				
																			/>
														</Col>
														</Row>
														<hr style={{display: props.values.exchangeRate === 1 ? 'none' : ''}} />
														<Row>
															<Col lg={12} className="mb-3">
																<Button
																	color="primary"
																	className={`btn-square mr-3 ${
																		this.checkedRow() ? `disabled-cursor` : ``
																	} `}
																	onClick={this.addRow}
																	title={
																		this.checkedRow()
																			? `Please add detail to add more`
																			: ''
																	}
																	disabled={this.checkedRow() ? true : false}
																>
																	<i className="fa fa-plus"></i> Add More
																</Button>
															</Col>
														</Row>
														<Row>
															<Col lg={12}>
																{props.errors.lineItemsString &&
																	props.errors.lineItemsString === 'string' && (
																		<div
																			className={
																				props.errors.lineItemsString
																					? 'is-invalid'
																					: ''
																			}
																		>
																			<div className="invalid-feedback">
																				{props.errors.lineItemsString}
																			</div>
																		</div>
																	)}
																<BootstrapTable
																	options={this.options}
																	data={data}
																	version="4"
																	hover
																	keyField="id"
																	className="invoice-create-table"
																>
																	<TableHeaderColumn
																		width="5%"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderActions(cell, rows, props)
																		}
																	></TableHeaderColumn>
																	<TableHeaderColumn
																	width="15%"
																		dataField="product"
																		dataFormat={(cell, rows) =>
																			this.renderProduct(cell, rows, props)
																		}
																	>
																		Product
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		width="55"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderAddProduct(cell, rows, props)
																		}
																	></TableHeaderColumn>
																	<TableHeaderColumn
																		width="15%"
																		dataField="account"
																		dataFormat={(cell, rows) =>
																			this.renderAccount(cell, rows, props)
																		}
																	>
																		Account
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="description"
																		dataFormat={(cell, rows) =>
																			this.renderDescription(cell, rows, props)
																		}
																	>
																		Description
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="quantity"
																		width="100"
																		dataFormat={(cell, rows) =>
																			this.renderQuantity(cell, rows, props)
																		}
																	>
																		Quantity
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="unitPrice"
																		dataFormat={(cell, rows) =>
																			this.renderUnitPrice(cell, rows, props)
																		}
																	>
																		Unit Price
																		<i
																			id="UnitPriceToolTip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="UnitPriceToolTip"
																		>
																			Unit Price ??? Price of a single product or
																			service
																		</UncontrolledTooltip>
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="vat"
																		dataFormat={(cell, rows) =>
																			this.renderVat(cell, rows, props)
																		}
																	>
																		Vat (%)
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="sub_total"
																		dataFormat={this.renderSubTotal}
																		className="text-right"
																		columnClassName="text-right"
																		formatExtraData={universal_currency_list}
																	>
																		Sub Total
																	</TableHeaderColumn>
																</BootstrapTable>
															</Col>
														</Row>
														<hr />
														{this.state.data.length > 0 ? (
															<Row>
																<Col lg={8}>
																	<FormGroup className="py-2">
																		<Label htmlFor="notes">Notes</Label>
																		<Input
																			type="textarea"
																			maxLength="255"
																			name="notes"
																			id="notes"
																			rows="6"
																			placeholder="Notes"
																			onChange={(option) =>
																				props.handleChange('notes')(option)
																			}
																			value={props.values.notes}
																		/>
																	</FormGroup>

																	<Row>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="receiptNumber">
																					Reciept Number
																				</Label>
																				<Input
																					type="text"
																					maxLength="50"
																					id="receiptNumber"
																					name="receiptNumber"
																					placeholder="Reciept Number"
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExBoth.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange(
																								'receiptNumber',
																							)(option);
																						}
																					}}
																					value={props.values.receiptNumber}
																				/>
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Field
																					name="attachmentFile"
																					render={({ field, form }) => (
																						<div>
																							<Label>Reciept Attachment</Label>{' '}
																							<br />
																							<Button
																								color="primary"
																								onClick={() => {
																									document
																										.getElementById('fileInput')
																										.click();
																								}}
																								className="btn-square mr-3"
																							>
																								<i className="fa fa-upload"></i>{' '}
																								Upload
																							</Button>
																							<input
																								id="fileInput"
																								ref={(ref) => {
																									this.uploadFile = ref;
																								}}
																								type="file"
																								style={{ display: 'none' }}
																								onChange={(e) => {
																									this.handleFileChange(
																										e,
																										props,
																									);
																								}}
																							/>
																						</div>
																					)}
																				/>
																				{this.state.fileName && (
																					<div>
																						<i
																							className="fa fa-close"
																							onClick={() =>
																								this.setState({
																									fileName: '',
																								})
																							}
																						></i>{' '}
																						{this.state.fileName}
																					</div>
																				)}
																				{props.errors.attachmentFile &&
																					props.touched.attachmentFile && (
																						<div className="invalid-file">
																							{props.errors.attachmentFile}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<FormGroup className="mb-3">
																		<Label htmlFor="receiptAttachmentDescription">
																			Attachment Description
																		</Label>
																		<Input
																			type="textarea"
																			maxLength="255"
																			name="receiptAttachmentDescription"
																			id="receiptAttachmentDescription"
																			rows="5"
																			placeholder="Receipt Attachment Description"
																			onChange={(option) =>
																				props.handleChange(
																					'receiptAttachmentDescription',
																				)(option)
																			}
																			value={
																				props.values
																					.receiptAttachmentDescription
																			}
																		/>
																	</FormGroup>
																</Col>

																<Col lg={4}>
																	<div className="">
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<FormGroup>
																						<Label htmlFor="discountType">
																							Discount Type
																						</Label>
																						<Select
																							styles={customStyles}
																							className="select-default-width"
																							options={discountOptions}
																							id="discountType"
																							name="discountType"
																							value={props.values.discountType}
																							onChange={(item) => {
																								props.handleChange(
																									'discountType',
																								)(item);
																								props.handleChange(
																									'discountPercentage',
																								)('');
																								props.setFieldValue(
																									'discount',
																									0,
																								);
																								this.setState(
																									{
																										discountPercentage: '',
																										discountAmount: 0,
																									},
																									() => {
																										this.updateAmount(
																											this.state.data,
																											props,
																										);
																									},
																								);
																							}}
																						/>
																					</FormGroup>
																				</Col>
																				{props.values.discountType.value ===
																				'PERCENTAGE' ? (
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="discountPercentage">
																								Percentage
																							</Label>
																							<div className="discountPercent">
																							<Input
																								id="discountPercentage"
																								name="discountPercentage"
																								placeholder="Discount Percentage"
																								type="number"
																								maxLength="5"
																								value={
																									props.values
																										.discountPercentage
																								}
																								onChange={(e) => {
																									if (
																										e.target.value === '' ||
																										this.regDecimal.test(
																											e.target.value,
																										)
																									) {
																										props.handleChange(
																											'discountPercentage',
																										)(e);
																										this.setState(
																											{
																												discountPercentage:
																													e.target.value,
																											},
																											() => {
																												this.updateAmount(
																													this.state.data,
																													props,
																												);
																											},
																										);
																									}
																								}}
																							/><span className="percentSymbol">%</span></div>
																						</FormGroup>
																					</Col>
																				) : null}
																			</Row>
																			<Row>
																				<Col lg={6} className="mt-4">
																					<FormGroup>
																						<Label htmlFor="discount">
																							Discount Amount
																						</Label>
																						<Input
																							id="discount"
																							name="discount"
																							type="number"
																							maxLength="7"
																							disabled={
																								props.values.discountType &&
																								props.values.discountType
																									.value === 'Percentage'
																									? true
																									: false
																							}
																							placeholder="Discount Amounts"
																							value={props.values.discount}
																							onChange={(option) => {
																								if (
																									option.target.value === '' ||
																									this.regDecimal.test(
																										option.target.value,
																									)
																								) {
																									props.handleChange(
																										'discount',
																									)(option);
																									this.setState(
																										{
																											discountAmount: +option
																												.target.value,
																										},
																										() => {
																											this.updateAmount(
																												this.state.data,
																												props,
																											);
																										},
																									);
																								}
																							}}
																						/>
																					</FormGroup>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						Total Net
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={initValue.total_net.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{/* {this.state.supplier_currency_symbol} */}
																						{initValue.total_net.toFixed(
																									2,
																								)}
																					</label>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						Total Vat
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={initValue.invoiceVATAmount.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{/* {this.state.supplier_currency_symbol} */}
																						{initValue.invoiceVATAmount.toFixed(
																									2,
																								)}
																					</label>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						Discount
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={this.state.initValue.discount.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{/* {this.state.supplier_currency_symbol} */}
																						{this.state.initValue.discount.toFixed(
																									2,
																								)}
																					</label>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						Total
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={initValue.totalAmount.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{/* {this.state.supplier_currency_symbol} */}
																						{initValue.totalAmount.toFixed(
																									2,
																								)}
																					</label>
																				</Col>
																			</Row>
																		</div>
																	</div>
																</Col>
															</Row>
														) : null}
														<Row>
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right">
																<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			this.setState(
																				{ createMore: false },
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		{this.state.disabled
																			? 'Creating...'
																			: 'Create'}
																	</Button>
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			this.setState(
																				{ createMore: true },
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-repeat mr-1"></i>
																		{this.state.disabled
																			? 'Creating...'
																			: 'Create & More'}
																	</Button>
																	<Button
																		type="button"
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/expense/supplier-invoice',
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
				</div>
				<SupplierModal
					openSupplierModal={this.state.openSupplierModal}
					closeSupplierModal={(e) => {
						this.closeSupplierModal(e);
					}}
					getCurrentUser={(e) => this.getCurrentUser(e)}
					createSupplier={this.props.supplierInvoiceActions.createSupplier}
					getStateList={this.props.supplierInvoiceActions.getStateList}
					currency_list={this.props.currency_convert_list}
					country_list={this.props.country_list}
				/>
				<ProductModal
					openProductModal={this.state.openProductModal}
					closeProductModal={(e) => {
						this.closeProductModal(e);
					}}
					getCurrentProduct={(e) => this.getCurrentProduct(e)}
					createProduct={this.props.ProductActions.createAndSaveProduct}
					vat_list={this.props.vat_list}
					product_category_list={this.props.product_category_list}
					salesCategory={this.state.salesCategory}
					purchaseCategory={this.state.purchaseCategory}
				/>
					{/* <InvoiceNumberModel
					openInvoiceNumberModel={this.state.openInvoiceNumberModel}
					closeInvoiceNumberModel={(e) => {
						this.closeInvoiceNumberModel(e);
					}}
					getCurrentNumber={(e) => this.getCurrentNumber(e)}
					prefix ={this.state.prefixData}
					updatePrefix={this.props.customerInvoiceActions.updateInvoicePrefix}
					
				/> */}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateSupplierInvoice);
