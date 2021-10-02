import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import TradeChart from "./TradeChart";


const Root = ({ opts }) => (
  <Router>
    <Switch>
      <Route
        exact
        path="/"
        render={props => <TradeChart {...props} opts={opts} />}
      />
      <Route render={props => <TradeChart {...props} opts={opts} />} />
    </Switch>
  </Router>
);

Root.propTypes = {
  opts: PropTypes.shape({
    binance: PropTypes.shape({
      key: PropTypes.string.isRequired,
      secret: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Root;
