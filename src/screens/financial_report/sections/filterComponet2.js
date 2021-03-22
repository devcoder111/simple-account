
import React, { Component } from 'react';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	FormGroup,
	Label,
	Form,
} from 'reactstrap';
import DatePicker from 'react-datepicker';

import { Formik } from 'formik';
import moment from 'moment';

import './style.scss';

class FilterComponent2 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {
                startDate: moment().startOf('month').format('DD/MM/YYYY'),
				endDate: moment().endOf('month').format('YYYY-MM-DD hh:mm'),
			},
		};
	}

	render() {
		const { initValue } = this.state;
		return (
			<div>
				<Card>
					<CardHeader
						className="d-flex"
						style={{ justifyContent: 'space-between' }}
					>
						<div style={{ fontSize: '1.3rem', paddingLeft: '15px' }}>
							Customize Report
						</div>
						<div>
							<i
								className="fa fa-close"
								style={{ cursor: 'pointer' }}
								onClick={this.props.viewFilter}
							></i>
						</div>
					</CardHeader>
					<CardBody>
						<Formik initialValues={initValue}>
							{(props) => (
								<Form>
									<Row>
                                        <Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="startDate">Start Date</Label>
												<DatePicker
													id="date"
													name="startDate"
													className={`form-control`}
													placeholderText="From"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													maxDate={new Date()}
													value={moment(props.values.startDate).format(
														'DD/MM/YYYY',
													)}
													dropdownMode="select"
													dateFormat="dd/MM/yyyy"
													onChange={(value) => {
														props.handleChange('startDate')(value);
														if (moment(value).isBefore(props.values.startDate)) {
															props.setFieldValue(
																'startDate',
																moment(value).add(1, 'M'),
															);
														}
													}}
												/>
											</FormGroup>
										</Col>
										<Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="endDate">End Date</Label>
												<DatePicker
													id="date"
													name="endDate"
													className={`form-control`}
													autoComplete="off"
													maxDate={new Date()}
													placeholderText="From"
													showMonthDropdown
													showYearDropdown
													value={moment(props.values.endDate).format(
														'DD/MM/YYYY',
													)}
													dropdownMode="select"
													dateFormat="dd/MM/yyyy"
													onChange={(value) => {
														props.handleChange('endDate')(value);
														if (moment(value).isBefore(props.values.endDate)) {
															props.setFieldValue(
																'endDate',
																moment(value).subtract(1, 'M'),
															);
														}
													}}
												/>
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col lg={12} className="mt-5">
											<FormGroup className="text-right">
												<Button
													type="button"
													color="primary"
													className="btn-square mr-3"
													onClick={() => {
														this.props.generateReport(props.values);
													}}
												>
													<i className="fa fa-dot-circle-o"></i> Run Report
												</Button>

												<Button
													color="secondary"
													className="btn-square"
													onClick={this.props.viewFilter}
												>
													<i className="fa fa-ban"></i> Cancel
												</Button>
											</FormGroup>
										</Col>
									</Row>
								</Form>
							)}
						</Formik>
					</CardBody>
				</Card>
			</div>
		);
	}
}
export default FilterComponent2;
