import React from 'react';

class Currency extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { value, currencySymbol } = this.props;
		if (currencySymbol) {
			var currencyCode = currencySymbol.slice(0, currencySymbol.length - 1);
			var currencySymbolMain = currencySymbol;
		} else {
			var currencyCode = 'US';
			var currencySymbolMain = 'USD';
		}

		return new Intl.NumberFormat('en', {
			style: 'currency',
			currency: currencySymbolMain,
		}).format(value);
	}
}

export default Currency;
