const app = require("express")()

const dotenv = require("dotenv")
const { getInfo, mintPosition, addLiquidity, quoteCollectAmounts, removeLiquidity, swapAndAdd, swapAndMint } = require("./uniswap")
const { MATIC, WETH } = require("./uniswap-tokens")
dotenv.config()

const port = process.env.PORT || 4000

app.get("/info", (req, res) => {
    getInfo()
    res.send("")
})

app.post("/mint", (req, res) => {
    mintPosition()
    res.send("")
})

app.post("/add", (req, res) => {
    addLiquidity()
    res.send("")
})

app.get("/pool", (req, res) => {
    getPoolAddress()
})

app.post("/remove", (req, res) => {
    res.send("200")
    removeLiquidity()
})

app.post("/swap", (req, res) => {
    res.send("")
    swapAndAdd()
})

app.post("/swap-mint", (req, res) => {
    res.send("")
    swapAndMint()
})

app.listen(port, () => {
    console.log("Listening on port %s!", port)
})