const ethers = require("ethers");
const {
	Pool,
	Position,
	NonfungiblePositionManager,
	nearestUsableTick,
} = require("@uniswap/v3-sdk");

const IUniswapV3PoolJSON = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const INonfungiblePositionManagerJSON = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json");
const {provider, wallet, sendTransaction, approve} = require("./ethers");
const {tokens, MATIC} = require("./constants/tokens");
const {CurrencyAmount, Percent, Fraction} = require("@uniswap/sdk-core");
const {POSITION_MANAGER_ADDRESS} = require("./constants/addresses");

const IUniswapV3PoolABI = IUniswapV3PoolJSON.abi;
const INonfungiblePositionManagerABI = INonfungiblePositionManagerJSON.abi;

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

async function removeLiquidity({id, pool, liquidity, tickLower, tickUpper}) {

	console.log("Removing Liquidity...");

	return new Promise(async (resolve, reject) => {
		const token0 = tokens[pool.token0.address];
		const token1 = tokens[pool.token1.address];

		const [poolObject] = await getPoolInfo(token0, token1, pool.address);

		const position = new Position({
			pool: poolObject,
			tickLower,
			tickUpper,
			liquidity,
		});

		const [expectedOut0, expectedOut1] = await quoteCollectAmounts(id);
		const fee0 = new CurrencyAmount.fromRawAmount(
			poolObject.token0,
			expectedOut0.toString()
		);
		const fee1 = new CurrencyAmount.fromRawAmount(
			poolObject.token1,
			expectedOut1.toString()
		);

		const formattedFee0 = ethers.utils.formatUnits(
			fee0.quotient.toString(),
			poolObject.token0.decimals
		);
		const formattedFee1 = ethers.utils.formatUnits(
			fee1.quotient.toString(),
			poolObject.token1.decimals
		);

		const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
			position,
			{
				tokenId: id.toString(),
				liquidityPercentage: new Percent(100, 100),
				slippageTolerance: new Percent(50, 10_000),
				deadline: (Date.now() + 1000 * 60 * 2).toString(),
				collectOptions: {
					expectedCurrencyOwed0: fee0,
					expectedCurrencyOwed1: fee1,
					recipient: wallet.address,
				},
			}
		);

		let txn = {
			to: POSITION_MANAGER_ADDRESS,
			data: calldata,
			value,
		};

		sendTransaction(txn).then(() => {
			console.log(
				`Position ${id}: Removed liquidity with fees of ${formattedFee0} and ${formattedFee1}`
			);
			return [formattedFee0, formattedFee1];
		});
	})
}

async function quoteCollectAmounts(tokenID) {
	return new Promise((resolve, reject) => {
		const MAX_UINT128 = ethers.BigNumber.from(2).pow(128).sub(1);

		const positionManager = new ethers.Contract(
			POSITION_MANAGER_ADDRESS,
			INonfungiblePositionManagerABI,
			wallet
		);

		positionManager.callStatic
			.collect(
				{
					tokenId: tokenID.toString(),
					recipient: wallet.address,
					amount0Max: MAX_UINT128,
					amount1Max: MAX_UINT128,
				},
				{from: wallet.address}
			)
			.then((results) => {
				resolve([results.amount0, results.amount1]);
			});
	});
}

async function mintPosition(pool) {

	console.log("Minting new position...")

	return new Promise(async (resolve, reject) => {
		const token0 = tokens[pool.token0.address];
		const token1 = tokens[pool.token1.address];

		const [poolObject, immutables, state] = await getPoolInfo(
			token0,
			token1,
			pool.address
		);

		const amount0 = ethers.utils.parseUnits("0.1", poolObject.token0.decimals);

		const nearestTick = nearestUsableTick(state.tick, immutables.tickSpacing);

		//TODO: adjust the actual ticks to prevent an bad sub-range
		const position = new Position.fromAmount0({
			pool: poolObject,
			tickLower: nearestTick - (immutables.tickSpacing),
			tickUpper: nearestTick + (immutables.tickSpacing),
			amount0: amount0,
			useFullPrecision: true,
		});

		const {calldata, value} = NonfungiblePositionManager.addCallParameters(
			position,
			{
				slippageTolerance: new Percent(50, 10_000),
				recipient: wallet.address,
				deadline: Date.now() + 1000 * 60 * 2,
				useNative: MATIC,
			}
		);

		let txn = {
			to: POSITION_MANAGER_ADDRESS,
			data: calldata,
			value,
		};

		console.log(amount0)

		console.log(new Fraction(1005, 1000).quotient.toString())

		const amount = amount0.mul(new Fraction(1005, 1000).quotient.toString())
		console.log(amount.quotient.toString())

		console.log(position.amount0.quotient.toString())

		// await approve(
		// 	poolObject.token0,
		// 	POSITION_MANAGER_ADDRESS,
		// 	position.amount0.
		// );
		// await approve(
		// 	poolObject.token1,
		// 	POSITION_MANAGER_ADDRESS,
		// 	position.amount1.quotient.toString()
		// );

		// sendTransaction(txn).then((receipt) => {

		// 	console.log(receipt)
		// 	let id = 0;
		// 	let liquidity = 1;

		// 	const iface = new ethers.utils.Interface(INonfungiblePositionManagerABI);

		// 	receipt.logs.forEach((log) => {
		// 		if (log.address == POSITION_MANAGER_ADDRESS) {
		// 			const parsedLog = iface.parseLog(log);

		// 			if (parsedLog.name == "IncreaseLiquidity") {

		// 				id = parsedLog.args[0].toString();
		// 				liquidity = parsedLog.args[1].toString();

		// 				console.log(
		// 					`Position ${id}: Minted with ${position.tickLower} and ${position.tickUpper} (liquidity: ${liquidity})`
		// 				);
		// 				resolve([position.tickLower, position.tickUpper, liquidity, id]);
		// 			}
		// 		}
				
		// 	});
		// });
	});
}

//---- MARK: Helpers ----//

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

module.exports = {getPoolInfo, removeLiquidity, mintPosition};
