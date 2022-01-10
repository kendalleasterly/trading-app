const { Token } = require("@uniswap/sdk-core");
const { ChainId } = require("@uniswap/smart-order-router");

const tokens = {
	WETH: new Token(
		ChainId.POLYGON,
		"0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
		18,
		"WETH",
		"Wrapped Ether"
	),

	USDC: new Token(
		ChainId.POLYGON,
		"0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		6,
		"USDC",
		"USD Coin"
	),

	USDT: new Token(
		ChainId.POLYGON,
		"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
		6,
		"USDT",
		"Tether USD"
	),

	WMATIC: new Token(
		ChainId.POLYGON,
		"0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
		18,
		"WMATIC",
		"Wrapped Matic")
}

const testTokens = {
	WETH: new Token(
		ChainId.POLYGON_MUMBAI,
		"0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
		18,
		"WETH",
		"Wrapped Ether"
	),

	USDC: new Token(
		ChainId.POLYGON_MUMBAI,
		"0xB0EB6d44C3F18E600c7A565ee0467064f34E21fA",
		6,
		"USDC",
		"USD Coin"
	),

	USDT: new Token(
		ChainId.POLYGON_MUMBAI,
		"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
		6,
		"USDT",
		"Tether USD"
	),

	WMATIC: new Token(
		ChainId.POLYGON_MUMBAI,
		"0x9c3c9283d3e44854697cd22d3faa240cfb032889",
		18,
		"WMATIC",
		"Wrapped Matic"
	),
};

module.exports = {tokens, testTokens}