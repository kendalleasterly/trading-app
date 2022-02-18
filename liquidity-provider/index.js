const app = require("express")()

const dotenv = require("dotenv")
const { getInfo, mintPosition, addLiquidity, quoteCollectAmounts, removeLiquidity } = require("./uniswap")
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
    removeLiquidity(45010)
})

app.listen(port, () => {
    console.log("Listening on port %s!", port)
})