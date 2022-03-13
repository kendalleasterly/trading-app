/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const {extendEnvironment} = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");

extendEnvironment(async hre => {
	hre.ERC20ABI = require("./scripts/abis/erc20.json")

	hre.signer = await hre.ethers.getSigner()
})

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
