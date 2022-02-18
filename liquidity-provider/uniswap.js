const { default: axios } = require("axios")
const {
	Position,
	Pool,
	nearestUsableTick,
	NonfungiblePositionManager,
	computePoolAddress,
	FACTORY_ADDRESS,
} = require("@uniswap/v3-sdk")
const { ethers, BigNumber } = require("ethers")
const Web3 = require("web3")
const { USDT, DAI, WETH, WBTC, MATIC } = require("./uniswap-tokens")
const dotenv = require("dotenv")
const {
	Percent,
	CurrencyAmount,
	NativeCurrency,
	Fraction,
} = require("@uniswap/sdk-core")
const Web3httpProvider = require("web3-providers-http")
const {
	abi: INonfungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json")
const {
	abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json")
const ERC20ABI = require("./abis/erc20.json")

dotenv.config()

const apiURL =
	"https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon"
const NFPManagerAddress = "0xc36442b4a4522e871399cd717abdd847ab11fe88"
const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"

const DAI_USDT_ADDRESS = "0x42f0530351471dab7ec968476d19bd36af9ec52d"
const WBTC_WETH_ADDRESS = "0x50eaedb835021e4a108b7290636d62e9765cc6d7"
const MATIC_WETH_ADDRESS = "0x167384319B41F7094e62f7506409Eb38079AbfF8"

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL)
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
wallet = wallet.connect(provider)

const tickLower = -81480
const tickUpper = -67620
const liquidity = BigNumber.from("248353757460663988")
const positionID = async function getInfo() {
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
	const [POOL, immutables, state] = await getPool(
		MATIC.wrapped,
		WETH,
		MATIC_WETH_ADDRESS
	)
	const amount0 = ethers.utils.parseUnits("0.1", POOL.token0.decimals)

	const position = new Position.fromAmount0({
		pool: POOL,
		tickLower,
		tickUpper,
		amount0: amount0,
		useFullPrecision: true,
	})

	const { calldata, value } = NonfungiblePositionManager.addCallParameters(
		position,
		{
			slippageTolerance: new Percent(50, 100),
			recipient: wallet.address,
			deadline: Date.now() + 300,
			useNative: MATIC,
		}
	)

	let txn = {
		to: NFPManagerAddress,
		data: calldata,
		value,
	}

	// await approve(POOL.token0, NFPManagerAddress, newPosition.amount0.quotient.toString())
	// await approve(POOL.token1, NFPManagerAddress, newPosition.amount1.quotient.toString())

	sendTransaction(txn)
}

async function swapAndAdd() {
	const [POOL, immutables, state] = await getPool(
		MATIC.wrapped,
		WETH,
		MATIC_WETH_ADDRESS
	)

	const router = new AlphaRouter({ chainId: 137, provider })

		console.log(ethers.utils.parseUnits("3", MATIC.decimals).toString())
		console.log(ethers.utils.parseUnits("0.002", WETH.decimals).toString())

	const MATICBalance = CurrencyAmount.fromRawAmount(
		MATIC,
		ethers.utils.parseUnits("3", MATIC.decimals)
	)
	const WETHBalance = CurrencyAmount.fromRawAmount(
		WETH,
		ethers.utils.parseUnits("0.002", WETH.decimals)
	)

	const position = new Position({
		pool: POOL,
		liquidity,
		tickLower,
		tickUpper,
	})

	// await approve(MATIC.wrapped, V3_SWAP_ROUTER_ADDRESS, MATICBalance.quotient.toString())
	// await approve(WETH, V3_SWAP_ROUTER_ADDRESS, WETHBalance.quotient.toString())

	const response = await router.routeToRatio(
		MATICBalance,
		WETHBalance,
		position,
		{
			ratioErrorTolerance: new Fraction(1, 100),
			maxIterations: 3,
		},
		{
			swapOptions: {
				recipient: wallet.address,
				slippageTolerance: new Percent(5, 1_000),
				deadline: Date.now() + 300,
			},
		}
	)

	if (response.status == SwapToRatioStatus.SUCCESS) {
		const route = response.result
		const txn = {
			data: route.methodParameters.calldata,
			to: V3_SWAP_ROUTER_ADDRESS,
			value: BigNumber.from(route.methodParameters.value),
		}

		// sendTransaction(txn)
	} else {
		console.log(response.error)
	}
}

async function removeLiquidity() {
	const tokenId = 58746

	const [POOL, immutables, state] = await getPool(
		MATIC.wrapped,
		WETH,
		MATIC_WETH_ADDRESS
	)

	console.log(POOL.token0.decimals, POOL.token1.decimals)

	const amount0 = ethers.utils.parseUnits("10", POOL.token0.decimals)

	const position = new Position({
		pool: POOL,
		tickLower,
		tickUpper,
		liquidity,
	})

	console.log(position.liquidity.toString())

	console.log(position)

	const [expectedOut0, expectedOut1] = await quoteCollectAmounts(tokenId)
	const fee0 = new CurrencyAmount.fromRawAmount(MATIC, expectedOut0.toString())
	const fee1 = new CurrencyAmount.fromRawAmount(WETH, expectedOut1.toString())

	console.log(
		expectedOut0,
		expectedOut1,
		ethers.utils.formatUnits(fee0.quotient.toString(), POOL.token0.decimals),
		ethers.utils.formatUnits(fee1.quotient.toString(), POOL.token1.decimals)
	)

	const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
		position,
		{
			tokenId: tokenId.toString(),
			liquidityPercentage: new Percent(100, 100),
			slippageTolerance: new Percent(50, 10_000),
			deadline: (Date.now() + 300).toString(),
			collectOptions: {
				expectedCurrencyOwed0: fee0,
				expectedCurrencyOwed1: fee1,
				recipient: wallet.address,
			},
		}
	)

	let txn = {
		to: NFPManagerAddress,
		data: calldata,
		value,
	}

	sendTransaction(txn)
}

