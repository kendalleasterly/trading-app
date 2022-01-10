const {
	abi: IUniswapV3Pool,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const {getPoolImmutables, getPoolState, getPool} = require("./uniswap")
const {tokens} = require("./constants");
const { ethers } = require("ethers");

async function main(provider) {
    //given a pair of tokens i would like to get their ratio. start logging sample data 

    const token0 = tokens.USDC
    const token1 = tokens.USDT

    const poolAddress = await getPool(token0, token1, provider)

    const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3Pool,
        provider
    )

    const [immutables, state] = await Promise.all([getPoolImmutables(poolContract), getPoolState(poolContract)])

    console.log(immutables, state, state.liquidity.toString())
}

module.exports = main