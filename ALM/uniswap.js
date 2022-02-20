const ethers = require("ethers")
const {Pool} = require("@uniswap/v3-sdk")

async function getPoolInfo(tokenA, tokenB, poolAddress) {
	const [immutables, state] = await Promise.all([
		getPoolImmutables(poolAddress),
		getPoolState(poolAddress),
	]);

	const POOL = new Pool(
		tokenA,
		tokenB,
		immutables.fee,
		state.sqrtPriceX96.toString(),
		state.liquidity.toString(),
		state.tick
	);

	return [POOL, immutables, state];
}

async function getPoolImmutables(poolAddress) {
	const poolContract = new ethers.Contract(
		poolAddress,
		IUniswapV3PoolABI,
		provider
	);

	const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
		await Promise.all([
			poolContract.factory(),
			poolContract.token0(),
			poolContract.token1(),
			poolContract.fee(),
			poolContract.tickSpacing(),
			poolContract.maxLiquidityPerTick(),
		]);

	const immutables = {
		factory,
		token0,
		token1,
		fee,
		tickSpacing,
		maxLiquidityPerTick,
	};
	return immutables;
}

async function getPoolState(poolAddress) {
	const poolContract = new ethers.Contract(
		poolAddress,
		IUniswapV3PoolABI,
		provider
	);

	const [liquidity, slot] = await Promise.all([
		poolContract.liquidity(),
		poolContract.slot0(),
	]);

	const PoolState = {
		liquidity,
		sqrtPriceX96: slot[0],
		tick: slot[1],
		observationIndex: slot[2],
		observationCardinality: slot[3],
		observationCardinalityNext: slot[4],
		feeProtocol: slot[5],
		unlocked: slot[6],
	};
	return PoolState;
}

module.exports = {getPoolInfo};