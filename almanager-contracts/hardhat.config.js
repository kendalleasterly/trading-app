/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
	solidity: "0.7.6",
	networks: {
		polygon: {
			url: process.env.INFURA_URL,
			accounts: [process.env.WALLET_PRIVATE_KEY],
		},
	},
};
