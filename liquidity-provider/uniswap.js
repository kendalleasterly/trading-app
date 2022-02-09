const { default: axios } = require("axios")
const { Position, Pool, nearestUsableTick, NonfungiblePositionManager } = require("@uniswap/v3-sdk")
const { ethers, BigNumber } = require("ethers")
const {USDT, DAI} = require("./uniswap-tokens")
const dotenv = require("dotenv")
const { Percent } = require("@uniswap/sdk-core")
const {abi: INonfungiblePositionManagerABI} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json")

const {
	abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json")


dotenv.config()

const apiURL =
	"https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon"

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL)
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
wallet = wallet.connect(provider)

function getInfo() {
	const positionID = 45010

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
  }`

	axios.post(apiURL, { query }).then((response) => {
		const position = response.data.data.position

		const currentPrice = position.pool.token1Price
		const lowerBound = new Number(position.tickLower.price0)
		const upperBound = new Number(position.tickUpper.price0)

		const localHighest = upperBound - lowerBound
		const localPrice = currentPrice - lowerBound

		const percentage = localPrice / localHighest

		if (percentage <= 0.275 || percentage >= 0.725) {
			//create a new position
		} else {
			console.log("good range!")
		}

		console.log(percentage)
	})
}

async function mintPosition() {
	const poolAddress = "0x42f0530351471dab7ec968476d19bd36af9ec52d"
	const [POOL, immutables, state] = await getPool(USDT, DAI, poolAddress)
	
	const position = new Position({
		pool: POOL,
		liquidity: state.liquidity * 0.0002,
		tickLower: nearestUsableTick(state.tick, immutables.tickSpacing) - immutables.tickSpacing * 10,
		tickUpper: nearestUsableTick(state.tick, immutables.tickSpacing) + immutables.tickSpacing * 10
	})

	const blockNumber =  await wallet.provider.getBlockNumber()

	const data = {
		slippageTolerance: new Percent(50, 1000),
		recipient: wallet.address,
		deadline: blockNumber + 200
	}

	const {calldata, value} = NonfungiblePositionManager.addCallParameters(position, data)

	const NFPManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
	// const NFPManager = new ethers.Contract(
	// 	NFPManagerAddress,
	// 	INonfungiblePositionManagerABI,
	// 	wallet
	// )

	const gasPrice = await provider.getGasPrice()
	const nonce = await wallet.getTransactionCount()
	console.log(nonce)

	const tx = await wallet.sendTransaction({
		from: wallet.address,
		to: NFPManagerAddress,
		value: value,
		data: calldata,
		gasPrice: gasPrice,
		nonce: nonce,
		gasLimit: 2100000
	})

	console.log(tx)
}

//MARK: Helpers

async function getPool(tokenA, tokenB, poolAddress) {
	const [immutables, state] = await Promise.all([
		getPoolImmutables(poolAddress),
		getPoolState(poolAddress),
	])

	const POOL = new Pool(
		tokenA,
		tokenB,
		immutables.fee,
		state.sqrtPriceX96.toString(),
		state.liquidity.toString(),
		state.tick
	)

	return [POOL, immutables, state]
}

async function getPoolImmutables(poolAddress) {

	const poolContract = new ethers.Contract(
		poolAddress,
		IUniswapV3PoolABI,
		provider
	)

	const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
		await Promise.all([
			poolContract.factory(),
			poolContract.token0(),
			poolContract.token1(),
			poolContract.fee(),
			poolContract.tickSpacing(),
			poolContract.maxLiquidityPerTick(),
		])

	const immutables = {
		factory,
		token0,
		token1,
		fee,
		tickSpacing,
		maxLiquidityPerTick,
	}
	return immutables
}

async function getPoolState(poolAddress) {

	const poolContract = new ethers.Contract(
		poolAddress,
		IUniswapV3PoolABI,
		provider
	)

	const [liquidity, slot] = await Promise.all([
		poolContract.liquidity(),
		poolContract.slot0(),
	])

	const PoolState = {
		liquidity,
		sqrtPriceX96: slot[0],
		tick: slot[1],
		observationIndex: slot[2],
		observationCardinality: slot[3],
		observationCardinalityNext: slot[4],
		feeProtocol: slot[5],
		unlocked: slot[6],
	}
	return PoolState
}

module.exports = { getInfo, mintPosition }
