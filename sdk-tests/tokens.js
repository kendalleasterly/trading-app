const {Token, ChainId} = require("@uniswap/sdk");


const WMATIC = new Token(
	137,
	"0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
	18,
	"WMATIC",
	"Wrapped Matic"
);

const USDC = new Token(
	137,
	"0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	6,
	"USDC",
	"USD Coin (PoS)"
);

module.exports = {
	WMATIC,
    USDC
};
