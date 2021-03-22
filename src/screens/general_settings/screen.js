import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';

import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Row,
	Table,
	Button,
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Loader } from 'components';

import { CommonActions } from 'services/global';
import './style.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import * as GeneralSettingActions from './actions';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		generalSettingActions: bindActionCreators(GeneralSettingActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class GeneralSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editorState: EditorState.createEmpty(),
			initValue: {
				id: '',
				invoiceMailingBody: '',
				invoiceMailingSubject: '',
				invoicingReferencePattern: '',
				mailingHost: '',
				mailingPassword: '',
				mailingAPIKey: '',
				mailingPort: '',
				mailingUserName: '',
			},
			loading: true,
			message: '',
			contentState: {},
			selected_smtp_auth: false,
			selected_smtp_enable: false,
			viewEditor: false,
		};
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.content = {};
	}

	// onEditorStateChange = (editorState) => {
	//   this.setState({
	//     editorState
	//   },() => {
	//     console.log(editorState.getCurrentContent())
	//   })
	// }
	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.generalSettingActions
			.getGeneralSettingDetail()
			.then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							loading: false,
							initValue: {
								id: res.data.id,
								invoiceMailingSubject: res.data.invoiceMailingSubject
									? res.data.invoiceMailingSubject
									: '',
								invoicingReferencePattern: res.data.invoicingReferencePattern
									? res.data.invoicingReferencePattern
									: '',
								mailingHost: res.data.mailingHost ? res.data.mailingHost : '',
								mailingPort: res.data.mailingPort ? res.data.mailingPort : '',
								mailingUserName: res.data.mailingUserName
									? res.data.mailingUserName
									: '',
								mailingPassword: res.data.mailingPassword
									? res.data.mailingPassword
									: '',
								mailingAPIKey: res.data.mailingAPIKey
									? res.data.mailingAPIKey
									: '',
							},
							message: res.data.invoiceMailingBody
								? res.data.invoiceMailingBody
								: '',
							selected_smtp_auth: res.data.mailingSmtpAuthorization
								? res.data.mailingSmtpAuthorization
								: '',
							selected_smtp_enable: res.data.mailingSmtpStarttlsEnable
								? res.data.mailingSmtpStarttlsEnable
								: '',
						},
						() => {
							this.content = {
								entityMap: {},
								blocks: [
									{
										key: '637gr',
										text: this.state.message,
										type: 'unstyled',
										depth: 0,
										inlineStyleRanges: [],
										entityRanges: [],
										data: {},
									},
								],
							};
							this.setState({
								viewEditor: true,
							});
						},
					);
				}
			})
			.catch((err) => {
				this.setState({
					loading: false,
				});
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.props.history.push('/admin');
			});
	};

	handleSubmit = (data) => {
		const { selected_smtp_auth, selected_smtp_enable, message } = this.state;
		const postData = {
			id: data.id,
			invoiceMailingBody: message,
			invoiceMailingSubject: data.invoiceMailingSubject,
			invoicingReferencePattern: data.invoicingReferencePattern,
			mailingHost: data.mailingHost,
			mailingPassword: data.mailingPassword,
			mailingPort: data.mailingPort,
			mailingSmtpAuthorization: selected_smtp_auth,
			mailingAPIKey: data.mailingAPIKey,
			mailingSmtpStarttlsEnable: selected_smtp_enable,
			mailingUserName: data.mailingUserName,
		};
		this.props.generalSettingActions
			.updateGeneralSettings(postData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'General Setting Updated Successfully',
					);
					this.props.history.push('/admin');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	onContentStateChange = (contentState) => {
		this.setState(
			{
				contentState,
			},
			() => {
				this.setState({
					message: this.state.contentState.blocks[0].text,
				});
			},
		);
	};

	render() {
		const { initValue, contentState, loading } = this.state;

		return (
			<div className="general-settings-screen">
				<div className="animated fadeIn">
					<Row>
						<Col xs="12">
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-wrench" />
										<span className="ml-2">General Settings</span>
									</div>
								</CardHeader>
								<CardBody>
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col>
												<Formik
													initialValues={initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values, resetForm);
													}}
													validationSchema={Yup.object().shape({
														invoicingReferencePattern: Yup.string().required(
															'Invoice Reference Number is Required',
														),
														mailingHost: Yup.string().required(
															'Mailing Host is Required',
														),
														mailingPort: Yup.string().required(
															'Mailing Port is Required',
														),
														mailingUserName: Yup.string().required(
															'Mailing Username is Required',
														),
														mailingPassword: Yup.string().required(
															'Mailing Password is Required',
														),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															<h4>General Details</h4>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="invoicingReferencePattern">
																			{' '}
																			Invoicing Reference Pattern
																		</Label>
																		<Input
																			type="text"
																			id="invoicingReferencePattern"
																			name="invoicingReferencePattern"
																			placeholder="Enter Invoicing Reference Pattern"
																			value={
																				props.values.invoicingReferencePattern
																			}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExBoth.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'invoicingReferencePattern',
																					)(option);
																				}
																			}}
																			className={
																				props.errors
																					.invoicingReferencePattern &&
																				props.touched.invoicingReferencePattern
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.invoicingReferencePattern &&
																			props.touched
																				.invoicingReferencePattern && (
																				<div className="invalid-feedback">
																					{
																						props.errors
																							.invoicingReferencePattern
																					}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																{/* <Col sm="6">
                                                    <FormGroup >
                                                      <Label htmlFor="select">Invoicing Templates</Label>
                                                      <Select
                                                        options={[]}
                                                      />
                                                    </FormGroup>
                                                  </Col> */}
															</Row>
															<h4>Mail Configuration Detail</h4>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingHost">
																			Mailing Host
																		</Label>
																		<Input
																			type="text"
																			id="mailingHost"
																			name="mailingHost"
																			placeholder="Enter Mailing Host"
																			value={props.values.mailingHost}
																			onChange={(option) => {
																				props.handleChange('mailingHost')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingHost &&
																				props.touched.mailingHost
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingHost &&
																			props.touched.mailingHost && (
																				<div className="invalid-feedback">
																					{props.errors.mailingHost}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingPort">
																			Mailing Port
																		</Label>
																		<Input
																			type="text"
																			id="mailingPort"
																			name="mailingPort"
																			placeholder="Enter Mailing Port"
																			value={props.values.mailingPort}
																			onChange={(option) => {
																				props.handleChange('mailingPort')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingPort &&
																				props.touched.mailingPort
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingPort &&
																			props.touched.mailingPort && (
																				<div className="invalid-feedback">
																					{props.errors.mailingPort}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingUserName">
																			Mailing UserName
																		</Label>
																		<Input
																			type="text"
																			id="mailingUserName"
																			name="mailingUserName"
																			placeholder="Enter Username"
																			value={props.values.mailingUserName}
																			autoComplete="off"
																			onChange={(option) => {
																				props.handleChange('mailingUserName')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingUserName &&
																				props.touched.mailingUserName
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingUserName &&
																			props.touched.mailingUserName && (
																				<div className="invalid-feedback">
																					{props.errors.mailingUserName}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingPassword">
																			Mailing Password
																		</Label>
																		<Input
																			type="password"
																			id="mailingPassword"
																			name="mailingPassword"
																			placeholder="Enter Password"
																			autoComplete="new-password"
																			value={props.values.mailingPassword}
																			onChange={(option) => {
																				props.handleChange('mailingPassword')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingPassword &&
																				props.touched.mailingPassword
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingPassword &&
																			props.touched.mailingPassword && (
																				<div className="invalid-feedback">
																					{props.errors.mailingPassword}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingSmtpAuthorization">
																			Mailing SMTP Authorization
																		</Label>
																		<div>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio1"
																						name="mailingSmtpAuthorization"
																						checked={
																							this.state.selected_smtp_auth
																						}
																						value={true}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_auth: true,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio1"
																					>
																						Yes
																					</label>
																				</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio2"
																						name="mailingSmtpAuthorization"
																						value={false}
																						checked={
																							!this.state.selected_smtp_auth
																						}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_auth: false,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio2"
																					>
																						No
																					</label>
																				</div>
																			</FormGroup>
																		</div>
																	</FormGroup>
																</Col>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingSmtpStarttlsEnable">
																			Mailing Smtp Starttls Enable
																		</Label>
																		<div>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio3"
																						name="mailingSmtpStarttlsEnable"
																						value={true}
																						checked={
																							this.state.selected_smtp_enable
																						}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_enable: true,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio3"
																					>
																						Yes
																					</label>
																				</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio4"
																						name="mailingSmtpStarttlsEnable"
																						value={false}
																						checked={
																							!this.state.selected_smtp_enable
																						}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_enable: false,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio4"
																					>
																						No
																					</label>
																				</div>
																			</FormGroup>
																		</div>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																{this.state.selected_smtp_auth === true && (
																	<Col sm="6">
																		<FormGroup>
																			<Label htmlFor="Api key">API Key </Label>
																			<Input
																				type="text"
																				id="mailingAPIKey"
																				name="mailingAPIKey"
																				placeholder="API key "
																				value={props.values.mailingAPIKey}
																				onChange={(option) => {
																					props.handleChange('mailingAPIKey')(
																						option,
																					);
																				}}
																				className={
																					props.errors.mailingAPIKey &&
																					props.touched.mailingAPIKey
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.mailingAPIKey &&
																				props.touched.mailingAPIKey && (
																					<div className="invalid-feedback">
																						{props.errors.mailingAPIKey}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																)}
															</Row>
															<h4>Invoice Mail Configuration</h4>
															{this.state.viewEditor && (
																<Row>
																	<Col sm="8">
																		<FormGroup>
																			<Label htmlFor="invoiceMailingSubject">
																				Subject
																			</Label>
																			<Input
																				type="text"
																				id="invoiceMailingSubject"
																				name="invoiceMailingSubject"
																				placeholder="Enter the Subject"
																				value={
																					props.values.invoiceMailingSubject
																				}
																				onChange={(value) => {
																					props.handleChange(
																						'invoiceMailingSubject',
																					)(value);
																				}}
																			/>
																		</FormGroup>
																		<FormGroup>
																			<Label htmlFor="text-input">
																				Message
																			</Label>
																			<Editor
																				initialContentState={this.content}
																				editorContent={contentState}
																				toolbarClassName="editor-toolbar"
																				wrapperClassName="wrapperClassName"
																				editorClassName="massage-editor"
																				// onEditorStateChange={this.onEditorStateChange}
																				onContentStateChange={
																					this.onContentStateChange
																				}
																			/>
																		</FormGroup>
																	</Col>
																	<Col sm="4">
																		<FormGroup>
																			<Label htmlFor="text-input">
																				Description
																			</Label>
																			<Table responsive bordered>
																				<thead>
																					<th>Value</th>
																					<th>Description</th>
																				</thead>
																				<tbody>
																				<tr>
																						<td>{'{companyName}'}</td>
																						<td>Company Name</td>
																					</tr>
																					<tr>
																						<td>
																							{'{invoicingReferencePattern}'}
																						</td>
																						<td>Invoice Reference Number</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceDate}'}</td>
																						<td>Invoice Date</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceDueDate}'}</td>
																						<td>Invoice Due Date</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceAmount}'}</td>
																						<td>Invoice Amount</td>
																					</tr>
																					<tr>
																						<td>{'{dueAmount}'}</td>
																						<td>Due Amount</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceDuePeriod}'}</td>
																						<td>Invoice Due Period</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceAmount}'}</td>
																						<td>Invoice Amount</td>
																					</tr>
																					<tr>
																						<td>{'{contactName}'}</td>
																						<td>Contact Name</td>
																					</tr>
																					<tr>
																						<td>{'{mobileNumber}'}</td>
																						<td>Mobile Number</td>
																					</tr>
																					<tr>
																						<td>{'{contactAddress}'}</td>
																						<td>Contact Address</td>
																					</tr>
																					<tr>
																						<td>{'{contactCountry}'}</td>
																						<td>Contact Country</td>
																					</tr>
																					<tr>
																						<td>{'{contactState}'}</td>
																						<td>Contact State</td>
																					</tr>
																					<tr>	
																						<td>{'{contactCity}'}</td>
																						<td>Contact City</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceDiscount}'}</td>
																						<td>Invoice Discount</td>
																					</tr>
																					<tr>
																						<td>{'{contractPoNumber}'}</td>
																						<td>contract Po Number</td>
																					</tr>
																					<tr>
																						<td>{'{subTotal}'}</td>
																						<td>Sub Total</td>
																					</tr>
																					<tr>
																						<td>{'{invoiceVatAmount}'}</td>
																						<td>Invoice Vat Amount</td>
																					</tr>
																					<tr>
																						<td>{'{product}'}</td>
																						<td>Product</td>
																					</tr>
																					<tr>
																						<td>{'{description}'}</td>
																						<td>Description</td>
																					</tr>
																					<tr>
																						<td>{'{quantity}'}</td>
																						<td>Quantity</td>
																					</tr>
																					<tr>
																						<td>{'{unitprice}'}</td>
																						<td>Unit Price</td>
																					</tr>
																					<tr>
																						<td>{'{vat}'}</td>
																						<td>Vat Amount</td>
																					</tr>
																					<tr>
																						<td>{'{total}'}</td>
																						<td>Total</td>
																					</tr>
																					<tr>
																						<td>{'{projectName}'}</td>
																						<td>Project Name</td>
																					</tr>
																					<tr>
																						<td>{'{senderName}'}</td>
																						<td>Sender Name</td>
																					</tr>
																				
																				</tbody>
																			</Table>
																		</FormGroup>
																	</Col>
																</Row>
															)}
															<FormGroup className="text-right mt-5">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square"
																>
																	<i className="fa fa-dot-circle-o"></i> Save
																</Button>
																<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						this.props.history.push(
																							'/admin/dashboard',
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

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings);
