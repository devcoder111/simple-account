import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import './style.scss'

import logo from 'assets/images/brand/logo.png'

const propTypes = {
  children: PropTypes.node
}

const defaultProps = {}

class Footer extends Component {

  render() {

    const {  version } = this.props

    return (
      <React.Fragment>
        <div className="d-flex align-items-center justify-content-between w-100">
          <img src={logo} className="m-2 footer-logo" alt="logo"/>
        
        </div>
      </React.Fragment>
    );
  }
}

Footer.propTypes = propTypes
Footer.defaultProps = defaultProps

export default Footer
