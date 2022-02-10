const {
	abi: QuoterAbi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const {
	abi: IUniswapV3Factory,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json");
const {
	abi: ISwapRouter,
} = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");

const {ethers, BigNumber} = require("ethers");
const {Token, TradeType, CurrencyAmount, Percent} = require("@uniswap/sdk-core");
const {Pool, Route, Trade} = require("@uniswap/v3-sdk");
const {AlphaRouter} = require("@uniswap/smart-order-router");
const { Immutables, State } = require("./uniswap-types");

async function getPoolImmutables(poolContract) {
	const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
		await Promise.all([
			poolContract.factory(),
			poolContract.token0(),
			poolContract.token1(),
			poolContract.fee(),
			poolContract.tickSpacing(),
			poolContract.maxLiquidityPerTick(),
		]);

	return new Immutables(
		factory,
		token0,
		token1,
		fee,
		tickSpacing,
		maxLiquidityPerTick
	);
}

async function getPoolState(poolContract) {
	const [liquidity, slot] = await Promise.all([
		poolContract.liquidity(),
		poolContract.slot0(),
	]);

	return new State(
		liquidity,
		slot[0],
		slot[1],
		slot[2],
		slot[3],
		slot[4],
		slot[5],
		slot[6]
	);
}

async function makeTrade(amountIn, pool, provider) {
	const [immutables, state] = await Promise.all([
		getPoolImmutables(pool),
		getPoolState(pool),
	]);

	const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"; //constant in all chains
	const quoterContract = new ethers.Contract(
		quoterAddress,
		QuoterAbi,
		provider
	);

	const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
		immutables.token0,
		immutables.token1,
		immutables.fee,
		amountIn.toString(),
		0
	);

	const TokenA = new Token(3, immutables.token0, 6, "USDC", "USD Coin");
	const TokenB = new Token(3, immutables.token1, 18, "WETH", "Wrapped Ether");

	const poolExample = new Pool(
		TokenA,
		TokenB,
		immutables.fee,
		state.sqrtPriceX96.toString(),
		state.liquidity.toString(),
		state.tick
	);

	const swapRoute = new Route([poolExample], TokenA, TokenB);

	const uncheckedTradeExample = await Trade.createUncheckedTrade({
		route: swapRoute,
		inputAmount: CurrencyAmount.fromRawAmount(TokenA, amountIn.toString()),
		outputAmount: CurrencyAmount.fromRawAmount(
			TokenB,
			quotedAmountOut.toString()
		),
		tradeType: TradeType.EXACT_INPUT,
	});

	

	console.log("quoted amount:", quotedAmountOut.toString());
	// console.log("unchecked trade", uncheckedTradeExample);
	console.log(
		uncheckedTradeExample.swaps[0].outputAmount,
		uncheckedTradeExample.swaps[0].route
	);
}

async function getSpotPrices() {
	const [immutables, state] = await Promise.all([
		getPoolImmutables(),
		getPoolState(),
	]);

	const USDC = new Token(3, immutables.token0, 6, "USDC", "USD Coin");
	const WETH = new Token(3, immutables.token1, 18, "WETH", "Wrapped Ether");

	const usdcWethPool = new Pool(
		USDC,
		WETH,
		immutables.fee,
		state.sqrtPriceX96.toString(),
		state.liquidity.toString(),
		state.tick
	);
}

async function autoRoute(amount, quoteCurrency, tradeType, provider, chainID) {

	const router = new AlphaRouter({chainId: chainID, provider: provider});

	const route = await router.route(amount, quoteCurrency, tradeType, {
		recipient: "0x25CCa0D866E36b00d3a5C07339122123AeF918F1",
		slippageTolerance: new Percent(5, 100),
		deadline: Math.floor((Date.now() / 1000)) + 60
	});

	// const route = await router.route(amount, quoteCurrency, tradeType);

	console.log(route)
	
	const finalRoute = route.trade.swaps[0].route
	const pool = finalRoute.pools[0]

	

	console.log(
		pool.token0.name,
		finalRoute.midPrice.toSignificant(6)
	);

	console.log(
		pool.token1.name,
		finalRoute.midPrice.invert().toSignificant(6)
	);

	// const transactionData = {
	// 	data: route.methodParameters.calldata,
	// 	to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
	// 	value: BigNumber.from(route.methodParameters.value),
	// 	from: "0x25CCa0D866E36b00d3a5C07339122123AeF918F1",
	// 	gasPrice: BigNumber.from(route.gasPriceWei)
	// };

	// const tx = await signer.sendTransaction(transactionData)

	// console.log(tx)
}

async function getPool(token0, token1, provider) {
	const factoryContract = new ethers.Contract(
		"0x1F98431c8aD98523631AE4a59f267346ea31F984",
		IUniswapV3Factory,
		provider
	);

	const pool = await factoryContract.getPool(token0.address, token1.address, 3000)

	return pool
}

async function test() {

}

async function swapExactInputSingle(tokenIn, tokenOut, fee, amountIn, amountOutMinimum, sqrtPriceLimitX96, provider) {
	const swapRouter = new ethers.Contract(
		"0xE592427A0AEce92De3Edee1F18E0157C05861564",
		ISwapRouter,
		provider)

	const a = await swapRouter.functions
	console.log(a)
}

module.exports = {
	test,
	getSpotPrices,
	makeTrade,
	autoRoute,
	getPool,
	swapExactInputSingle,
	getPoolImmutables,
	getPoolState
};