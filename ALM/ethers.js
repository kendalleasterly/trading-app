const ethers = require("ethers")
const dotenv = require("dotenv")

const ERC20ABI = require("./abis/erc20.json");

dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
wallet = wallet.connect(provider);

async function sendTransaction(txn) {
    return new Promise(async (resolve, reject) => {
        const gasPrice = await provider.getGasPrice();

				const tx = await wallet.sendTransaction({
					...txn,
					gasPrice,
					gasLimit: 500000,
				});

				console.log(tx);

				tx.wait(1).then(resolve);
    })
	
}

async function approve(token, spender, amount) {
	return new Promise(async (resolve, reject) => {
		const gasPrice = await provider.getGasPrice();

		const tokenContract = new ethers.Contract(token.address, ERC20ABI, wallet);

		const tx = await tokenContract.approve(spender, amount, {
			gasLimit: 800000,
			gasPrice: gasPrice,
		});

		console.log(tx);

		tx.wait(16).then((value) => {
			console.log(value);
			resolve();
		});
	});
}

module.exports = {provider, wallet, sendTransaction, approve};