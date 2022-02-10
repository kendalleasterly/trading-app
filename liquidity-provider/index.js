const app = require("express")()

const dotenv = require("dotenv")
const { getInfo, getPool, mintPosition } = require("./uniswap")
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

app.get("/pool", async (req, res) => {
   const pool = await getPool(WETH, MATIC, 3000)
   console.log(pool.toString().toLowerCase())
})

app.listen(port, () => {
    console.log("Listening on port %s!", port)
})