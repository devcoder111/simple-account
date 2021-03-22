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

import { CommonActions } from 'services/global';

import 'react-toastify/dist/ReactToastify.css';
import * as roleActions from '../../screens/create/actions';
import * as roleCommonActions from '../../actions';

import { Formik } from 'formik';
const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		RoleActions: bindActionCreators(roleActions, dispatch),
		RoleCommonActions: bindActionCreators(roleCommonActions, dispatch),
	};
};

class UpdateRole extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {},
			loading: true,
			createMore: false,
			checked: [],
			roleList: [],
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExDecimal = /^[0-9]*(\.[0-9]{0,2})?$/;
		this.regEx = /^[0-9\d]+$/;
		this.vatCode = /[a-zA-Z0-9 ]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.id) {
			this.props.RoleCommonActions.getModuleList(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						let tempArray = [];
						res.data.map((value) => {
							tempArray.push(value.moduleId.toString());
						});
						this.setState(
							{
								checked: tempArray,
								initValue: {
									name: res.data ? res.data[0].roleName : '',
									description: res.data ? res.data[0].moduleDescription : '',
								},
								loading: false,
							},
							() => {},
						);
					}
				})
				.catch((err) => {
					this.props.history.push('/admin/settings/user-role');
				});
		} else {
			this.props.history.push('/admin/settings/user-role');
		}
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
			roleID: this.props.location.state.id,
		};
		this.props.RoleActions.updateRole(obj)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Role Updated Successfully!',
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

	onCheck = (checked) => {
		this.setState({ checked }, () => {
			console.log(this.state.checked);
		});
	};

	onExpand = (expanded) => {
		this.setState({ expanded });
	};

	render() {
		const { loading, initValue } = this.state;
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
										<span className="ml-2">Update New Role</span>
									</div>
								</CardHeader>
								<CardBody>
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={6}>
												<Formik
													initialValues={initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values, resetForm);
														// resetForm(this.state.initValue)
													}}
													validate={(values) => {
														// let status = false
														let errors = {};
														if (!values.name) {
															errors.name = 'Name is  required';
														}
														return errors;
													}}
												>
													{(props) => (
														<Form
															onSubmit={props.handleSubmit}
															name="simpleForm"
														>
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
																			this.vatCode.test(option.target.value)
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
																<Label htmlFor="name">Description</Label>
																<Input
																	type="text"
																	id="description"
																	name="description"
																	placeholder="Description"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.vatCode.test(option.target.value)
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
																<Label htmlFor="name">Modules</Label>
																<CheckboxTree
																	checked={checked}
																	expanded={expanded}
																	iconsClass="fa5"
																	nodes={this.state.roleList}
																	onCheck={this.onCheck}
																	onExpand={this.onExpand}
																/>
															</FormGroup>
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
																	<i className="fa fa-dot-circle-o"></i> Update
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
									)}
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

export default connect(mapStateToProps, mapDispatchToProps)(UpdateRole);
