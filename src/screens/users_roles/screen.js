import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Row,
	Input,
	ButtonGroup,
	Col,
	Form,
	FormGroup,
	Label,
} from 'reactstrap';
import { ToastContainer } from 'react-toastify';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import Select from 'react-select';

import { Loader } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';

import * as RolesActions from './actions';

const mapStateToProps = (state) => {
	return {
		role_list: state.user.role_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		rolesActions: bindActionCreators(RolesActions, dispatch),
	};
};

class UsersRoles extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openInviteUserModal: false,
			loading: false,
			users: [
				{
					name: 'niklas',
					email: 'niklas@niklas.com',
					avatar: 'assets/images/avatars/6.jpg',
					role: 'Admin',
					status: 'active',
				},
				{
					name: 'admin',
					email: 'admin@admin.com',
					avatar: 'assets/images/avatars/6.jpg',
					role: 'Accountant',
					status: 'pending',
				},
				{
					name: 'user',
					email: 'user@user.com',
					avatar: 'assets/images/avatars/6.jpg',
					role: 'Employee',
					status: 'active',
				},
			],
		};
		this.options = {
			onRowClick: this.goToDetail,
		};

		
	}

	componentDidMount = () => {
		this.initializeData();
	};
	initializeData = () => {
		this.props.rolesActions.getRoleList();
	};

	// Show Invite User Modal
	showInviteUserModal = () => {
		this.setState({ openInviteUserModal: true });
	};
	// Cloase Confirm Modal
	closeInviteUserModal = () => {
		this.setState({ openInviteUserModal: false });
	};

	goToDetail = (row) => {
		this.props.history.push('/admin/settings/user-role/update', {
			id: row.roleCode,
		});
	};

	getUserName = (cell, row) => {
		return (
			<div className="d-flex">
					<div className="ml-2">
					<div>{row.roleName}</div>
				</div>
			</div>
		);
	};

	render() {
		const { loading, openInviteUserModal } = this.state;
		const containerStyle = {
			zIndex: 1999,closeOnClick: true,
			draggable: true
		};
		const { role_list } = this.props;
		return (
			<div className="transaction-category-screen">
				<div className="animated fadeIn">
					<ToastContainer
						closeOnClick
            			draggable					
						position="top-right"
						autoClose={1700}
						style={containerStyle}
					/>

					<Card>
						<CardHeader>
							<div className="h4 mb-0 d-flex align-items-center">
								<i className="nav-icon fas fa-users" />
								<span className="ml-2">Role</span>
							</div>
						</CardHeader>
						<CardBody>
							{loading ? (
								<Loader></Loader>
							) : (
								<Row>
									<Col lg="12">
										<div className="d-flex justify-content-end"></div>
										{/* <div className="py-3">
											<h5>Filter : </h5>
											<Row>
												<Col lg={2} className="mb-1">
													<Input type="text" placeholder="User Name" />
												</Col>
												<Col lg={2} className="mb-1">
													<Select
														className=""
														options={role_list}
														placeholder="User Role"
													/>
												</Col>
											</Row>
										</div> */}
										<Button
											color="primary"
											style={{ marginBottom: '10px' }}
											className="btn-square"
											onClick={() =>
												this.props.history.push(
													`/admin/settings/user-role/create`,
												)
											}
										>
											<i className="fas fa-plus mr-1" />
											Add New Role
										</Button>
										<BootstrapTable
											data={role_list}
											hover
											pagination
											version="4"
											search={false}
											selectRow={this.selectRowProp}
											options={this.options}
											trClassName="cursor-pointer"
										>
											<TableHeaderColumn
												isKey
												dataField="email"
												dataFormat={this.getUserName}
												dataSort
											>
												User Detail
											</TableHeaderColumn>
											<TableHeaderColumn dataField="roleName" dataSort>
												Role
											</TableHeaderColumn>
										</BootstrapTable>
									</Col>
								</Row>
							)}
						</CardBody>
					</Card>

					<Modal
						isOpen={openInviteUserModal}
						className={'modal-success ' + this.props.className}
					>
						<ModalHeader toggle={this.toggleDanger}>Invite User</ModalHeader>
						<ModalBody>
							<Form onSubmit={this.handleSubmit} name="simpleForm">
								<FormGroup>
									<Label htmlFor="categoryName">*Company Name</Label>
									<Input
										type="text"
										id="categoryName"
										name="categoryName"
										placeholder="Enter User Name"
										required
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="categoryCode">*Email</Label>
									<Input
										type="text"
										id="categoryCode"
										name="categoryCode"
										placeholder="Enter Email"
										required
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="categoryCode">Position</Label>
									<Select
										className="select-min-width"
										options={[]}
										placeholder="Position"
									/>
								</FormGroup>
							</Form>
						</ModalBody>
						<ModalFooter>
							<Button
								color="success"
								className="btn-square"
								onClick={this.closeInviteUserModal}
							>
								Send
							</Button>
							&nbsp;
							<Button
								color="secondary"
								className="btn-square"
								onClick={this.closeInviteUserModal}
							>
								No
							</Button>
						</ModalFooter>
					</Modal>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersRoles);
