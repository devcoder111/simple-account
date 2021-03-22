import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
  Label
} from 'reactstrap'
import Select from 'react-select'
import DatePicker from 'react-datepicker'

import { Formik } from 'formik';
import * as Yup from "yup";
import moment from 'moment'


import {
  CommonActions
} from 'services/global'
import { selectOptionsFactory } from 'utils'
import * as ReceiptActions from '../../actions';
import * as ReceiptDetailActions from './actions';

import { Loader, ConfirmDeleteModal } from 'components'


import 'react-datepicker/dist/react-datepicker.css'

import './style.scss'

const mapStateToProps = (state) => {
  return ({
    contact_list: state.receipt.contact_list,
    invoice_list: state.receipt.invoice_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    receiptDetailActions: bindActionCreators(ReceiptDetailActions, dispatch),
    receiptActions: bindActionCreators(ReceiptActions, dispatch)
  })
}
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

class DetailReceipt extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      dialog: null,
      initValue: {},
      current_receipt_id: null
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
  }


  componentDidMount = () => {
    this.initializeData()
  }

  initializeData = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.receiptActions.getContactList();
      this.props.receiptActions.getInvoiceList();
      this.props.receiptDetailActions.getReceiptById(this.props.location.state.id).then((res) => {
        // this.props.receiptActions.getTitleList()
        if (res.status === 200) {
          this.setState({
            current_receipt_id: this.props.location.state.id,
            initValue: {
              receiptNo: res.data.receiptNo,
              contactId: res.data.contactId ? res.data.contactId : '',
              referenceCode: res.data.referenceCode,
              receiptDate: res.data.receiptDate ? res.data.receiptDate : '',
              unusedAmount: res.data.unusedAmount,
              amount: res.data.amount,
              invoiceId: res.data.invoiceId ? res.data.invoiceId : ''
            },
            loading: false,
          })
        }
      }).catch((err) => {
        this.props.commonActions.tostifyAlert('error', err ? err.data.message : 'Something Went Wrong' )
        this.setState({ loading: false })
      })
    } else {
      this.props.history.push('admin/revenue/receipt')
    }
  }

  handleSubmit = (data) => {
    const { current_receipt_id } = this.state
    const {
      receiptDate,
      receiptNo,
      referenceCode,
      contactId,
      invoiceId,
      amount,
      unusedAmount
    } = data

    const postData = {
      receiptId: current_receipt_id,
      receiptNo: receiptNo ? receiptNo : '',
      referenceCode: referenceCode ? referenceCode : '',
      receiptDate: receiptDate ? receiptDate : '',
      contactId: contactId && contactId !== null ? contactId : '',
      amount: amount ? amount : '',
      unusedAmount: unusedAmount ? unusedAmount : '',
      invoiceId: invoiceId && invoiceId !== null ? invoiceId : ''
    }
    this.props.receiptDetailActions.updateReceipt(postData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'Reeceipt Updated successfully!')
        this.props.history.push('/admin/revenue/receipt')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
    })
  }

  deleteReceipt = () => {
    const message1 =
        <text>
        <b>Delete Income Receipt?</b>
        </text>
        const message = 'This Income Receipt will be deleted permanently and cannot be recovered. ';
        this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeReceipt}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeReceipt = () => {
    const {current_receipt_id} = this.state;
    this.props.receiptDetailActions.deleteReceipt(current_receipt_id).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'Receipt Deleted Successfully');
        this.props.history.push('/admin/revenue/receipt')
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

    const { contact_list, invoice_list } = this.props
    const { loading, dialog, initValue } = this.state

    return (
      <div className="detail-receipt-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fa fa-file-o" />
                        <span className="ml-2">Update Receipt</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  {loading ?
                    (
                      <Loader />
                    )
                    :
                    (
                      <Row>
                        <Col lg={12}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values, { resetForm }) => {

                              this.handleSubmit(values)
                            }}
                            validationSchema={
                              Yup.object().shape({
                                receiptDate: Yup.date()
                                  .required("Receipt Date is Required"),
                                referenceCode: Yup.string()
                                  .required("Reference Number is Required"),
                                contactId: Yup.string()
                                  .required('Customer is required'),
                                amount: Yup.string()
                                  .required('Amount is required')
                                  .matches(/^[0-9]+$/, { message: "Please enter valid Amount.", excludeEmptyString: false })

                              })}
                          >
                            {(props) => (
                              <Form onSubmit={props.handleSubmit}>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="receiptNo">Receipt Number</Label>
                                      <Input
                                        type="text"
                                        id="receiptNo"
                                        name="receiptNo"
                                        placeholder="Receipt Number"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('receiptNo')(option)}
                                        }}
                                        value={props.values.receiptNo}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="receipt_date"><span className="text-danger">*</span>Receipt Date</Label>
                                      <DatePicker
                                        id="date"
                                        name="receiptDate"
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd/MM/yyyy"
                                        dropdownMode="select"
                                        placeholderText="Receipt Date"
                                        value={props.values.receiptDate ? moment(props.values.receiptDate).format('DD-MM-YYYY') : ''}
                                        onChange={(value) => {
                                          props.handleChange("receiptDate")(value)
                                        }}
                                        className={`form-control ${props.errors.receiptDate && props.touched.receiptDate ? "is-invalid" : ""}`}
                                        />
                                        {props.errors.receiptDate && props.touched.receiptDate && (
                                          <div className="invalid-feedback">{props.errors.receiptDate}</div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="referenceCode"><span className="text-danger">*</span>Reference Number</Label>
                                      <Input
                                        type="text"
                                        id="referenceCode"
                                        name="referenceCode"
                                        placeholder="Reference Number"
                                        value={props.values.referenceCode}
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('referenceCode')(option)}
                                        }}
                                        className={`form-control ${props.errors.referenceCode && props.touched.referenceCode ? "is-invalid" : ""}`}
                                        />
                                        {props.errors.referenceCode && props.touched.referenceCode && (
                                          <div className="invalid-feedback">{props.errors.referenceCode}</div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="customer_name"><span className="text-danger">*</span>Customer Name</Label>
                                      <Select
                                        options={contact_list ? selectOptionsFactory.renderOptions('label', 'value', contact_list, 'Customer Name') : []}
                                        placeholder="Customer Name"
                                        value={contact_list && contact_list.find((option) => option.value === +props.values.contactId)}
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange('contactId')(option.value)
                                          } else {
                                            props.handleChange('contactId')('')
                                          }
                                        }}
                                        className={`${props.errors.contactId && props.touched.contactId ? "is-invalid" : ""}`}
                                        />
                                        {props.errors.contactId && props.touched.contactId && (
                                          <div className="invalid-feedback">{props.errors.contactId}</div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="invoice">Invoice</Label>
                                      <Select
                                      styles={customStyles}
                                        options={invoice_list ? selectOptionsFactory.renderOptions('label', 'value', invoice_list, 'Invoice Number') : []}
                                        className="select-default-width"
                                        placeholder="Invoice Number"
                                        value={invoice_list && invoice_list.find((option) => option.value === +props.values.invoiceId)}
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange('invoiceId')(option.value)
                                          } else {
                                            props.handleChange('invoiceId')('')

                                          }
                                        }}
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <hr />
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="mode">Mode(TBD)</Label>
                                      <Select
                                      styles={customStyles}
                                        className="select-default-width"
                                        options={[]}
                                        id="mode"
                                        name="mode"
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="amount"><span className="text-danger">*</span>Amount</Label>
                                      <Input
                                      type="number"
                                        id="amount"
                                        name="amount"
                                        placeholder="Amount"
                                        onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('amount')(option) }}}
                                        value={props.values.amount}
                                        className={`form-control ${props.errors.amount && props.touched.amount ? "is-invalid" : ""}`}
    
                                      />
                                      {props.errors.amount && props.touched.amount && (
                                        <div className="invalid-feedback">{props.errors.amount}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="unusedAmount">Unused Amount</Label>
                                      <Input
                                       type="number"
                                        id="unusedAmount"
                                        name="unusedAmount"
                                        placeholder="Unused Amount"
                                        onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('unusedAmount')(option) }}}
                                        value={props.values.unusedAmount}
    
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                    <FormGroup>
                                      <Button color="danger" className="btn-square" onClick={this.deleteReceipt}>
                                        <i className="fa fa-trash"></i> Delete
                                </Button>
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                      <Button type="submit" color="primary" className="btn-square mr-3">
                                        <i className="fa fa-dot-circle-o"></i> Update
                                </Button>
                                      <Button color="secondary" className="btn-square"
                                        onClick={() => { this.props.history.push('/admin/revenue/receipt') }}>
                                        <i className="fa fa-ban"></i> Cancel
                                </Button>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </Form>
                            )
                            }
                          </Formik>

                        </Col>
                      </Row>
                    )


                  }

                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailReceipt)

