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
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import { CommonActions } from 'services/global';
import { selectCurrencyFactory } from 'utils';
import * as JournalActions from '../../actions';
import * as JournalDetailActions from './actions';
import { Loader, ConfirmDeleteModal, Currency } from 'components';

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
		cancel_flag: state.journal.cancel_flag
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		journalActions: bindActionCreators(JournalActions, dispatch),
		journalDetailActions: bindActionCreators(JournalDetailActions, dispatch),
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

class DetailJournal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			current_journal_id: null,
			initValue: {},
			data: [],
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
		if (this.props.location.state && this.props.location.state.id) {
			this.props.journalDetailActions
				.getJournalById(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.props.journalActions.getCurrencyList();
						this.props.journalActions.getTransactionCategoryList();
						this.props.journalActions.getContactList();
						this.setState(
							{
								loading: false,
								current_journal_id: this.props.location.state.id,
								initValue: {
									journalId: res.data.journalId,
									journalDate: res.data.journalDate ? res.data.journalDate : '',
									journalReferenceNo: res.data.journalReferenceNo
										? res.data.journalReferenceNo
										: '',
									description: res.data.description ? res.data.description : '',
									currencyCode: res.data.currencyCode
										? res.data.currencyCode
										: '',
									subTotalDebitAmount: res.data.subTotalDebitAmount
										? res.data.subTotalDebitAmount
										: 0,
									totalDebitAmount: res.data.totalDebitAmount
										? res.data.totalDebitAmount
										: 0,
									totalCreditAmount: res.data.totalCreditAmount
										? res.data.totalCreditAmount
										: 0,
									subTotalCreditAmount: res.data.subTotalCreditAmount
										? res.data.subTotalCreditAmount
										: 0,
									journalLineItems: res.data.journalLineItems
										? res.data.journalLineItems
										: [],
									postingReferenceType: res.data.postingReferenceType
										? res.data.postingReferenceType
										: '',
								},
								data: res.data.journalLineItems
									? res.data.journalLineItems
									: [],
							},
							() => {
								const { data } = this.state;
								const idCount =
									data.length > 0
										? Math.max.apply(
												Math,
												data.map((item) => {
													return item.id;
												}),
										  )
										: 0;
								this.setState({
									idCount,
								});
							},
						);
					}
				})
				.catch((err) => {
					this.setState({ loading: false });
				});
		} else {
			this.props.history.push('/admin/accountant/journal');
		}
	};

	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				disabled={
					props.values.postingReferenceType === 'MANUAL' ||
					this.state.data.length > 2
						? false
						: true
				}
				className="btn-twitter btn-brand icon"
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
		let transactionCategoryList =
			transaction_category_list &&
			transaction_category_list &&
			transaction_category_list.length
				? [
						{
							transactionCategoryId: '',
							transactionCategoryName: 'Select Account',
						},
						...transaction_category_list,
				  ]
				: [];
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
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
						value={
							transactionCategoryList &&
							transactionCategoryList.length > 0 &&
							row.journalTransactionCategoryLabel
								? transactionCategoryList
										.find(
											(item) =>
												item.label === row.journalTransactionCategoryLabel,
												(item) => item.value === +row.transactionCategoryId,
										)
								: row.transactionCategoryId
						}
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
						value={row['description'] !== '' ? row['description'] : ''}
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
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
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
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
						value={row['debitAmount'] !== 0 ? row['debitAmount'] : 0}
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
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
						value={row['creditAmount'] !== 0 ? row['creditAmount'] : 0}
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
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
			},
		);
	};

	selectItem = (e, row, name, form, field) => {
		//	e.preventDefault();
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

	deleteJournal = () => {
		const message1 =
			<text>
			<b>Delete Journal?</b>
			</text>
			const message = 'This Journal will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeJournal}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeJournal = () => {
		const { current_journal_id } = this.state;
		this.props.journalDetailActions
			.deleteJournal(current_journal_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Journal Deleted Successfully',
					);
					this.props.history.push('/admin/accountant/journal');
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

	handleSubmit = (values) => {
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
				journalId: values.journalId,
				journalDate: values.journalDate ? values.journalDate : '',
				journalReferenceNo: values.journalReferenceNo
					? values.journalReferenceNo
					: '',
				description: values.description ? values.description : '',
				currencyCode: values.currencyCode ? values.currencyCode.value : '',
				subTotalCreditAmount: initValue.subTotalCreditAmount,
				subTotalDebitAmount: initValue.subTotalDebitAmount,
				totalCreditAmount: initValue.totalCreditAmount,
				totalDebitAmount: initValue.totalDebitAmount,
				journalLineItems: data,
			};
			this.props.journalDetailActions
				.updateJournal(postData)
				.then((res) => {
					if (res.status === 200) {
						this.props.commonActions.tostifyAlert(
							'success',
							'Journal Updated Successfully',
						);
						this.props.history.push('/admin/accountant/journal');
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
		const { data, initValue, dialog, loading } = this.state;
		const { currency_list,universal_currency_list } = this.props;

		return (
			<div className="detail-journal-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa fa-diamond" />
												<span className="ml-2">Update Journal</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={initValue}
													ref={this.formRef}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
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
																			className="form-control"
																			id="journalDate"
																			name="journalDate"
																			placeholderText="Journal Date"
																			disabled={
																				props.values.postingReferenceType ===
																				'MANUAL'
																					? false
																					: true
																			}
																			showMonthDropdown
																			showYearDropdown
																			dateFormat="dd/MM/yyyy"
																			dropdownMode="select"
																			autoComplete="off"
																			value={
																				props.values.journalDate
																					? moment(
																							props.values.journalDate,
																					  ).format('DD-MM-YYYY')
																					: ''
																			}
																			onChange={(value) => {
																				props.handleChange('journalDate')(
																					value,
																				);
																			}}
																		/>
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
																			id="journalReferenceNo"
																			name="journalReferenceNo"
																			disabled={
																				props.values.postingReferenceType ===
																				'MANUAL'
																					? false
																					: true
																			}
																			placeholder="Reference Number"
																			value={props.values.journalReferenceNo}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExBoth.test(
																						option.target.value,
																					)
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
																			name="description"
																			id="description"
																			rows="5"
																			disabled={
																				props.values.postingReferenceType ===
																				'MANUAL'
																					? false
																					: true
																			}
																			placeholder="1024 characters..."
																			value={props.values.description}
																			onChange={(value) => {
																				props.handleChange('description')(
																					value,
																				);
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="currencyCode">
																			Currency
																		</Label>
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
																			isDisabled={
																				props.values.postingReferenceType ===
																				'MANUAL'
																					? false
																					: true
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
																							+props.values.currencyCode,
																					)
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange('currencyCode')(
																						option,
																					);
																				} else {
																					props.handleChange('currencyCode')(
																						'',
																					);
																				}
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															{props.values.postingReferenceType ===
																'MANUAL' && <hr />}
															<Row>
																<Col lg={12} className="mb-3">
																	{props.values.postingReferenceType ===
																		'MANUAL' && (
																		<Button
																			color="primary"
																			className="btn-square mr-3"
																			onClick={this.addRow}
																		>
																			<i className="fa fa-plus"></i> Add More
																		</Button>
																	)}
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
																			width="20%"
																			dataFormat={(cell, rows) =>
																				this.renderAccount(cell, rows, props)
																			}
																		>
																			Account
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="description"
																			dataFormat={(cell, rows) =>
																				this.renderDescription(
																					cell,
																					rows,
																					props,
																				)
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
																			Debits
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="creditAmount"
																			dataFormat={(cell, rows) =>
																				this.renderCredits(cell, rows, props)
																			}
																		>
																			Credits
																		</TableHeaderColumn>
																	</BootstrapTable>
																</Col>
															</Row>
															{data.length > 0 ? (
																<Row>
																	<Col lg={4} className="ml-auto">
																		<div className="total-item p-2">
																			<Row>
																				<Col xs={4}></Col>
																				<Col xs={4}>
																					<h5 className="mb-0 text-right">
																						Debits
																					</h5>
																				</Col>
																				<Col xs={4}>
																					<h5 className="mb-0 text-right">
																						Credits
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
																						value={
																							this.state.initValue
																								.subTotalDebitAmount
																						}
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
																						value={
																							this.state.initValue
																								.subTotalCreditAmount
																						}
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
																						value={
																							this.state.initValue
																								.subTotalDebitAmount
																						}
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
																						value={
																							this.state.initValue
																								.subTotalCreditAmount
																						}
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
																<Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																>
																	<FormGroup>
																		{props.values.postingReferenceType ===
																			'MANUAL' && (
																			<Button
																				type="button"
																				color="danger"
																				className="btn-square"
																				disabled={
																					props.values.postingReferenceType ===
																					'MANUAL'
																						? false
																						: true
																				}
																				onClick={this.deleteJournal}
																			>
																				<i className="fa fa-trash"></i> Delete
																			</Button>
																		)}
																	</FormGroup>
																	<FormGroup className="text-right">
																		{props.values.postingReferenceType ===
																			'MANUAL' && (
																			<Button
																				type="button"
																				color="primary"
																				disabled={
																					props.values.postingReferenceType ===
																					'MANUAL'
																						? false
																						: true
																				}
																				className="btn-square mr-3"
																				onClick={() => {
																					this.setState(
																						{
																							submitJournal: true,
																						},
																						() => {
																							props.handleSubmit();
																						},
																					);
																				}}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				Update
																			</Button>
																		)}
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.journalActions.setCancelFlag(true);
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
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailJournal);
