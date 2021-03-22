import React, { Component } from 'react';
import { Card, CardBody, Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import { Currency } from 'components';

class ExpenseTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	getRibbonColor = (expenseData) => {
		if (expenseData.expenseStatus == 'Draft') {
			return 'pending-color';
		} else if (expenseData.expenseStatus == 'Posted') {
			return 'saved-color';
		} else {
			return 'saved-color';
		}
	};

	render() {
		const { expenseData} = this.props;
		return (
			<div>
				<Card id="singlePage" className="box">
					{/* <div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							expenseData,
						)}`}
					>
						<span>{expenseData.expenseStatus}</span>
					</div> */}
					<CardBody style={{ marginTop: '2.5rem' }}>
						<div
							style={{
								width: '100%',
								border:'1px solid',
								padding:'7px',borderColor:'#c8ced3'
							}}
						>
							
							<div style={{ justifyContent:'center' ,
													textAlign: '-webkit-center'}}>
						
											<td
												style={{
													
													fontSize: '1.2rem',
													// fontWeight: '700',
													textTransform: 'uppercase',
													color: 'black',
													textAlign:'center'
												}}
											>
												<b>Expense</b>
											</td>						
									</div>
									<div style={{ textAlign:'center'}}>
													<div className="companyDetails">
														<img
															src={logo}
															className=""
															alt=""
															style={{ width: ' 200px' }}
														/>
												
													</div>
												</div>
									<div style={{textAlign:'center'}}><h4> {expenseData.payee} </h4></div>
									<div style={{textAlign:'center'}}><b>Expense Date</b> : {moment(expenseData.expenseDate ).format('DD/MM/YYYY')}</div>
					</div>
<div style={{backgroundColor:'rgb(32 100 216)', height:'45px'}}></div>
					<div className="card text-start border"
						style={{
							width: '100%',
							display: 'flex',
							border:'1px solid',				
							borderColor:'#c8ced3'
						}}>

<Table  striped>
<tbody  >
    <tr>      <td className="ml-3" style={{width:'245px'}}>	<b>Paid To</b> :</td> 
	           <td> {expenseData.payee}</td>
	</tr>

	<tr>      <td className="ml-3" style={{width:'245px'}} >	<b>Expense Category</b> :</td>
	           <td> {expenseData.transactionCategoryName}</td>
	</tr>

	<tr>      <td className="ml-3" style={{width:'245px'}}>  <b>Expense Amount</b> :	</td> 
	           <td>{expenseData.expenseAmount}</td>
    </tr>

	{/* <tr>      <td className="ml-3" style={{width:'245px'}}>  <b>Expense No</b> : </td>  
			  <td>{expenseData.expenseId}</td>
	</tr> */}

	<tr>      <td className="ml-3" style={{width:'245px'}}>	<b>Vat Type</b> : </td>  
	          <td>{expenseData.vatCategoryName} </td>
	</tr>
	
	<tr>      <td className="ml-3" style={{width:'245px'}}>	<b>Receipt Number</b> : </td>  
	          <td>{expenseData.receiptNumber} </td>
	</tr>
	
	
	<tr>      <td className="ml-3" style={{width:'245px'}}>	<b>Expense Description</b> : </td>  
	          <td>{expenseData.expenseDescription} </td>
	</tr>

	<tr>      <td className="ml-3" style={{width:'245px'}}>	<b>Receipt Description</b> : </td>  
	          <td>{expenseData.receiptAttachmentDescription} </td>
	</tr>

	<tr>      <td className="ml-3" style={{width:'245px'}}>	<b>Posted Date</b> : </td> 
	          <td>{moment(expenseData.lastUpdateDate).format('DD/MM/YYYY')}</td>
	</tr>
</tbody>
</Table>
                                  
									{/* <div>
									<b>Last Updated By</b> : {expenseData.lastUpdatedBy}
									</div> */}
									
					</div>											
					</CardBody>
					<div style={{ textAlignLast:'center'}}> Powered By <b>SimpleAccounts</b></div> 
				</Card>
			</div>
		);
	}
}

export default ExpenseTemplate;
