const app = require("express")();
const {TradeType, CurrencyAmount} = require("@uniswap/sdk-core");

const { tokens } = require("./constants");
const {autoRoute} = require("./uniswap");

const port = process.env.PORT || 4000;

app.get("/test", async (req, res) => {

	const amount = new CurrencyAmount.fromRawAmount(tokens.WMATIC, 1)
	const tradeType = TradeType.EXACT_INPUT;

	autoRoute(amount, tokens.USDC, tradeType);

	res.send("");
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});
