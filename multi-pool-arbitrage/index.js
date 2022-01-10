const app = require("express")();
const {TradeType, CurrencyAmount} = require("@uniswap/sdk-core");

const { tokens, testTokens } = require("./constants");
const {autoRoute, swapExactInputSingle} = require("./uniswap");

const dotenv = require("dotenv");
const { ChainId } = require("@uniswap/smart-order-router");
const { ethers } = require("ethers");
const main = require("./liquidity-advisor");
dotenv.config()

const port = process.env.PORT || 4000;
const privateKey = process.env.WALET_PRIVATE_KEY
const infuraUrl = process.env.INFURA_POLYGON_URL
const infuraTestUrl = process.env.INFURA_POLYGON_MUMBAI_URL

const provider = new ethers.providers.JsonRpcProvider(
	infuraUrl
)

app.get("/test", async (req, res) => {

	// const amount = new CurrencyAmount.fromRawAmount(tokens.WMATIC, 1)
	// const tradeType = TradeType.EXACT_INPUT;

	// autoRoute(amount, tokens.USDC, tradeType, provider, ChainId.POLYGON);

	main(provider)

	res.send("");
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});
