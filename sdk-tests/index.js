const app = require("express")()
const uniswap = require("./uniswap")

const port = process.env.PORT || 4000

app.get("/uniswap", (req, res) => {
    res.send("")

    uniswap.getPairInfo()
})

app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
})