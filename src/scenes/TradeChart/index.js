import React, { Component } from 'react';
import PropTypes from 'prop-types';
import binance from 'node-binance-api';
import { Container, Row, Col } from 'reactstrap';
import './styles.css';
import HorizontalTabList from '../../components/HorizontalTabList';
import InfoPanel from '../../components/InfoPanel';
import Chart from '../../components/Chart';

export default class TradeChart extends Component {
  static propTypes = {
    opts: PropTypes.shape({
      binance: PropTypes.shape({
        key: PropTypes.string.isRequired,
        secret: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  state = {
    cryptoList: [],
    selectedCrypto: { symbol: 'ETHBTC', baseAsset: 'ETH', quoteAsset: 'BTC'},
    quantity: 0,
    currentPrice: 0,
    boughtPrice: 0,
    diffPercentage: 0.01,
    highestPrice: 0,
    sellEnabled: false,
    sold: false,
    alert: { isOpen: true, message: 'Welcome, happy trading!', color: 'primary' },
  };

  componentDidMount = () => {
    binance.options({
      APIKEY: this.props.opts.binance.key,
      APISECRET: this.props.opts.binance.secret,
      reconnect: false,
      test: true,
    });

    this.getCryptoList();
    this.bindSocket(this.state.selectedCrypto.symbol);
  };

  getCryptoList = () => {
    fetch('https://api.binance.com/api/v1/exchangeInfo').then(res => res.json()).then((data) => {
      const cryptoList = data.symbols;
      if (cryptoList.length > 0) {
        this.setState({
          cryptoList,
          selectedCrypto: cryptoList[0],
        });
      }
    });
  };

  setHighestPrice = price => this.setState({ highestPrice: parseFloat(price) });

  isHighestPrice = price => price > this.state.highestPrice;

  shouldSell = (price) => {
    const { sellEnabled, sold, highestPrice, diffPercentage } = this.state;
    if (sellEnabled && !sold) {
      return price <= highestPrice - (highestPrice * diffPercentage);
    }
    return false;
  };

  checkPrice = (price) => {
    if (price < this.state.boughtPrice) return;

    if (this.isHighestPrice(price)) {
      this.setHighestPrice(price);
      return;
    }

    if (this.shouldSell(price)) this.sell(price);
  };

  changeSelectedCrypto = (symbol) => {
    const crypto = this.state.cryptoList.find(obj => obj.symbol === symbol);
    if (crypto === null) return;

    binance.prices((error, ticker) => {
      const currentPrice = parseFloat(ticker[crypto.symbol]);
      this.setState({
        currentPrice,
        sellEnabled: false,
        highestPrice: currentPrice,
      });
    });

    this.setState({
      selectedCrypto: crypto,
    }, () => this.rebindSocket());
  };

  bindSocket = (symbol) => {
    binance.websockets.candlesticks([symbol], '1m', (candlesticks) => {
      const { k: ticks } = candlesticks;
      const { c: close } = ticks;
      const currentPrice = parseFloat(close);

      this.setState({ currentPrice });
      this.checkPrice(currentPrice);
    });
  };

  removeSocket = endpoint => binance.websockets.terminate(endpoint);

  rebindSocket = () => {
    const newCrypto = this.state.selectedCrypto.symbol;
    const newEndpoint = `${newCrypto.toLowerCase()} @kline_1m`;
    const subscriptions = binance.websockets.subscriptions();

    Object.keys(subscriptions).forEach((endpoint) => {
      if (endpoint !== newEndpoint) this.removeSocket(endpoint);
    });

    this.bindSocket(newCrypto);
  };

  render = () => {
    const {
      selectedCrypto, cryptoList, currentPrice
    } = this.state;

    return (
      <div>
        <Container>
          {/* <HorizontalTabList
            list={cryptoList}
            selectedValue={this.state.selectedCrypto.symbol}
            changeSelected={this.changeSelectedCrypto}
          /> */}
        </Container>

        <div className="mt-3">
          <Row>
            <Col><Chart symbol={this.state.selectedCrypto.symbol} /></Col>
          </Row>
        </div>

        <div className="mt-3">
          <Row>
            <Col>
              {/* <InfoPanel
                title={` ${currentPrice} ${selectedCrypto.baseAsset}/${selectedCrypto.quoteAsset}`}
                description="Current price."
              /> */}
            </Col>
          </Row>
        </div>
      </div>
    );
  };
}
