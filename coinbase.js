const axios = require("axios").default;
const crypto = require("crypto")
const dotenv = require("dotenv")

dotenv.config()

const secretKey = process.env.COINBASE_SECRET
const passphrase = process.env.COINBASE_PASSPHRASE

function coinbaseModel() {

    function makeRequest(method, path, body) {
        return new Promise((resolve, reject) => {

            const timestamp = Date.now() / 1000

            const key = Buffer(secretKey, "base64")
            const hmac = crypto.createHmac("sha256", key)

            const stringifiedData = `${timestamp}${method}/${path}${body ? JSON.stringify(body) : ""}`
            const signedRequestData = hmac.update(stringifiedData).digest("base64")

            axios.request({
                method: method,
                url: `https://api.exchange.coinbase.com/${path}`,
                data: body,
                headers: {
                    Accept: 'application/json',
                    'cb-access-key': 'dc7cdedb4ede71ec697286b11402ffc3',
                    'cb-access-sign': signedRequestData,
                    'cb-access-timestamp': timestamp.toString(),
                    'cb-access-passphrase':passphrase
                },
            }).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    }

    //CONVERSIONS

    function getConversion() {
        makeRequest("GET", "fills?product_id=DAI-USDC")
        .then(response => {
            console.log(response)
        })
    }

    //ORDERS

    function makeTrade() {

        makeRequest("POST", "orders", {
            profile_id: 'default profile_id',
            type: 'limit',
            side: 'sell',
            cancel_after: 'min',
            price: '1',
            size: '1',
            product_id: 'DAI-USD',
        })
    }

    return {
        getConversion,
        makeTrade
    }

}

module.exports = { coinbaseModel }