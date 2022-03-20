/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const {extendEnvironment} = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");

extendEnvironment(async hre => {

	if (hre.network.name == "hardhat") {
		hre.ethers.provider.send("evm_setIntervalMining", [5000]);
	}

	hre.ERC20ABI = require("./scripts/abis/erc20.json");
	hre.DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
	hre.WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
	hre.approve = approve;

	async function approve(tokenAddress, spender, amount) {
		let signer = await ethers.getSigner();

		return new Promise(async (resolve, reject) => {

			const gasPrice = await signer.provider.getGasPrice();

			const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);

			const balance = await tokenContract.balanceOf(signer.address)
			console.log(balance)

			const tx = await tokenContract.approve(spender, amount, {
				gasLimit: 800000,
				gasPrice,
			});

			tx.wait(4).then((value) => {
				console.log(`Approved ${tokenAddress}`);
				currentTransaction = null;
				resolve();
			});
		});
	}

	hre.signer = await hre.ethers.getSigner();
})

const dotenv = require("dotenv");

dotenv.config();
module.exports = {
	solidity: "0.7.6",
	networks: {
		localhost: {
			accounts: [process.env.WALLET_PRIVATE_KEY],
		},
		hardhat: {
			forking: {
				url: process.env.ALCHEMY_URL,
			}
		},
		polygon: {
			url: process.env.INFURA_URL,
			accounts: [process.env.WALLET_PRIVATE_KEY],
		},
	},
};