//MARK: Helpers

async function quoteCollectAmounts(tokenID) {
	return new Promise((resolve, reject) => {
		const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

		const positionManager = new ethers.Contract(
			NFPManagerAddress,
			INonfungiblePositionManagerABI,
			wallet
		)

		positionManager.callStatic
			.collect(
				{
					tokenId: tokenID.toString(),
					recipient: wallet.address,
					amount0Max: MAX_UINT128,
					amount1Max: MAX_UINT128,
				},
				{ from: wallet.address }
			)
			.then((results) => {
				console.log({ results })
				resolve([results.amount0, results.amount1])
			})
	})
}

async function getPoolAddress(token0, token1) {
	computePoolAddress({
		factoryAddress: FACTORY_ADDRESS,
		fee: 3000,
		tokenA: token0,
		tokenB: token1,
	})
}

async function approve(token, spender, amount) {

	return new Promise(async (resolve, reject) => {
		
		const gasPrice = await provider.getGasPrice()

		const tokenContract = new ethers.Contract(token.address, ERC20ABI, wallet)

		const tx = await tokenContract.approve(spender, amount, {
			gasLimit: 800000,
			gasPrice: gasPrice,
		})

		console.log(tx)

		tx.wait(1).then((value) => {
			console.log(value)
			resolve()
		})

		
	})
}

async function sendTransaction(txn) {
	const gasPrice = await provider.getGasPrice()

	const tx = await wallet.sendTransaction({
		...txn,
		gasPrice,
		gasLimit: 500000,
	})

	console.log(tx)

	tx.wait(1).then((value) => console.log(value))
}

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

	console.log({ slot })

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

const {
	abi: IUniswapV3FactoryABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json")
const {
	AlphaRouter,
	SwapToRatioStatus,
} = require("@uniswap/smart-order-router")
// const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL)

module.exports = {
	mintPosition,
	getPoolAddress,
	removeLiquidity,
	swapAndAdd,
}
