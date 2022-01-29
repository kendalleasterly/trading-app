const {Pair} = require("@uniswap/sdk")
const {WMATIC, USDC} = require("./tokens")

function getPairInfo(tokenA, tokenB) {
    const pairAddress = Pair.getAddress(WMATIC, USDC)

    console.log(pairAddress)

}

module.exports = {getPairInfo}