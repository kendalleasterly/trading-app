const app = require("express")();
const {TradeType, CurrencyAmount} = require("@uniswap/sdk-core");

const {tokens, testTokens} = require("./constants");
const {autoRoute, swapExactInputSingle} = require("./uniswap");

const dotenv = require("dotenv");
const {ChainId} = require("@uniswap/smart-order-router");
const {ethers} = require("ethers");
// const main = require("../liquidity/liquidity-advisor");
const {default: axios} = require("axios");
dotenv.config();

const port = process.env.PORT || 4000;
const privateKey = process.env.WALET_PRIVATE_KEY;
const infuraUrl = process.env.INFURA_POLYGON_URL;
const infuraTestUrl = process.env.INFURA_POLYGON_MUMBAI_URL;

const provider = new ethers.providers.JsonRpcProvider(infuraUrl);

app.get("/test", async (req, res) => {
	// const amount = new CurrencyAmount.fromRawAmount(tokens.WMATIC, 1)
	// const tradeType = TradeType.EXACT_INPUT;

	// autoRoute(amount, tokens.USDC, tradeType, provider, ChainId.POLYGON);

	main(provider);

	res.send("");
});

app.get("/prices", async (req, res) => {
	
	const serverURL =
		"https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon";

	const pools = [
		"0x86f1d8390222a3691c28938ec7404a1661e618e0",
		"0x167384319b41f7094e62f7506409eb38079abff8",
		"0x9f2b55f290fb1dd0c80d685284dbef91ebeea480",
	];

	const queryData = `
		token0Price
		token0 {
			symbol
		}
    	token1Price
		token1 {
			symbol
		}
		feeTier
    `;

	pools.map((pool) => {
		axios.post(serverURL, {query: `{
  pool(id: "${pool}") {
		${queryData}
  }
}`}).then((response) => {
			const data = response.data.data
			const pool = data.pool;

			console.log({pool})

		})
		.catch(err => {
			console.log("error", err)
		})
	})


	
	res.send("")
})

app.get("/liquidity-advisor", async (req, res) => {
	const serverURL =
		"https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon";

	const pools = [
		"0x3f5228d0e7d75467366be7de2c31d0d098ba2c23",
		"0x42f0530351471dab7ec968476d19bd36af9ec52d",
		"0x5f69c2ec01c22843f8273838d570243fd1963014",
	];

	const queryData = `
	token0{
      symbol
    }
    token1 {
      symbol
    }
    poolDayData(first: 10, skip: 1, orderBy: date, orderDirection: desc) {
      feesUSD
	  tvlUSD
    }`;

	pools.map((pool) => {
		axios.post(serverURL, {query: `{
  pool(id: "${pool}") {
		${queryData}
  }
}`}).then((response) => {
			const data = response.data.data
			const pool = data.pool;

			const tokens = `${pool.token0.symbol}/${pool.token1.symbol}`;

			let totalFees = 0
			let totalValue = 0

			pool.poolDayData.map((obj) => {
				const fees = Number(obj.feesUSD)
				totalFees+= fees

				const value = Number(obj.tvlUSD)
				totalValue+= value
			})

			const averageFees = totalFees / pool.poolDayData.length;
			const averageValue = totalValue / pool.poolDayData.length

			const inputValue = 100

			const lpWeight = inputValue / averageValue;
			const dayYield = lpWeight * averageFees;
			const yearYield = dayYield * 356
			const apy = (yearYield / inputValue) * 100;

			console.log({tokens, averageFees, averageValue, dayYield, yearYield, apy});

		})
		.catch(err => {
			console.log("error", err)
		});
		
	});

	res.send("");
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});
