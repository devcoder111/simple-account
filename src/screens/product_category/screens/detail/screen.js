import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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

import {
  CommonActions
} from 'services/global'
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css'
import './style.scss'

import * as DetailProductCategoryAction from './actions'

import { Formik } from 'formik';


// const mapStateToProps = (state) => {
//   return ({

//   })
// }
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailProductCategoryAction: bindActionCreators(DetailProductCategoryAction, dispatch)
  })
}

class DetailProductCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: {},
      loading: true,
      dialog: null,
      current_product_category_id: null
    }
    this.regExAlpha = /^[a-zA-Z ]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExSpaceBoth = /[a-zA-Z0-9 ]+$/;
  }

  componentDidMount = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.detailProductCategoryAction.getProductCategoryById(this.props.location.state.id).then((res) => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            current_product_category_id: this.props.location.state.id,
            initValue: {
              id:res.data.id ? res.data.id : '',
              productCategoryCode: res.data.productCategoryCode ? res.data.productCategoryCode : '',
              productCategoryName: res.data.productCategoryName ? res.data.productCategoryName : ''
            }
          })
        }
      }).catch((err) => {
        this.setState({loading: false})
        this.props.history.push('/admin/master/product-category')
      })
    } else {
      this.props.history.push('/admin/master/product-category')
    }
  }

  // Create or Edit Vat
  handleSubmit = (data) => {
    const { id, productCategoryName, productCategoryCode } = data;
    const postData = {
      id,
      productCategoryName: productCategoryName ? productCategoryName : '',
      productCategoryCode: productCategoryCode ? productCategoryCode : ''
    }
    this.props.detailProductCategoryAction.updateProductCategory(postData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'Product Category Updated Successfully!')
        this.props.history.push('/admin/master/product-category')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err.data.message)
    })
  }

  deleteProductCategory = () => {
    const message1 =
			<text>
			<b>Delete Product Category?</b>
			</text>
			const message = 'This Product Category will be deleted permanently and cannot be recovered. ';
    this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeProductCategory}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeProductCategory = () => {
    const {current_product_category_id} = this.state
    this.props.detailProductCategoryAction.deleteProductCategory(current_product_category_id).then((res) => {
      if (res.status === 200) {
        // this.success('Chart Account Deleted Successfully');
        this.props.commonActions.tostifyAlert('success', 'ProductCategory Deleted Successfully')
        this.props.history.push('/admin/master/product-category')
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
                    <span className="ml-2">Update Product Category</span>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Loader></Loader>
                  ) : (
                      <Row>
                        <Col lg={6}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values) => {
                              this.handleSubmit(values)
                            }}
                          validationSchema={Yup.object().shape({
                            productCategoryName: Yup.string()
                              .required("Product Category Name is Required"),
                              productCategoryCode: Yup.string()
                              .required("Code is Required")
                          })}
                          >
                            {(props) => (
                              <Form onSubmit={props.handleSubmit} name="simpleForm">
                                <FormGroup>
                                  <Label htmlFor="productCategoryCode"><span className="text-danger">*</span>Product Category Code</Label>
                                  <Input
                                    type="text"
                                    id="productCategoryCode"
                                    name="productCategoryCode"
                                    placeholder="Enter Product Category Code"
                                    onChange={(option) => { if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('productCategoryCode')(option) }}}
                                    value={props.values.productCategoryCode}
                                    className={
                                      props.errors.productCategoryCode && props.touched.productCategoryCode
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.productCategoryCode && props.touched.productCategoryCode && (
                                    <div className="invalid-feedback">{props.errors.productCategoryCode}</div>
                                  )}
                                </FormGroup>
                                <FormGroup>
                                  <Label htmlFor="productCategoryName"><span className="text-danger">*</span>Product Category Name</Label>
                                  <Input
                                    type="text"
                                    id="productCategoryName"
                                    name="productCategoryName"
                                    placeholder="Enter Product Category Name"
                                    onChange={(option) => { if (option.target.value === '' || this.regExSpaceBoth.test(option.target.value)){ 
                                      props.handleChange('productCategoryName')(option) }}}
                                    value={props.values.productCategoryName}
                                    className={
                                      props.errors.productCategoryName && props.touched.productCategoryName
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  
                                  {props.errors.productCategoryName && props.touched.productCategoryName && (
                                    <div className="invalid-feedback">{props.errors.productCategoryName}</div>
                                  )}
                                </FormGroup>
                                <Row>
                                  <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                    <FormGroup>
                                      <Button type="button" color="danger" className="btn-square" onClick={this.deleteProductCategory}>
                                        <i className="fa fa-trash"></i> Delete
                                      </Button>
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                      <Button type="submit" name="submit" color="primary" className="btn-square mr-3">
                                        <i className="fa fa-dot-circle-o"></i> Update
                                      </Button>
                                      <Button type="submit" color="secondary" className="btn-square"
                                        onClick={() => { this.props.history.push('/admin/master/product-category') }}>
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

export default connect(null, mapDispatchToProps)(DetailProductCategory)
