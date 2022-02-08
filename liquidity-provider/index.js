const app = require("express")()

const dotenv = require("dotenv")
const { getInfo, getPool } = require("./uniswap")
dotenv.config()

const port = process.env.PORT || 4000

app.get("/info", (req, res) => {
    res.send("")
})

app.listen(port, () => {
    console.log("Listening on port %s!", port)
})