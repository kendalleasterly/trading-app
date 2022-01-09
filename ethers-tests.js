const { ethers } = require("ethers");
const abi = require("./usdb-abi.json")

const provider = new ethers.providers.JsonRpcProvider(
	"https://polygon-mumbai.infura.io/v3/ad4b7eeae04e442ca372d113293e0609"
);

const signer = new ethers.Wallet(
	"5ebd377ccefbc416b74063bd8ad3320df21bf1b74234cc9de7789df8c3aef41f",
    provider
);

async function main() {
	const usdc = new ethers.Contract(
		"0xB0EB6d44C3F18E600c7A565ee0467064f34E21fA",
		abi,
		signer
	);

	const tx = await usdc.mint(
			"0x25CCa0D866E36b00d3a5C07339122123AeF918F1",
			200,
			{gasLimit: 1000000}
		);

	// const tx = await usdc.approve(
	// 		"0x25CCa0D866E36b00d3a5C07339122123AeF918F1",
    //         200,
	// 		{gasLimit: 1000000}
	// 	);

	console.log(tx);
}

module.exports = main