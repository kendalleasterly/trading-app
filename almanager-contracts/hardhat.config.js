/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const {extendEnvironment} = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");

extendEnvironment(async hre => {

	if (hre.network.name == "hardhat") {
		hre.ethers.provider.send("evm_setIntervalMining", [1000]);

	}

	hre.ERC20ABI = require("./scripts/abis/erc20.json");
	hre.IUniswapV3PoolABI = require("./scripts/abis/IUniswapV3PoolABI.json");
	hre.DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
	hre.WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
	hre.WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"

	hre.transfer = transfer;

	async function transfer(tokenAddress, spender, amount) {
		let signer = await ethers.getSigner();

		return new Promise(async (resolve, reject) => {
			const gasPrice = await signer.provider.getGasPrice();

			const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);

			const balance = await tokenContract.balanceOf(signer.address);
			// console.log(balance);

			const tx = await tokenContract.transfer(spender, amount, {
				gasLimit: 800000,
				gasPrice,
			});

			tx.wait(1).then((value) => {
				console.log(`Transferred to ${tokenAddress}`);
				currentTransaction = null;
				resolve();
			});
		});
	}

	hre.approve = approve;

	async function approve(tokenAddress, spender, amount) {
		let signer = await ethers.getSigner();

		return new Promise(async (resolve, reject) => {

			const gasPrice = await signer.provider.getGasPrice();

			const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);

			const balance = await tokenContract.balanceOf(signer.address)
			// console.log(balance, tokenAddress)

			const tx = await tokenContract.approve(spender, amount, {
				gasLimit: 800000,
				gasPrice,
			});

			tx.wait(1).then((value) => {
				console.log(`Approved ${spender}`);
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
	solidity: {
		version: "0.7.6",
		settings: {
			optimizer: { enabled: false, runs: 200 }
		}
	},
	networks: {
		localhost: {
			accounts: [process.env.WALLET_PRIVATE_KEY],
			chainId: 31337,
		},
		hardhat: {
			forking: {
				url: process.env.ALCHEMY_URL,
			},
		},
		polygon: {
			url: process.env.INFURA_URL,
			accounts: [process.env.WALLET_PRIVATE_KEY],
		},
	},
};
