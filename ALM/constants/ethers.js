const ethers = require("ethers")
const dotenv = require("dotenv")

dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
wallet = wallet.connect(provider);

module.exports = {provider, wallet}