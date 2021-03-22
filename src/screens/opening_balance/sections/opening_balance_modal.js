import React from 'react'
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap'

import { Formik } from 'formik';
import * as Yup from "yup";

import Select from 'react-select'
import { selectOptionsFactory } from "utils";


class OpeningBalanceModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      initValue: {
        accountName: '',
        openingBalance: '',
        currency: ''
      }
    }
    this.regEx = /^[0-9\d]+$/;
    this.formRef = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedRowData !== prevProps.selectedRowData) {
      const { selectedRowData } = this.props
      if (selectedRowData !== '') {
        this.setState({
          initValue: {
            accountName: { label: selectedRowData.accountName, value: selectedRowData.accountId },
            openingBalance: selectedRowData.openingBalance,
            currency: selectedRowData.currency
          }
        })
      } else {
        this.setState({
          initValue: {
            accountName: '',
            openingBalance: '',
            currency: ''
          }
        })
      }
    }
  }

  handleSubmit = (data) => {
    const postData = {
      accountName: data.accountName ? data.accountName.value : '',
      openingBalance: data.openingBalance,
      currency: data.currency

    }
    this.props.createOpeningBalance(postData).then((res) => {
      if (res.status === 200) {
      this.props.closeOpeningBalanceModal()
      }
    })
  }

  render() {
    const { showOpeningBalanceModal, bankAccountList, closeOpeningBalanceModal , selectedRowData } = this.props
    const { initValue } = this.state
    return (
      <div className="opening-balance-screen">
        <div className="animated fadeIn">
          <Modal isOpen={showOpeningBalanceModal}
            className={"modal-primary " + this.props.className}
          >
            <ModalHeader toggle={this.toggleDanger}><i className="nav-icon fas fa-area-chart" /> {selectedRowData ? 'Update' : 'Add'} Opening Balance</ModalHeader>
            <ModalBody>
              <Formik
                initialValues={initValue}
                ref={this.formRef}
                onSubmit={(values, { resetForm }) => {
                  this.handleSubmit(values, resetForm)
                }}
                validationSchema={
                  Yup.object().shape({
                    accountName: Yup.string()
                      .required("Account Name is Required"),
                    openingBalance: Yup.string()
                      .required("Opening Balance is Required"),
                  })
                }
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit}>
                    <FormGroup>
                      <Label htmlFor="categoryCode"><span className="text-danger">*</span>Account</Label>
                      <Select
                      styles={customStyles}
                        options={bankAccountList ? selectOptionsFactory.renderOptions('name', 'bankAccountId', bankAccountList, 'Account') : []}
                        placeholder="Select Account"
                        onChange={(option) => {
                          if (option && option.value) {
                            props.handleChange('accountName')(option)
                          } else {
                            props.handleChange('accountName')('')
                          }
                        }}
                        value={props.values.accountName ? props.values.accountName : ''}
                        className={
                          props.errors.accountName && props.touched.accountName
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {props.errors.accountName && props.touched.accountName && (
                        <div className="invalid-feedback">{props.errors.accountName}</div>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="openingBalance"><span className="text-danger">*</span>Opening Balance</Label>
                      <Input
                        type="text"
                        id="openingBalance"
                        name="openingBalance"
                        placeholder="Enter Opening Balnce"
                        onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)) { props.handleChange('openingBalance')(option) } }}
                        value={props.values.openingBalance}
                        autoComplete="off"
                        className={
                          props.errors.openingBalance && props.touched.openingBalance
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {props.errors.openingBalance && props.touched.openingBalance && (
                        <div className="invalid-feedback">{props.errors.openingBalance}</div>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="categoryCode">Currency</Label>
                      <Input
                        type="text"
                        id="categoryCode"
                        name="categoryCode"
                        placeholder="Currency"
                        disabled
                        value={props.values.currency}
                      />
                    </FormGroup>
                  </Form>
                )}
              </Formik>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="button" className="btn-square" onClick={() => { this.formRef.current.handleSubmit() }}>Save</Button>&nbsp;
                <Button color="secondary" className="btn-square" onClick={closeOpeningBalanceModal}>Cancel</Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    )
  }
}

export default OpeningBalanceModal
