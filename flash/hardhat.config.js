/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
const dotenv = require("dotenv")
dotenv.config()
module.exports = {
	solidity: "0.7.6",
	networks: {
		polygon: {
			url: "https://polygon-mainnet.infura.io/v3/ad4b7eeae04e442ca372d113293e0609",
			accounts: [process.env.WALLET_PRIVATE_KEY],
		},
	},
};
