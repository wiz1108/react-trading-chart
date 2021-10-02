import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'reactstrap';
import TradingViewWidget from 'react-tradingview-widget';
import './styles.css';

const Chart = ({ symbol }) => (
  <Card id="chart">
    <TradingViewWidget
      symbol="OANDA:EURUSD"
      theme="Dark"
      hide_side_toolbar={false}
      autosize
    />
  </Card>
);

Chart.propTypes = {
  symbol: PropTypes.string.isRequired,
};

export default Chart;
