const {default: axios} = require("axios");
const {Position, Pool} = require("@uniswap/v3-sdk");
const { Token } = require("@uniswap/sdk-core");
const {abi: IUniswapV3PoolABI} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json"); 
const { ethers } = require("ethers");

const apiURL = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon";

const WETH = new Token(137, "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18, "WETH", "Wrapped Ether");
const MATIC = new Token(137, "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", 18, "WMATIC", "Wrapped Matic");

 const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
 const poolAddress = "0x167384319b41f7094e62f7506409eb38079abff8";
 const poolContract = new ethers.Contract(
		poolAddress,
		IUniswapV3PoolABI,
		provider
 );

function getInfo() {
	const positionID = 45010;

	const query = `
  {
    position(id: ${positionID}) {
      tickLower {
        price0
    }
      tickUpper {
        price0
    }
      pool {
        token1Price
      }
    }
  }`;

	axios.post(apiURL, {query}).then((response) => {
		const position = response.data.data.position;

		const currentPrice = position.pool.token1Price;
		const lowerBound = new Number(position.tickLower.price0);
		const upperBound = new Number(position.tickUpper.price0);

		const localHighest = upperBound - lowerBound;
		const localPrice = currentPrice - lowerBound;

		const percentage = localPrice / localHighest;

		if (percentage <= 0.275 || percentage >= 0.725) {
			//create a new position
		} else {
			console.log("good range!");
		}

		console.log(percentage);
	});
}

async function mintPosition() {

  const MATIC_WETH_POOL = await getPool()
}

//MARK: Helpers

async function getPool() {
	const [immutables, state] = await Promise.all([
		getPoolImmutables(),
		getPoolState(),
	]);

	const MATIC_WETH_POOL = new Pool(
		WETH,
		MATIC,
		immutables.fee,
		state.sqrtPriceX96.toString(),
		state.liquidity.toString(),
		state.tick
	);
	
  return MATIC_WETH_POOL
}

async function getPoolImmutables() {

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

async function getPoolState() {
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

module.exports = {getInfo, mintPosition};
