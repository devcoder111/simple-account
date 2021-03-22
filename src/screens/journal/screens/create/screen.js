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
	Badge,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import { Currency } from 'components';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory } from 'utils';
import * as JournalActions from '../../actions';
import * as JournalCreateActions from './actions';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import './style.scss';

const mapStateToProps = (state) => {
	return {
		transaction_category_list: state.journal.transaction_category_list,
		currency_list: state.journal.currency_list,
		contact_list: state.journal.contact_list,
		vat_list: state.journal.vat_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		journalActions: bindActionCreators(JournalActions, dispatch),
		journalCreateActions: bindActionCreators(JournalCreateActions, dispatch),
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

class CreateJournal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			createMore: false,
			data: [
				{
					id: 0,
					description: '',
					transactionCategoryId: '',
					contactId: '',
					debitAmount: 0,
					creditAmount: 0,
				},
				{
					id: 1,
					description: '',
					transactionCategoryId: '',
					contactId: '',
					debitAmount: 0,
					creditAmount: 0,
				},
			],
			idCount: 1,
			initValue: {
				journalDate: new Date(),
				journalReferenceNo: '',
				description: '',
				currencyCode: '',
				subTotalDebitAmount: 0,
				totalDebitAmount: 0,
				totalCreditAmount: 0,
				subTotalCreditAmount: 0,
				temp: false,
				journalLineItems: [
					{
						id: 0,
						description: '',
						transactionCategoryId: '',
						contactId: '',
						debitAmount: 0,
						creditAmount: 0,
					},
					{
						id: 1,
						description: '',
						transactionCategoryId: '',
						contactId: '',
						debitAmount: 0,
						creditAmount: 0,
					},
				],
			},
			submitJournal: false,
		};

		this.formRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.journalActions.getContactList();
		this.props.journalActions.getCurrencyList().then((response) => {
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
			this.formRef.current.setFieldValue(
				'currencyCode',
				response.data[0].currencyCode,
				true,
			);
		});
		this.props.journalActions.getTransactionCategoryList();
	};

	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon"
				disabled={this.state.data.length <= 2 ? true : false}
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

	renderAccount = (cell, row, props) => {
		const { transaction_category_list } = this.props;
		console.log(transaction_category_list);
		let transactionCategoryList =
			transaction_category_list && transaction_category_list.length
				? [
						{
							transactionCategoryId: '',
							transactionCategoryName: 'Select Account',
						},
						...transaction_category_list,
				  ]
				: transaction_category_list;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			// <Field
			// 	name={`journalLineItems.${idx}.transactionCategoryId`}
			// 	render={({ field, form }) => (
			// 		<Input
			// 			styles={customStyles}
			// 			type="select"
			// 			onChange={(e) => {
			// 				this.selectItem(e, row, 'transactionCategoryId', form, field);
			// 			}}
			// 			value={row.transactionCategoryId}
			// 			className={`form-control
			//       ${
			// 				props.errors.journalLineItems &&
			// 				props.errors.journalLineItems[parseInt(idx, 10)] &&
			// 				props.errors.journalLineItems[parseInt(idx, 10)]
			// 					.transactionCategoryId &&
			// 				Object.keys(props.touched).length > 0 &&
			// 				props.touched.journalLineItems &&
			// 				props.touched.journalLineItems[parseInt(idx, 10)] &&
			// 				props.touched.journalLineItems[parseInt(idx, 10)]
			// 					.transactionCategoryId
			// 					? 'is-invalid'
			// 					: ''
			// 			}`}
			// 		>
			// 			{transactionCategoryList
			// 				? transactionCategoryList.map((obj) => {
			// 						return (
			// 							<option
			// 								value={obj.transactionCategoryId}
			// 								key={obj.transactionCategoryId}
			// 							>
			// 								{obj.transactionCategoryName}
			// 							</option>
			// 						);
			// 				  })
			// 				: ''}
			// 		</Input>
			// 	)}
			// />

			<Field
				name={`journalLineItems.${idx}.transactionCategoryId`}
				render={({ field, form }) => (
					<Select
						styles={{
							menu: (provided) => ({ ...provided, zIndex: 9999 }),
						}}
						options={transactionCategoryList ? transactionCategoryList : []}
						id="transactionCategoryId"
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'transactionCategoryId',
								form,
								field,
							);
						}}
						placeholder="Select Account"
						className={`${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)]
								.transactionCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)]
								.transactionCategoryId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
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
				name={`journalLineItems.${idx}.description`}
				render={({ field, form }) => (
					<Input
						type="text"
						maxLength="100"
						value={row['description'] !== '' ? row['description'] : ''}
						onChange={(e) => {
							this.selectItem(e.target.value, row, 'description', form, field);
						}}
						placeholder="Description"
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].description &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].description
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderContact = (cell, row, props) => {
		const { contact_list } = this.props;
		console.log(contact_list)
		let contactList = contact_list.length
			? [{ value: '', label: 'Select Contact' }, ...contact_list]
			: contact_list;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`journalLineItems.${idx}.contactId`}
				render={({ field, form }) => (
					<Input
						type="select"
						onChange={(e) => {
							this.selectItem(e.target.value, row, 'contactId', form, field);
						}}
						value={row.contactId}
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].contactId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].contactId
								? 'is-invalid'
								: ''
						}`}
					>
						{contactList
							? contactList.map((obj) => {
									return (
										<option value={obj.value} key={obj.value}>
											{obj.label.contactName}
										</option>
									);
							  })
							: ''}
					</Input>
				)}
			/>
		);
	};

	renderDebits = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`journalLineItems.${idx}.debitAmount`}
				render={({ field, form }) => (
					<Input
					type="number"
					maxLength="9"
						value={row['debitAmount'] !== 0 ? row['debitAmount'] : 0}
						onChange={(e) => {
							if (
								e.target.value === '' ||
								this.regDecimal.test(e.target.value)
							) {
								this.selectItem(
									e.target.value,
									row,
									'debitAmount',
									form,
									field,
								);
							}
						}}
						placeholder="Debit Amount"
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].debitAmount &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].debitAmount
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderCredits = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`journalLineItems.${idx}.creditAmount`}
				render={({ field, form }) => (
					<Input
					type="number"
					maxLength="9"
						value={row['creditAmount'] !== 0 ? row['creditAmount'] : 0}
						onChange={(e) => {
							if (
								e.target.value === '' ||
								this.regDecimal.test(e.target.value)
							) {
								this.selectItem(
									e.target.value,
									row,
									'creditAmount',
									form,
									field,
								);
							}
						}}
						placeholder="Credit Amount"
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].creditAmount &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].creditAmount
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	addRow = () => {
		const data = [...this.state.data];
		this.setState(
			{
				data: data.concat({
					id: this.state.idCount + 1,
					description: '',
					transactionCategoryId: '',
					contactId: '',
					debitAmount: 0,
					creditAmount: 0,
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
				this.formRef.current.setFieldValue(
					'journalLineItems',
					this.state.data,
					true,
				);
				this.formRef.current.setFieldTouched(
					`journalLineItems[${this.state.data.length - 1}]`,
					false,
					true,
				);
			},
		);
	};

	selectItem = (e, row, name, form, field) => {
		//e.preventDefault();
		let idx;
		const data = this.state.data;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				if (name === 'debitAmount') {
					obj[`${name}`] = e;
					obj['creditAmount'] = 0;
				} else if (name === 'creditAmount') {
					obj[`${name}`] = e;
					obj['debitAmount'] = 0;
				} else {
					obj[`${name}`] = e;
				}
				idx = index;
			}
			return obj;
		});
		if (name === 'debitAmount') {
			form.setFieldValue(`journalLineItems.[${idx}].creditAmount`, 0, true);
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			this.updateAmount(data);
		} else if (name === 'creditAmount') {
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			form.setFieldValue(`journalLineItems.[${idx}].debitAmount`, 0, true);
			this.updateAmount(data);
		} else {
			this.setState({ data }, () => {
				this.formRef.current.setFieldValue(
					field.name,
					this.state.data[parseInt(idx, 10)][`${name}`],
					true,
				);
			});
		}
	};

	deleteRow = (e, row, props) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const data = this.state.data;
		newData = data.filter((obj) => obj.id !== id);
		props.setFieldValue('journalLineItems', newData, true);
		this.updateAmount(newData);
	};

	updateAmount = (data) => {
		let subTotalDebitAmount = 0;
		let subTotalCreditAmount = 0;
		// let totalDebitAmount = 0;
		// let totalCreditAmount = 0;

		data.map((obj) => {
			if (obj.debitAmount || obj.creditAmount) {
				subTotalDebitAmount = subTotalDebitAmount + +obj.debitAmount;
				subTotalCreditAmount = subTotalCreditAmount + +obj.creditAmount;
			}
			return obj;
		});

		this.setState({
			data,
			initValue: {
				...this.state.initValue,
				...{
					subTotalDebitAmount,
					totalDebitAmount: subTotalDebitAmount,
					totalCreditAmount: subTotalCreditAmount,
					subTotalCreditAmount,
				},
			},
		});
	};

	handleSubmit = (values, resetForm) => {
		const { data, initValue } = this.state;
		if (initValue.totalCreditAmount === initValue.totalDebitAmount) {
			data.map((item) => {
				delete item.id;
				item.transactionCategoryId = item.transactionCategoryId
					? item.transactionCategoryId
					: '';
				item.contactId = item.contactId ? item.contactId : '';

				return item;
			});
			const postData = {
				journalDate: values.journalDate ? values.journalDate : '',
				journalReferenceNo: values.journalReferenceNo
					? values.journalReferenceNo
					: '',
				description: values.description ? values.description : '',
				currencyCode: values.currencyCode ? values.currencyCode : '',
				subTotalCreditAmount: initValue.subTotalCreditAmount,
				subTotalDebitAmount: initValue.subTotalDebitAmount,
				totalCreditAmount: initValue.totalCreditAmount,
				totalDebitAmount: initValue.totalDebitAmount,
				journalLineItems: data,
			};
			this.props.journalCreateActions
				.createJournal(postData)
				.then((res) => {
					if (res.status === 200) {
						this.props.commonActions.tostifyAlert(
							'success',
							'New Journal Created Successfully',
						);
						if (this.state.createMore) {
							this.setState(
								{
									createMore: false,
									submitJournal: false,
									data: [
										{
											id: 0,
											description: '',
											transactionCategoryId: '',
											contactId: '',
											debitAmount: 0,
											creditAmount: 0,
										},
										{
											id: 1,
											description: '',
											transactionCategoryId: '',
											contactId: '',
											debitAmount: 0,
											creditAmount: 0,
										},
									],
									initValue: {
										...this.state.initValue,
										...{
											journalLineItems: [
												{
													id: 0,
													description: '',
													transactionCategoryId: '',
													contactId: '',
													debitAmount: 0,
													creditAmount: 0,
												},
												{
													id: 1,
													description: '',
													transactionCategoryId: '',
													contactId: '',
													debitAmount: 0,
													creditAmount: 0,
												},
											],
											subTotalDebitAmount: 0,
											totalDebitAmount: 0,
											totalCreditAmount: 0,
											subTotalCreditAmount: 0,
										},
									},
								},
								() => {
									resetForm(this.state.initValue);
								},
							);
						} else {
							this.props.history.push('/admin/accountant/journal');
						}
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		}
	};

	render() {
		const { data, initValue } = this.state;
		const { currency_list,universal_currency_list } = this.props;

		return (
			<div className="create-journal-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa fa-diamond" />
												<span className="ml-2">Create Journal</span>
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
												}}
												validationSchema={Yup.object().shape({
													journalDate: Yup.date().required(
														'Journal Date is Required',
													),
													journalLineItems: Yup.array()
														.of(
															Yup.object().shape({
																transactionCategoryId: Yup.string().required(
																	'Account is required',
																),
																debitAmount: Yup.number().required(),
																creditAmount: Yup.number().required(),
															}),
														)
														.min(
															2,
															'Atleast Two Journal Debit and Credit Details is mandatory',
														),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">
																		<span className="text-danger">*</span>
																		Journal Date
																	</Label>
																	<DatePicker
																		id="journalDate"
																		name="journalDate"
																		placeholderText="Journal Date"
																		selected={props.values.journalDate}
																		showMonthDropdown
																		showYearDropdown
																		dateFormat="dd/MM/yyyy"
																		dropdownMode="select"
																		onChange={(value) => {
																			props.handleChange('journalDate')(value);
																		}}
																		autoComplete="off"
																		className={`form-control ${
																			props.errors.journalDate &&
																			props.touched.journalDate
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.journalDate &&
																	props.touched.journalDate ? (
																		<div className="invalid-feedback">
																			{props.errors.journalDate}
																		</div>
																	) : null}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="journalReferenceNo">
																		Journal Reference #
																	</Label>
																	<Input
																		type="text"
																		maxLength="20"
																		id="journalReferenceNo"
																		name="journalReferenceNo"
																		placeholder="Reference Number"
																		value={
																			props.values.journalReferenceNo || ''
																		}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExBoth.test(option.target.value)
																			) {
																				props.handleChange(
																					'journalReferenceNo',
																				)(option);
																			}
																		}}
																	/>
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={8}>
																<FormGroup className="mb-3">
																	<Label htmlFor="description">Notes</Label>
																	<Input
																		type="textarea"
																		maxLength="255"
																		name="description"
																		id="description"
																		rows="5"
																		placeholder="Notes"
																		value={props.values.description || ''}
																		onChange={(value) => {
																			props.handleChange('description')(value);
																		}}
																	/>
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="currencyCode">Currency</Label>
																	<Select
																		styles={customStyles}
																		className="select-default-width"
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
																		id="currencyCode"
																		name="currencyCode"
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
																						+props.values.currencyCode,
																				)
																		}
																		isDisabled={
																			props.values.postingReferenceType ===
																			'MANUAL'
																				? false
																				: true
																		}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('currencyCode')(
																					option,
																				);
																			} else {
																				props.handleChange('currencyCode')('');
																			}
																		}}
																	/>
																</FormGroup>
															</Col>
														</Row>
														<hr />
														<Row>
															<Col lg={12} className="mb-3">
																<Button
																	color="primary"
																	className="btn-square mr-3"
																	onClick={this.addRow}
																>
																	<i className="fa fa-plus"></i> Add More
																</Button>
															</Col>
														</Row>
														{props.errors.journalLineItems &&
															typeof props.errors.journalLineItems ===
																'string' && (
																<div
																	className={
																		props.errors.journalLineItems
																			? 'is-invalid'
																			: ''
																	}
																>
																	<div className="invalid-feedback">
																		<Badge
																			color="danger"
																			style={{
																				padding: '10px',
																				marginBottom: '5px',
																			}}
																		>
																			{props.errors.journalLineItems}
																		</Badge>
																	</div>
																</div>
															)}
														{this.state.submitJournal &&
															this.state.initValue.totalCreditAmount.toFixed(
																2,
															) !==
																this.state.initValue.totalDebitAmount.toFixed(
																	2,
																) && (
																<div
																	className={
																		this.state.initValue.totalDebitAmount !==
																		this.state.initValue.totalCreditAmount
																			? 'is-invalid'
																			: ''
																	}
																>
																	<div className="invalid-feedback">
																		<Badge
																			color="danger"
																			style={{
																				padding: '10px',
																				marginBottom: '5px',
																			}}
																		>
																			*Total Credit Amount and Total Debit
																			Amount Should be Equal
																		</Badge>
																	</div>
																</div>
															)}
														<Row>
															<Col lg={12}>
																<BootstrapTable
																	options={this.options}
																	data={data}
																	version="4"
																	hover
																	keyField="id"
																	className="journal-create-table"
																>
																	<TableHeaderColumn
																		width="55"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderActions(cell, rows, props)
																		}
																	></TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="transactionCategoryId"
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
																		dataField="contactId"
																		dataFormat={(cell, rows) =>
																			this.renderContact(cell, rows, props)
																		}
																	>
																		Contact
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="debitAmount"
																		dataFormat={(cell, rows) =>
																			this.renderDebits(cell, rows, props)
																		}
																	>
																		Debit
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="creditAmount"
																		dataFormat={(cell, rows) =>
																			this.renderCredits(cell, rows, props)
																		}
																	>
																		Credit
																	</TableHeaderColumn>
																</BootstrapTable>
															</Col>
														</Row>

														{this.state.data.length > 0 ? (
															<Row>
																<Col lg={4} className="ml-auto">
																	<div className="total-item p-2">
																		<Row>
																			<Col xs={4}></Col>
																			<Col xs={4}>
																				<h5 className="mb-0 text-right">
																					Debit
																				</h5>
																			</Col>
																			<Col xs={4}>
																				<h5 className="mb-0 text-right">
																					Credit
																				</h5>
																			</Col>
																		</Row>
																	</div>
																	<div className="total-item p-2">
																		<Row>
																			<Col xs={4}>
																				<h5 className="mb-0 text-right">
																					Sub Total
																				</h5>
																			</Col>
																			<Col xs={4} className="text-right">
																				<label className="mb-0">
																				{universal_currency_list[0] && (
																						<Currency
																						value=
																						{this.state.initValue.subTotalDebitAmount.toFixed(
																							2,
																						)}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																				</label>
																			</Col>
																			<Col xs={4} className="text-right">
																				<label className="mb-0">
																				{universal_currency_list[0] && (
																						<Currency
																						value=
																						{this.state.initValue.subTotalCreditAmount.toFixed(
																							2,
																						)}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																				</label>
																			</Col>
																		</Row>
																	</div>
																	<div className="total-item p-2">
																		<Row>
																			<Col xs={4}>
																				<h5 className="mb-0 text-right">
																					Total
																				</h5>
																			</Col>
																			<Col xs={4} className="text-right">
																				<label className="mb-0">
																				{universal_currency_list[0] && (
																						<Currency
																						value=
																						{this.state.initValue.subTotalDebitAmount.toFixed(
																							2,
																						)}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																				</label>
																			</Col>
																			<Col xs={4} className="text-right">
																				<label className="mb-0">
																				{universal_currency_list[0] && (
																						<Currency
																						value=
																						{this.state.initValue.subTotalCreditAmount.toFixed(
																							2,
																						)}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																				</label>
																			</Col>
																		</Row>
																	</div>
																</Col>
															</Row>
														) : null}

														<Row>
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right form-action-btn">
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		onClick={() => {
																			this.setState(
																				{
																					createMore: false,
																					submitJournal: true,
																				},
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		Create
																	</Button>
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		onClick={() => {
																			this.setState(
																				{
																					createMore: true,
																					submitJournal: true,
																				},
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-repeat"></i> Create and
																		More
																	</Button>
																	<Button
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/accountant/journal',
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
			</div>
		);
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateJournal);
