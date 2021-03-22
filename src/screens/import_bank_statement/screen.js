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
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Formik } from 'formik';
import * as Yup from 'yup';

import * as ImportBankStatementActions from './actions';
import { CommonActions } from 'services/global';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';

const mapStateToProps = (state) => {
	return {
		// bank_transaction_list: state.bank_account.bank_transaction_list
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		importBankStatementActions: bindActionCreators(
			ImportBankStatementActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ImportBankStatement extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			templateList: [],
			loading: false,
			initValue: {
				templateId: '',
			},
			fileName: '',
			selectedTemplate: '',
			tableDataKey: [],
			tableData: [],
			errorIndexList: [],
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
		console.log('location', this.props.location)
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			console.log(this.props.location.state.bankAccountId);
			this.props.importBankStatementActions.getTemplateList().then((res) => {
				if (res.status === 200) {
					let id;
					id =
						this.props.location.state && this.props.location.state.id ? id : '';
					this.setState({
						selectedTemplate: id,
						templateList: res.data,
					});
				}
			});
		} else {
			this.props.history.push('/admin/banking/bank-account');
		}
	};

	renderTransactionType = (cell, row) => {
		let classname = '';
		let value = '';
		if (row.status === 'Explained') {
			classname = 'badge-success';
			value = 'Cost of Goods Sold';
		} else if (row.status === 'Unexplained') {
			classname = 'badge-danger';
			value = 'Expense';
		} else {
			classname = 'badge-primary';
			value = 'Tax Claim';
		}
		return <span className={`badge ${classname} mb-0`}>{value}</span>;
	};

	columnClassNameFormat = (fieldValue, row, rowIdx, colIdx) => {
		const index = `${rowIdx.toString()},${colIdx.toString()}`;
		return this.state.errorIndexList.indexOf(index) > -1 ? 'invalid' : '';
	};

	handleSubmit = (data) => {
		this.setState({ loading: true });
		const { selectedTemplate } = this.state;
		let formData = new FormData();
		if (this.uploadFile && this.uploadFile.files[0]) {
			formData.append('file', this.uploadFile.files[0]);
		}
		formData.append('id', selectedTemplate ? +selectedTemplate : '');
		formData.append(
			'bankId',
			this.props.location.state.bankAccountId
				? this.props.location.state.bankAccountId
				: '',
		);
		// this.setState({
		//       // tableData: [...res.data],
		//       tableDataKey: ['a','b','c','d']
		//     })
		this.props.importBankStatementActions
			.parseFile(formData)
			.then((res) => {
				console.log(res);
				this.setState({
					tableData: res.data['data'],
					tableDataKey: res.data.data[0] ? Object.keys(res.data.data[0]) : [],
					errorIndexList: res.data.error ? res.data.error : [],
				});
				console.log('tableDataKey', this.state.tableDataKey);
				// })
			})
			.catch((err) => {
				// this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
				// this.setState({ loading: false })
			});
	};

	handleSave = () => {
		const { selectedTemplate, tableData } = this.state;
		const postData = {
			bankId: this.props.location.state.bankAccountId
				? this.props.location.state.bankAccountId
				: '',
			templateId: selectedTemplate ? +selectedTemplate : '',
			importDataMap: tableData,
		};
		console.log('postdata', postData)
		this.props.importBankStatementActions
			.importTransaction(postData)
			.then((res) => {
				if (res.data.includes('Transactions Imported 0')) {
					this.props.commonActions.tostifyAlert(
						'error',
						'Imported transaction should not contain any outdated transation',
						this.props.history.push('/admin/banking/bank-account/transaction', {
							bankAccountId: postData.bankId
						})
					);
					this.setState({ selectedTemplate: [], tableData: [] });
				} else {
					this.props.commonActions.tostifyAlert('success', res.data);
					this.props.history.push('/admin/banking/bank-account/transaction', {
						bankAccountId: postData.bankId
					});
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
		const { templateList, initValue } = this.state;
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa glyphicon glyphicon-export fa-upload" />
												<span className="ml-2">Import Statement</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{/* <Row>
                    <Col lg={12}>
                      <Nav tabs>
                        <NavItem>
                          <NavLink
                            active={true}
                          >
                            <Label className="mb-0 text-primary">
                              Preview for Imported Statement
                            </Label>
                          </NavLink>
                        </NavItem>
                      </Nav>
                      <TabContent activeTab={'1'}>
                        <TabPane tabId="1"> 
                          <Row>
                            <Col lg={12}>
                              <BootstrapTable
                                search={false}
                                options={ this.options }
                                data={bank_transaction_list}
                                version="4"
                                hover
                                pagination
                                totalSize={ bank_transaction_list ? bank_transaction_list.length : 0}
                                className="preview-bank-transaction-table"
                              >
                                <TableHeaderColumn
                                  isKey
                                  dataField="reference_number"
                                  dataSort
                                >
                                  Reference Number
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="transaction_type"
                                  dataFormat={this.renderTransactionType}
                                  dataSort
                                >
                                  Transaction Type
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="amount"
                                  dataSort
                                >
                                  Amount
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="description"
                                  dataSort
                                >
                                  Description
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="transaction_date"
                                  dataSort
                                >
                                  Transaction Date
                                </TableHeaderColumn>
                              </BootstrapTable>
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={12} className="mt-5">
                      <FormGroup className="text-right">
                        <Button type="button" color="primary" className="btn-square mr-3"  
                         onClick={() => this.props.history.push('/admin/banking/upload-statement/transaction')}>
                          <i className="fa fa-dot-circle-o"></i> Import
                        </Button>
                        <Button color="secondary" className="btn-square" 
                          onClick={() => this.props.history.push('/admin/banking/bank-account')}>
                          <i className="fa fa-ban"></i> Cancel
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row> */}
									<Row>
										<Col lg={12}>
											<div>
												<Formik
													initialValues={initValue}
													ref={this.formRef}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
													}}
													validationSchema={Yup.object().shape({
														templateId: Yup.string().required(
															'Select Template',
														),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															<Row>
																<Col md="2">
																	<label htmlFor="Other">
																		<span className="text-danger">*</span>Select
																		File to Upload
																	</label>
																</Col>
																<Col md="3">
																	<FormGroup className="">
																		<Button
																			color="primary"
																			onClick={() => {
																				document
																					.getElementById('fileInput')
																					.click();
																			}}
																			className="btn-square mr-3"
																		>
																			<i className="fa fa-upload"></i> Upload
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
																				});
																			}}
																		/>
																		{this.state.fileName}
																	</FormGroup>
																</Col>
															</Row>
															<Row className="align-template">
																<Col lg={2}>
																	<label>
																		<span className="text-danger">*</span>
																		Parsing Template
																	</label>
																	<FormGroup>
																		<Select
																			options={templateList ? templateList : []}
																			value={
																				templateList &&
																				templateList.find(
																					(option) =>
																						option.value ===
																						+props.values.templateId,
																				)
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange('templateId')(
																						option.value,
																					);
																					this.setState({
																						selectedTemplate: option.value,
																					});
																				} else {
																					props.handleChange('templateId')('');
																					this.setState({
																						selectedTemplate: '',
																					});
																				}
																			}}
																			className={`${
																				props.errors.templateId &&
																				props.touched.templateId
																					? 'is-invalid'
																					: ''
																			}`}
																		/>
																		{props.errors.templateId &&
																			props.touched.templateId && (
																				<div className="invalid-feedback">
																					{props.errors.templateId}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col lg={3}>
																	<Button
																		color="primary"
																		className="btn-square"
																		onClick={() =>
																			this.props.history.push(
																				'/admin/banking/upload-statement/transaction',
																				{
																					bankAccountId: this.props.location
																						.state.bankAccountId,
																				},
																			)
																		}
																	>
																		<i className="fas fa-plus mr-1" />
																		Create New Template
																	</Button>
																</Col>
															</Row>
															<Row>
																<Col>
																	<Button
																		color="primary"
																		type="button"
																		className="btn-square"
																		onClick={() => {
																			props.handleSubmit();
																		}}
																		disabled={
																			this.state.fileName.length === 0
																				? true
																				: false
																		}
																	>
																		<i className="fa fa-dot-circle-o mr-1"></i>
																		Parse File
																	</Button>
																</Col>
															</Row>
														</Form>
													)}
												</Formik>
												{/* <Row className="mt-5">
                          <Col lg={3}>
                            <FormGroup className="">
                              <Select
                                type=""
                                name=""
                                id=""
                                rows="6"
                                placeholder="Transaction Name"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="">

                              <Select
                                type=""
                                name=""
                                id=""
                                rows="6"
                                placeholder="Transaction Number"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="">

                              <Select
                                type=""
                                name=""
                                id=""
                                rows="6"
                                placeholder="Transaction Code"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="">

                              <Select
                                type=""
                                name=""
                                id=""
                                rows="6"
                                placeholder="Transaction Date"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <div>
                          <BootstrapTable
                            selectRow={this.selectRowProp}
                            search={false}
                            options={this.options}
                            data={[]}
                            version="4"
                            hover
                            totalSize={0}
                            className="product-table"
                            trClassName="cursor-pointer"
                            csvFileName="product_list.csv"
                            ref={(node) => this.table = node}
                          >
                            <TableHeaderColumn
                              isKey
                              dataField="name"
                              dataSort
                            >
                              Name
                          </TableHeaderColumn>
                            <TableHeaderColumn
                              dataField="productCode"
                              dataSort
                            >
                              Transaction Number
                          </TableHeaderColumn>
                            <TableHeaderColumn
                              dataField="Transaction Code"
                              dataSort
                            >
                              Transaction Code
                          </TableHeaderColumn>
                            <TableHeaderColumn
                              dataField="vatPercentage"
                              dataSort
                            // dataFormat={this.vatCategoryFormatter}
                            >
                             Transaction Date
                          </TableHeaderColumn> */}
												{/* <TableHeaderColumn
                              dataField="unitPrice"
                              dataSort
                            // dataFormat={this.vatCategoryFormatter}
                            >
                              Unit Price
                          </TableHeaderColumn> */}
												{/* </BootstrapTable>
                        </div> */}
												{/* <Row>
                          <Col lg={12} className="mt-2">
                            <FormGroup className="text-right">
                              <Button type="button" color="primary" className="btn-square mr-4">
                                <i className="fa fa-dot-circle-o"></i> Save
                                    </Button>
                            </FormGroup>
                          </Col>
                        </Row> */}
											</div>
										</Col>
									</Row>
									<div>
										{this.state.tableDataKey.length > 0 ? (
											<BootstrapTable
												data={this.state.tableData}
												keyField={this.state.tableDataKey[0]}
											//	pagination
												options={this.options}
											>
												{this.state.tableDataKey.map((name, index) => (
													
													<TableHeaderColumn
														dataField={name}
														dataAlign="center"
														key={index}
														columnClassName={this.columnClassNameFormat}
													>
														{name}
													</TableHeaderColumn>
												))}
											</BootstrapTable>
										) : null}
									</div>
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
															disabled={
																this.state.errorIndexList.length > 0
																	? true
																	: false
															}
														>
															<i className="fa fa-dot-circle-o"></i> Import
														</Button>
														<Button
															color="secondary"
															className="btn-square"
															onClick={() => {
																this.props.history.push(
																	'/admin/banking/bank-account/transaction',
																	{
																		bankAccountId: this.props.location.state
																			.bankAccountId,
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
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ImportBankStatement);
