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
import { Loader } from 'components';
import Select from 'react-select';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import * as Yup from 'yup';

import { CommonActions } from 'services/global';

import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

import * as VatCreateActions from '../../../vat_code/screens/create/actions';
import * as VatActions from '../../../vat_code/actions';
import * as roleActions from '../../screens/create/actions';

import { Formik } from 'formik';
const mapStateToProps = (state) => {
	return {
		vat_row: state.vat.vat_row,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatActions: bindActionCreators(VatActions, dispatch),
		vatCreateActions: bindActionCreators(VatCreateActions, dispatch),
		RoleActions: bindActionCreators(roleActions, dispatch),
	};
};

class CreateRole extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: { name: '', description: '' },
			loading: false,
			createMore: false,
			vat_list: [],
			checked: [],
			roleList: [],
			roleexist: false,
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExDecimal = /^[0-9]*(\.[0-9]{0,2})?$/;
		this.regEx = /^[0-9\d]+$/;
		this.regCode = /[a-zA-Z0-9 ]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.props.RoleActions.getRoleList().then((res) => {
			if (res.status === 200) {
				var result = res.data.map(function (el) {
					var o = Object.assign({}, el);
					o.value = el.moduleId;
					o.label = el.moduleName;
					return o;
				});
				this.list_to_tree(result);
			}
		});
		//this.props.RoleActions.getUpdatedRoleList();
	};

	list_to_tree = (arr) => {
		let arrMap = new Map(arr.map((item) => [item.moduleId, item]));
		let tree = [];

		for (let i = 0; i < arr.length; i++) {
			let item = arr[i];

			if (item.parentModuleId) {
				let parentItem = arrMap.get(item.parentModuleId);

				if (parentItem) {
					let { children } = parentItem;

					if (children) {
						parentItem.children.push(item);
					} else {
						parentItem.children = [item];
					}
				}
			} else {
				tree.push(item);
			}
		}
		this.setState({ roleList: tree });
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
	success = () => {
		toast.success('Vat Code Updated successfully... ', {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	// Create or Edit Vat
	handleSubmit = (data, resetForm) => {
			const obj = {
			roleName: data.name,
			roleDescription: data.description,
			moduleListIds: this.state.checked,
		};
		this.props.RoleActions.createRole(obj)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'New Role Created Successfully!',
					);
					resetForm();
					if (this.state.createMore) {
						this.setState({
							createMore: false,
						});
					} else {
						this.props.history.push('/admin/settings/user-role');
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert('error', err.data.message);
			});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 8,
			name: value,
		};
		this.props.RoleActions.checkValidation(data).then((response) => {
			if (response.data === 'Role name already exists') {
				this.setState({
					roleexist: true,
				})
			} else {
				this.setState({
					roleexist: false,
				});
			}
		});
	};

	onCheck = (checked, targetNode) => {
		this.setState({ checked }, () => {
		});
	};

	onExpand = (expanded) => {
		this.setState({ expanded });
	};

	render() {
		const { loading, vat_list } = this.state;

		if (vat_list) {
			var VatList = vat_list.map((item) => {
				return item.name;
			});
		}
		const options = [
			{ value: 'Accountant', label: 'Accountant' },
			{ value: 'Banking', label: 'Banking' },
			{ value: 'Income', label: 'Income' },
		];
		const optionsTwo = [
			{ value: 'Customer Invoice', label: 'Customer Invoice' },
		];
		const { checked, expanded } = this.state;
		return (
			<div className="role-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase" />
										<span className="ml-2">Add New Role</span>
									</div>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={6}>
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
													// resetForm(this.state.initValue)
												}}
												validate={(values) => {
													// let status = false
													let errors = {};
													if (this.state.roleexist === true) {
														errors.name =
															'Role name is already exist';
													}
													return errors;
												}}
												validationSchema={Yup.object().shape({
													name: Yup.string().required(
														'Role Name is required',
													),
												

												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit} name="simpleForm">
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">*</span>Name
															</Label>
															<Input
																type="text"
																maxLength="30"
																id="name"
																name="name"
																placeholder="Enter Name"
																onBlur={props.handleBlur}
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.regCode.test(
																			option.target.value,
																		)
																	) {
																		props.handleChange('name')(
																			option,
																		);
																	}
																	this.validationCheck(
																		option.target.value,
																	);
																}}
																// validate={this.validateCode}
																value={props.values.name}
																className={
																	props.errors.name &&
																	props.touched.name
																		? 'is-invalid'
																		: ''
																}
															/>
															{props.errors.name &&
																props.touched.name && (
																	<div className="invalid-feedback">
																		{props.errors.name}
																	</div>
																)}
														</FormGroup>
														<FormGroup>
															<Label htmlFor="name">Description</Label>
															<Input
																type="text"
																id="description"
																name="description"
																placeholder="Description"
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.regCode.test(option.target.value)
																	) {
																		props.handleChange('description')(option);
																	}
																}}
																value={props.values.description}
																className={
																	props.errors.description &&
																	props.touched.description
																		? 'is-invalid'
																		: ''
																}
															/>
														</FormGroup>
														<FormGroup>
															<Label ><span className="text-danger">*</span>Modules</Label>
															<CheckboxTree
																id="RoleList"
																name="RoleList"
																checked={checked}
																expanded={expanded}
																iconsClass="fa5"
																nodes={this.state.roleList}
																onCheck={this.onCheck}
																onExpand={this.onExpand}
															/>
														</FormGroup>
														{/* <FormGroup>
															<Label htmlFor="name">Feature</Label>
															<Select
																options={optionsTwo}
																className="basic-multi-select"
																isMulti
															/>
														</FormGroup> */}
														{/* <div htmlFor="name">Operation</div>
														<FormGroup check inline className="mb-3 mt-2">
															<Label
																className="form-check-label"
																check
																htmlFor="productPriceTypeOne"
																style={{ marginRight: '10px' }}
															>
																<Input type="checkbox" id="view" name="view" />
																View
															</Label>
															<Label
																className="form-check-label"
																check
																htmlFor="productPriceTypeOne"
																style={{ marginRight: '10px' }}
															>
																<Input type="checkbox" id="edit" name="edit" />
																Edit
															</Label>
															<Label
																className="form-check-label"
																check
																htmlFor="productPriceTypeOne"
															>
																<Input
																	type="checkbox"
																	id="Delete"
																	name="Delete"
																/>
																Delete
															</Label>
														</FormGroup> */}
														<FormGroup className="text-right mt-5">
															<Button
																type="button"
																name="submit"
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
																type="submit"
																color="secondary"
																className="btn-square"
																onClick={() => {
																	this.props.history.push(
																		'/admin/settings/user-role',
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateRole);
