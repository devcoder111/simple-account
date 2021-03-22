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
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as ImportTransactionActions from './actions';
import { selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';

import { Loader } from 'components';

const mapStateToProps = (state) => {
	return {
		date_format_list: state.import_transaction.date_format_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		importTransactionActions: bindActionCreators(
			ImportTransactionActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ImportTransaction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initialloading: true,
			initValue: {
				name: '',
				copy_saved_congiguration: '',
				skipRows: '',
				headerRowNo: '',
				textQualifier: '',
				dateFormatId: '',
				delimiter: '',
				otherDilimiterStr: '',
			},
			delimiterList: [],
			fileName: '',
			tableHeader: [],
			loading: false,
			selectedValue: [],
			selectedValueDropdown: [],
			tableDataKey: [],
			tableData: [],
			columnStatus: [],
			selectedDelimiter: '',
			selectedDateFormat: '',
			configurationList: [],
			selectedConfiguration: '',
			selectError: [],
			error: {},
		};

		this.formRef = React.createRef();

		this.options = {
			paginationPosition: 'top',
		};
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		console.log('transaction');
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			this.props.importTransactionActions.getDateFormatList();
			this.props.importTransactionActions.getConfigurationList().then((res) => {
				this.setState({
					configurationList: res.data,
				});
			});

			this.props.importTransactionActions.getDelimiterList().then((res) => {
				this.setState(
					{
						delimiterList: res.data,
						selectedDelimiter: res.data[1].value,
					},
					() => {
						this.setState({
							initialloading: false,
						});
					},
				);
			});
		} else {
			this.props.history('/admin/banking/bank-account');
		}
	};

	validateForm = () => {
		const { initValue, fileName } = this.state;
		let temp = {};
		for (let val in initValue) {
			if (initValue.hasOwnProperty(val)) {
				if (val === 'name' && !initValue['name']) {
					temp['name'] = '*Template Name is Required';
				}
				if (val === 'dateFormatId' && !initValue['dateFormatId']) {
					temp['dateFormatId'] = '*Date Format is Required';
				}
			}
		}
		if (!fileName) {
			temp['file'] = '*Please Provide a Sample';
		}
		this.setState({
			error: temp,
		});
		if (Object.keys(temp).length) {
			return false;
		} else {
			return true;
		}
	};

	handleApply = (value, resetForm) => {
		if (this.validateForm()) {
			const { initValue } = this.state;
			initValue['delimiter'] = this.state.selectedDelimiter;
			this.setState({ tableHeader: [], loading: true });
			let formData = new FormData();
			formData.append(
				'delimiter',
				initValue.delimiter ? initValue.delimiter : '',
			);
			formData.append(
				'headerRowNo ',
				initValue.headerRowNo ? initValue.headerRowNo : '',
			);
			formData.append(
				'dateFormatId',
				initValue.dateFormatId ? initValue.dateFormatId : '',
			);
			formData.append('skipRows', initValue.skipRows ? initValue.skipRows : '');
			formData.append(
				'textQualifier',
				initValue.textQualifier ? initValue.textQualifier : '',
			);
			formData.append(
				'otherDilimiterStr',
				initValue.otherDilimiterStr ? initValue.otherDilimiterStr : '',
			);
			if (this.uploadFile.files[0]) {
				formData.append('file', this.uploadFile.files[0]);
			}
			this.props.importTransactionActions
				.parseFile(formData)
				.then((res) => {
					if (res.status === 200) {
						// this.props.commonActions.tostifyAlert('success', 'New Configuration Created Successfully')
						this.props.importTransactionActions
							.getTableDataList(formData)
							.then((res) => {
								this.setState(
									{
										tableData: [...res.data],
										tableDataKey: res.data[0] ? Object.keys(res.data[0]) : [],
									},
									() => {
										let obj = { label: 'Select', value: '' };
										let tempObj = { label: '', status: false };
										let tempStatus = [...this.state.columnStatus];
										let tempDropDown = [...this.state.selectedValueDropdown];
										let tempError = [...this.state.selectError];
										this.state.tableDataKey.map((val, index) => {
											tempStatus.push(tempObj);
											tempDropDown.push(obj);
											tempError.push(false);

											return val;
										});
										this.setState({
											loading: false,
											selectedValueDropdown: tempDropDown,
											columnStatus: tempStatus,
											selectError: tempError,
										});
									},
								);
							})
							.catch((err) => {
								this.props.commonActions.tostifyAlert(
									'error',
									err && err.data ? err.data.message : 'Something Went Wrong',
								);
								this.setState({ loading: false });
							});
						this.props.importTransactionActions
							.getTableHeaderList(formData)
							.then((res) => {
								let temp = [...res.data];
								// temp.unshift({ label: 'Select', value: '' })
								this.setState({
									tableHeader: this.state.tableHeader.concat(res.data),
									selectedValue: this.state.tableHeader.concat(temp),
								});
							});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.setState({ loading: false });
				});
		}
	};

	handleChange = (e, index) => {
		let tempDataSelectedValueDropdown = this.state.selectedValueDropdown;
		let tempStatus = [...this.state.columnStatus];
		let status = tempDataSelectedValueDropdown.filter(
			(item) => item.value === e.value && e.value !== '',
		);
		if (status.length > 0) {
			tempStatus[`${index}`] = { label: `${e.value}`, status: true };
			// tempDataSelectedValueDropdown[`${index}`] = { label: `Select`, value: '' }
			if (tempDataSelectedValueDropdown[`${index}`].value !== e.value) {
				this.setState({
					columnStatus: tempStatus,
					selectedValueDropdown: tempDataSelectedValueDropdown,
				});
			}
		} else if (e.value === '') {
			let val = tempDataSelectedValueDropdown[`${index}`].value;
			let multiSelected = [];
			tempStatus
				.map((item) => item.label)
				.reduce(function (a, e, i) {
					if (e === val) {
						multiSelected.push(i);
					}
					return a;
				}, []);

			if (multiSelected.length > 0) {
				multiSelected.map((item) => {
					tempStatus[`${item}`] = { label: '', status: false };
					return item;
				});
			}
			tempDataSelectedValueDropdown[`${index}`] = e;
			tempStatus[`${index}`] = { label: '', status: false };
			this.setState({
				columnStatus: tempStatus,
				selectedValueDropdown: tempDataSelectedValueDropdown,
			});
		} else {
			let a = tempStatus.map((item, i) => {
				let idx = tempDataSelectedValueDropdown
					.map((val) => val.value)
					.indexOf(item.label);
				if (idx === index || item.label === '') {
					return { label: '', status: false };
				} else {
					return { label: `${item.label}`, status: `${item.status}` };
				}
			});
			a[`${index}`] = { label: '', status: false };
			tempDataSelectedValueDropdown[`${index}`] = e;
			const tempSelectError = [...this.state.selectError];
			tempSelectError[`${index}`] = false;
			this.setState({
				columnStatus: a,
				selectedValueDropdown: tempDataSelectedValueDropdown,
				selectError: tempSelectError,
			});
		}
	};

	handleInputChange = (name, value) => {
		this.setState({
			initValue: Object.assign(this.state.initValue, {
				[`${name}`]: value,
			}),
		});
	};

	handleSave = () => {
		let optionErr = [...this.state.selectError];
		let item = this.state.selectedValueDropdown
			.map((item, index) => {
				if (item.value === '') {
					optionErr[`${index}`] = true;
				}
				return item.value;
			})
			.indexOf('');

		if (item === -1) {
			let a = {};
			let val;
			let obj = {};
			this.state.selectedValueDropdown.map((item, index) => {
				if (item.value) {
					val = item.value;
					obj[val] = index;
					a = { ...a, ...obj };
				}
				return item;
			});
			let postData = { ...this.state.initValue };
			postData.indexMap = a;
			this.props.importTransactionActions
				.createConfiguration(postData)
				.then((res) => {
					this.props.commonActions.tostifyAlert(
						'success',
						'New Template Created Successfully',
					);
					this.props.history.push('/admin/banking/bank-account/transaction', {
						id: res.data.id,
						bankAccountId: this.props.location.state.bankAccountId,
					});
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		} else {
			this.setState({
				selectError: optionErr,
			});
		}
	};

	render() {
		const {
			loading,
			tableData,
			initialloading,
			configurationList,
		} = this.state;
		const { date_format_list } = this.props;
		const bankAccountId = this.props.location.state.bankAccountId;
		return (
			<div className="import-transaction-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa glyphicon glyphicon-export fa-upload" />
												<span className="ml-2">Import Transaction</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{initialloading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<div>
													{/* <Formik
                            initialValues={initValue}
                            ref={this.formRef}
                            onSubmit={(values, { resetForm }) => {
                              this.handleApply(values, resetForm)
                            }}
                          >
                            {
                              (props) => ( */}
													<Form>
														<Row>
															<Col lg={3}>
																<Label>
																	<span className="text-danger">*</span>Name
																</Label>
															</Col>
															<Col lg={3}>
																<FormGroup>
																	<Input
																		type="text"
																		id="name"
																		name="name"
																		placeholder="Enter Name"
																		value={this.state.initValue.name}
																		onChange={(e) => {
																			this.handleInputChange(
																				'name',
																				e.target.value,
																			);
																			this.setState({
																				error: {
																					...this.state.error,
																					...{ name: '' },
																				},
																			});
																		}}
																	/>
																	{this.state.error &&
																		this.state.error.name && (
																			<div className="is-invalid">
																				{this.state.error.name}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={3} md={5}>
																<Label>Copy Saved Configuration</Label>
															</Col>
															<Col lg={3} md={7}>
																<FormGroup>
																	<Select
																		value={
																			configurationList &&
																			selectOptionsFactory
																				.renderOptions(
																					'name',
																					'id',
																					configurationList,
																					'Tax',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						+this.state.selectedConfiguration,
																				)
																		}
																		options={
																			configurationList
																				? selectOptionsFactory.renderOptions(
																						'name',
																						'id',
																						configurationList,
																						'Configuration',
																				  )
																				: []
																		}
																		onChange={(e) => {
																			let data = configurationList.filter(
																				(item) => item.id === e.value,
																			);
																			if (data.length > 0) {
																				this.setState({
																					initValue: {
																						name: this.state.initValue.name,
																						skipRows: data[0].skipRows,
																						headerRowNo: data[0].headerRowNo,
																						textQualifier:
																							data[0].textQualifier,
																						dateFormatId: data[0].dateFormatId,
																						otherDilimiterStr:
																							data[0].otherDilimiterStr,
																					},
																					selectedConfiguration: e.value,
																					selectedDateFormat:
																						data[0].dateFormatId,
																					selectedDelimiter: data[0].delimiter,
																					error: {
																						...this.state.error,
																						...{ dateFormatId: '' },
																					},
																				});
																			} else {
																				this.setState({
																					selectedConfiguration: e.value,
																				});
																			}
																		}}
																	/>
																</FormGroup>
															</Col>
														</Row>

														<Row>
															<Col lg={12}>
																<fieldset>
																	<legend>Parameters</legend>
																	<Row>
																		<Col lg={3}>
																			{this.state.delimiterList &&
																				this.state.delimiterList.map(
																					(option, index, array) => {
																						return (
																							<div key={index}>
																								<FormGroup
																									check
																									inline
																									className="mb-3"
																								>
																									<Input
																										className="form-check-input"
																										type="radio"
																										id={option.value}
																										name="delimiter"
																										value={
																											this.state.delimiterList[
																												`${index}`
																											].value
																										}
																										checked={
																											this.state
																												.selectedDelimiter ===
																											option.value
																										}
																										onChange={(e) => {
																											this.setState({
																												selectedDelimiter:
																													e.target.value,
																											});
																											this.handleInputChange(
																												'otherDilimiterStr',
																												'',
																											);
																										}}
																									/>
																									<Label
																										className="form-check-label"
																										check
																										htmlFor="vatIncluded"
																									>
																										{option.label}
																									</Label>
																									{index ===
																									array.length - 1 ? (
																										<Input
																											className="ml-3"
																											type="text"
																											placeholder="Other"
																											value={
																												this.state.initValue
																													.otherDilimiterStr ||
																												''
																											}
																											disabled={
																												this.state
																													.selectedDelimiter !==
																												'OTHER'
																											}
																											onChange={(e) => {
																												this.handleInputChange(
																													'otherDilimiterStr',
																													e.target.value,
																												);
																											}}
																										/>
																									) : null}
																								</FormGroup>
																							</div>
																						);
																					},
																				)}
																		</Col>
																		<Col lg={6} className="table_option">
																			<Row>
																				<Col md="5">
																					<label htmlFor="Other">
																						<span className="text-danger">
																							*
																						</span>
																						Provide Sample
																					</label>
																				</Col>
																				<Col md="7">
																					<FormGroup className="mb-0">
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
																								this.setState({
																									fileName: e.target.value
																										.split('\\')
																										.pop(),
																									error: {
																										...this.state.error,
																										...{ file: '' },
																									},
																								});
																							}}
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
																					</FormGroup>
																					{this.state.error &&
																						this.state.error.file && (
																							<div className="is-invalid">
																								{this.state.error.file}
																							</div>
																						)}
																				</Col>
																			</Row>
																			<Row className="mt-3">
																				<Col md={5}>
																					<Label htmlFor="skip_rows">
																						Skip Rows
																					</Label>
																				</Col>
																				<Col md={7}>
																					<FormGroup className="">
																						<Input
																							type="text"
																							name=""
																							id=""
																							rows="6"
																							placeholder="Enter No of Rows"
																							value={
																								this.state.initValue.skipRows ||
																								''
																							}
																							onChange={(e) => {
																								this.handleInputChange(
																									'skipRows',
																									e.target.value,
																								);
																							}}
																						/>
																					</FormGroup>
																				</Col>
																			</Row>
																			<Row>
																				<Col md={5}>
																					{' '}
																					<Label htmlFor="description">
																						Header Rows Number
																					</Label>
																				</Col>
																				<Col md={7}>
																					<FormGroup className="">
																						<Input
																							type="text"
																							name=""
																							id=""
																							rows="6"
																							value={
																								this.state.initValue
																									.headerRowNo || ''
																							}
																							placeholder="Enter Header Row Number"
																							onChange={(e) => {
																								this.handleInputChange(
																									'headerRowNo',
																									e.target.value,
																								);
																							}}
																						/>
																					</FormGroup>
																				</Col>
																			</Row>
																			<Row>
																				<Col md={5}>
																					<Label htmlFor="description">
																						Text Qualifier
																					</Label>
																				</Col>
																				<Col md={7}>
																					<FormGroup className="">
																						<Input
																							type="text"
																							name=""
																							id=""
																							rows="6"
																							placeholder="Text Qualifier"
																							value={
																								this.state.initValue
																									.textQualifier || ''
																							}
																							onChange={(e) => {
																								this.handleInputChange(
																									'textQualifier',
																									e.target.value,
																								);
																							}}
																						/>
																					</FormGroup>
																				</Col>
																			</Row>
																			<Row>
																				<Col md={5}>
																					<Label htmlFor="description">
																						<span className="text-danger">
																							*
																						</span>
																						Date Format
																					</Label>
																				</Col>
																				<Col md={7}>
																					<FormGroup
																						className=""
																						style={{ flexDirection: 'column' }}
																					>
																						<Select
																							type=""
																							options={
																								date_format_list
																									? selectOptionsFactory.renderOptions(
																											'format',
																											'id',
																											date_format_list,
																											'Date Format',
																									  )
																									: []
																							}
																							value={
																								date_format_list &&
																								selectOptionsFactory
																									.renderOptions(
																										'format',
																										'id',
																										date_format_list,
																										'Date Format',
																									)
																									.find(
																										(option) =>
																											option.value ===
																											+this.state
																												.selectedDateFormat,
																									)
																							}
																							onChange={(option) => {
																								if (option && option.value) {
																									this.handleInputChange(
																										'dateFormatId',
																										option.value,
																									);
																									this.setState({
																										selectedDateFormat:
																											option.value,
																										error: {
																											...this.state.error,
																											...{ dateFormatId: '' },
																										},
																									});
																								} else {
																									this.handleInputChange(
																										'dateFormatId',
																										'',
																									);
																									this.setState({
																										selectedDateFormat: '',
																									});
																								}
																							}}
																							id=""
																							rows="6"
																							placeholder="Date Format"
																						/>
																						{this.state.error &&
																							this.state.error.dateFormatId && (
																								<div className="is-invalid">
																									{
																										this.state.error
																											.dateFormatId
																									}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																			</Row>
																		</Col>

																		<Col
																			lg={3}
																			className="mt-2 align-apply text-right"
																		>
																			<FormGroup>
																				<Button
																					type="button"
																					color="primary"
																					className="btn-square"
																					// disabled={this.state.fileName ? false : true}
																					onClick={() => {
																						this.handleApply();
																					}}
																				>
																					<i className="fa fa-dot-circle-o"></i>{' '}
																					Apply
																				</Button>
																			</FormGroup>
																		</Col>
																	</Row>
																</fieldset>
															</Col>
														</Row>
														{/* <Row className="mt-5"> */}
														{/* </Row> */}
													</Form>
													{/* )
                            }
                          </Formik> */}
													<Row>
														{loading ? (
															<Loader />
														) : this.state.tableDataKey.length > 0 ? (
															this.state.tableDataKey.map((header, index) => {
																return (
																	<Col
																		style={{
																			width: `calc(100% / ${this.state.tableDataKey.length})`,
																			margin: '20px 0',
																		}}
																	>
																		<FormGroup
																			className={`mb-0 ${
																				this.state.columnStatus[`${index}`]
																					.status
																					? 'is-invalid'
																					: ''
																			} ${
																				this.state.selectError[`${index}`]
																					? 'invalid-select'
																					: ''
																			}`}
																		>
																			<Select
																				type=""
																				options={
																					this.state.tableHeader
																						? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								this.state.tableHeader,
																								'',
																						  )
																						: []
																				}
																				name={index}
																				id=""
																				rows="6"
																				value={
																					this.state.selectedValueDropdown[
																						`${index}`
																					]
																				}
																				onChange={(e) => {
																					this.handleChange(e, index);
																				}}
																				// className={}
																			/>
																		</FormGroup>
																		<p
																			className={
																				this.state.columnStatus[`${index}`]
																					.status
																					? 'is-invalid'
																					: 'valid'
																			}
																		>
																			*Already Selected
																		</p>
																	</Col>
																);
															})
														) : null}
														{/* <div> */}
														{this.state.tableDataKey.length > 0 ? (
															<BootstrapTable
																data={tableData}
																keyField={this.state.tableDataKey[0]}
															>
																{this.state.tableDataKey.map((name) => (
																	<TableHeaderColumn
																		dataField={name}
																		dataAlign="center"
																	>
																		{name}
																	</TableHeaderColumn>
																))}
															</BootstrapTable>
														) : null}
														{/* </div> */}
														<Row style={{ width: '100%' }}>
															<Col lg={12} className="mt-2">
																<FormGroup className="text-right">
																	{this.state.tableDataKey.length > 0 ? (
																		<>
																			<Button
																				type="button"
																				color="primary"
																				className="btn-square mr-4"
																				onClick={this.handleSave}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				Save
																			</Button>
																			<Button
																				color="secondary"
																				className="btn-square"
																				onClick={() => {
																					this.props.history.push(
																						'/admin/banking/upload-statement',
																						{
																							bankAccountId,
																						},
																					);
																				}}
																			>
																				<i className="fa fa-ban"></i> Cancel
																			</Button>
																		</>
																	) : null}
																</FormGroup>
															</Col>
														</Row>
													</Row>
												</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ImportTransaction);
