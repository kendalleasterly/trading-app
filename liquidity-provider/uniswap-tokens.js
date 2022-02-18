const { Token, NativeCurrency } = require("@uniswap/sdk-core")

const WETH = new Token(
	137,
	"0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
	18,
	"WETH",
	"Wrapped Ether"
)

class MaticNativeCurrency extends NativeCurrency {
	equals(other) {
	  return other.isNative && other.chainId === this.chainId
	}
  
	get wrapped() {
	  if (!isMatic(this.chainId)) throw new Error('Not matic')
	  return WMATIC
	}
  
 	constructor(chainId) {
	  if (!isMatic(chainId)) throw new Error('Not matic')
	  super(chainId, 18, 'MATIC', 'Polygon Matic')
	}
  }


  function isMatic(chainId) {
	return chainId === 137
  }

const WMATIC = new Token(
	137,
	"0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
	18,
	"WMATIC",
	"Wrapped Matic"
)

const MATIC = new MaticNativeCurrency(137)

const DAI = new Token(
	137,
	"0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
	18,
	"DAI",
	"Dai Stablecoin"
)
const USDT = new Token(
	137,
	"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
	6,
	"USDT",
	"Tether USD"
)

const WBTC = new Token(
	137,
	"0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
	8,
	"WBTC",
	"Wrapped BTC"
)

module.exports = {WETH, MATIC, DAI, USDT, WBTC}