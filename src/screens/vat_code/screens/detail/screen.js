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
import { Loader, ConfirmDeleteModal } from 'components';

import { CommonActions } from 'services/global';

import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

import * as VatDetailActions from './actions';
import * as VatActions from '../../actions'

import { Formik } from 'formik';
import * as Yup from 'yup';

const mapStateToProps = (state) => {
	return {
		vat_row: state.vat.vat_row,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatDetailActions: bindActionCreators(VatDetailActions, dispatch), 
		vatActions: bindActionCreators(VatActions, dispatch),
	};
};

class DetailVatCode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			vatData: {},
			loading: false,
			dialog: false,
			current_vat_id: null,
		};

		this.saveAndContinue = false;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regEx = /^[0-9\d]+$/;
	}

	componentDidMount = () => {
		if (this.props.location.state && this.props.location.state.id) {
			this.setState({ loading: true });
			this.props.vatDetailActions
				.getVatByID(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.setState({
							current_vat_id: this.props.location.state.id,
							loading: false,
							vatData: res.data,
						});
					}
				})
				.catch((err) => {
					this.props.history.push('/admin/master/vat-category');
				});
		} else {
			this.props.history.push('/admin/master/vat-category');
		}
	};

	// Create or Edit Vat
	handleSubmit = (data) => {
		this.props.vatDetailActions
			.updateVat(data)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Vat code Updated Successfully!',
					);
					this.props.history.push('/admin/master/vat-category');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert('error', err.data.message);
			});
	};

	deleteVat = () => {
		const { current_vat_id } = this.state;
		this.props.vatActions
		.getVatCount(current_vat_id)
		.then((res) => {
			if (res.data > 0) {
				this.props.commonActions.tostifyAlert(
					'error',
					'This Vat catogery is in use ,Cannot delete this Vat Catogery',
				);
			} else {
		const message1 =
        <text>
        <b>Delete Vat Code?</b>
        </text>
        const message = 'This Vat Code will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeVat}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	}
});
	};

	removeVat = () => {
		const { current_vat_id } = this.state;
		this.props.vatDetailActions
			.deleteVat(current_vat_id)
			.then((res) => {
				if (res.status === 200) {
					// this.success('Chart Account Deleted Successfully');
					this.props.commonActions.tostifyAlert(
						'success',
						'Vat Deleted Successfully',
					);
					this.props.history.push('/admin/master/vat-category');
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

	render() {
		const { loading, dialog } = this.state;

		return (
			<div className="detail-vat-code-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase" />
										<span className="ml-2">Update Vat Code</span>
									</div>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader></Loader>
									) : (
										<Row>
											<Col lg={6}>
												<Formik
													initialValues={this.state.vatData}
													onSubmit={(values) => {
														this.handleSubmit(values);
													}}
													validationSchema={Yup.object().shape({
														name: Yup.string().required(
															'Vat Code Name is Required',
														),
														vat: Yup.string().required(
															'Vat Percentage is Required',
														),
													})}
												>
													{(props) => (
														<Form
															onSubmit={props.handleSubmit}
															name="simpleForm"
														>
															<FormGroup>
																<Label htmlFor="name">
																	<span className="text-danger">*</span>Vat Code
																	Name
																</Label>
																<Input
																	type="text"
																	id="name"
																	name="name"
																	placeholder="Enter Vat Code Name"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExAlpha.test(option.target.value)
																		) {
																			props.handleChange('name')(option);
																		}
																	}}
																	value={props.values.name}
																	className={
																		props.errors.name && props.touched.name
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.name && props.touched.name && (
																	<div className="invalid-feedback">
																		{props.errors.name}
																	</div>
																)}
															</FormGroup>
															<FormGroup>
																<Label htmlFor="name">
																	<span className="text-danger">*</span>
																	Percentage
																</Label>
																<Input
																	type="text"
																	id="vat"
																	name="vat"
																	placeholder="Enter Percentage"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regEx.test(option.target.value)
																		) {
																			props.handleChange('vat')(option);
																		}
																	}}
																	value={props.values.vat}
																	className={
																		props.errors.vat && props.touched.vat
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.vat && props.touched.vat && (
																	<div className="invalid-feedback">
																		{props.errors.vat}
																	</div>
																)}
															</FormGroup>
															<Row>
																<Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																>
																	<FormGroup>
																		<Button
																			type="button"
																			color="danger"
																			className="btn-square"
																			onClick={this.deleteVat}
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
																			type="submit"
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.history.push(
																					'/admin/master/vat-category',
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailVatCode);
