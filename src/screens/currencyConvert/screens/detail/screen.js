import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	selectCurrencyFactory,
} from 'utils';
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
  Col
} from 'reactstrap'
import { Loader , ConfirmDeleteModal} from 'components'
import Select from 'react-select';
import * as Yup from 'yup';

import {
  CommonActions,AuthActions
} from 'services/global'

import 'react-toastify/dist/ReactToastify.css'
import './style.scss'

import * as DetailCurrencyConvertAction from './actions'
import * as CurrencyConvertActions from '../../actions';

import { Formik } from 'formik';


const mapStateToProps = (state) => {
  return ({
    currencyList: state.currencyConvert.currency_list,
		currency_list: state.common.currency_list,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailCurrencyConvertAction: bindActionCreators(DetailCurrencyConvertAction, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),

  })
}

class DetailCurrencyConvert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: {
      },
      basecurrency:[],
      loading: true,
      dialog: null,
      current_currency_convert_id: null
    }
    this.regExAlpha = /^[a-zA-Z ]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  }

  componentDidMount = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.authActions.getCurrencylist();
      this.getCompanyCurrency();
      this.props.detailCurrencyConvertAction.getCurrencyConvertById(this.props.location.state.id).then((res) => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            current_currency_convert_id: this.props.location.state.id,
            initValue: {
              id:res.data.current_currency_convert_id ? res.data.current_currency_convert_id : '',
              currencyCode: res.data.currencyCode && res.data.currencyCode !== null ? res.data.currencyCode : '',
              exchangeRate: res.data.exchangeRate && res.data.exchangeRate !== null ? res.data.exchangeRate : '',
             
            }
          })
          
        }
      }).catch((err) => {
        this.setState({loading: false})
        this.props.history.push('/admin/master/CurrencyConvert')
      })
    } else {
      this.props.history.push('/admin/master/CurrencyConvert')
    }

  }

  getData = (data) => {
		let temp = {};
		for (let item in data) {
			if (typeof data[`${item}`] !== 'object') {
				temp[`${item}`] = data[`${item}`];
			} else {
				temp[`${item}`] = data[`${item}`].value;
			}
		}
		return temp;
	};

  // Create or Edit Currency
  handleSubmit = (data, resetForm) => {
  	const { current_currency_convert_id } = this.state;
		let postData = this.getData(data);

		postData = { ...postData, ...{ id: current_currency_convert_id } };
      this.props.detailCurrencyConvertAction.updateCurrencyConvert(postData).then((res) => {
      if (res.status === 200) {
        resetForm();
        this.props.commonActions.tostifyAlert('success', 'Currency Conversion Updated Successfully!')
        this.props.history.push('/admin/master/CurrencyConvert')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err.data.message)
    })
  }

  deleteCurrencyConvert = () => {
    const message1 =
			<text>
			<b>Delete Currency Conversion?</b>
			</text>
			const message = 'This Currency Conversion will be deleted permanently and cannot be recovered. ';
    this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeCurrencyConvert}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};	

  removeCurrencyConvert = () => {
    const {current_currency_convert_id} = this.state
    this.props.detailCurrencyConvertAction.deleteCurrencyConvert(current_currency_convert_id).then((res) => {
      if (res.status === 200) {
        // this.success('Chart Account Deleted Successfully');
        this.props.commonActions.tostifyAlert('success', 'Currency Conversion Deleted Successfully')
        this.props.history.push('/admin/master/CurrencyConvert')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  render() {
    const { loading, initValue,dialog} = this.state

    const{currencyList,currency_list} =this.props;
    return (
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2">Update Currency Conversion</span>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Loader></Loader>
                  ) : (
                      <Row>
                        <Col lg={10}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values, { resetForm }) => {
                              this.handleSubmit(values, resetForm);
                            }}
                            validationSchema={Yup.object().shape({
                              exchangeRate: Yup.string().required(
                                'Exchange Rate is Required',
                              ),
                          })}
                          >
                            {(props) => (
                              
                              <Form onSubmit={props.handleSubmit} name="simpleForm">
                                <Row>
                                <Col lg={1}>
																	<FormGroup className="mt-2">
																	<Label>
																							Value
																						</Label>
																	<Input
																			disabled
																				id="1"
																				name="1"
																				value=	{
																					1 }
																				
																			/>
																			</FormGroup>
                                      </Col>
																<Col lg={4}>
                                <FormGroup className="mt-2">
																						<Label htmlFor="currencyCode">
																							Exchange Currency
																						</Label>
																						<Select
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
																											+props.values
																												.currencyCode,
																									)
																							}
																							onChange={(options) => {
																								if (options && options.value) {
																									props.handleChange(
																										'currencyCode',
																									)(options.value);
																								} else {
																									props.handleChange(
																										'currencyCode',
																									)('');
																								}
																							}}
																							placeholder="Select Currency"
																							id="currencyCode"
																							name="currencyCode"
																							className={
																								props.errors.currencyCode &&
																								props.touched.currencyCode
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.currencyCode &&
																							props.touched.currencyCode && (
																								<div className="invalid-feedback">
																									{props.errors.currencyCode}
																								</div>
																							)}
																					</FormGroup>
                                          </Col>
                                          <Col lg={4}>
															        	<FormGroup className="mt-2">
															        	<Label htmlFor="productCategoryCode">
																	Exchange rate
																	{/* <i
																		id="ProductcatcodeTooltip"
																		className="fa fa-question-circle ml-1"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="ProductcatcodeTooltip"
																	>
																		Product Category Code - Unique identifier code of the product 
																	</UncontrolledTooltip> */}
																</Label>
																<Input
																	type="number" maxLength='20'
																	id="exchangeRate"
																	name="exchangeRate"
																	placeholder="Enter Exchange Rate"
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regDecimal.test(option.target.value)
																		) {
                                      props.handleChange('exchangeRate')(
																				option,
																			);
																		}
																	}}
																
																	value={props.values.exchangeRate}
																	className={
                                    props.errors.exchangeRate &&
                                    props.touched.exchangeRate
																			? 'is-invalid'
																			: ''
																	}
																/>
															{props.errors.exchangeRate && props.touched.exchangeRate && (
                                    <div className="invalid-feedback">{props.errors.exchangeRate}</div>
                                  )}
																</FormGroup>
															</Col>
                              <Col lg={3}>
																		<FormGroup className="mt-2">
																		<Label htmlFor="currencyName">
																			{' '}
																			Base Currency 
																		</Label>
																		<Input
																		disabled
																				type="text"
																				id="currencyName"
																				name="currencyName"
																				value=	{
																					this.state.basecurrency.currencyName }
																			/>
																		</FormGroup>
																			</Col>
																			
															</Row>
                                <Row>
                                  <Col lg={10} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                  {this.state.current_currency_convert_id !== 1 &&
																	  (
                                  <FormGroup className="text-right">
                                  <Button
																			type="button"
																			name="button"
																			color="danger"
																			className="btn-square"
																			onClick={this.deleteCurrencyConvert}
																		>
																			<i className="fa fa-trash"></i> Delete
																		</Button>
																	</FormGroup>)}
                                     <FormGroup className="text-right">
                                     {this.state.current_currency_convert_id !== 1 &&
																	  (
                                      <Button type="submit" name="submit" color="primary" className="btn-square mr-3">
                                        <i className="fa fa-dot-circle-o"></i> Update
                                      </Button>)}
                                      <Button type="submit" color="secondary" className="btn-square"
                                        onClick={() => { this.props.history.push('/admin/master/CurrencyConvert') }}>
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
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailCurrencyConvert)
