// const { tenderly } = require("hardhat");

async function deployedContract() {//DON'T USE IF ALREADY DEPLOYED
	const name = "PositionManager";

	const NonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
	const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
	const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
	const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

	// We get the contract to deploy
	const Contract = await ethers.getContractFactory(name);
	console.log(`Deploying ${name}...`);
	const contract = await Contract.deploy(
		NonfungiblePositionManager,
		SwapRouter,
		factory,
		WMATIC
	);
	await contract.deployed();
	console.log(name, "deployed to:", contract.address);

	const interactableContract = await getContract(name, contract.address);
	return interactableContract;
}

async function getContract(name, address) {
	const Contract = await ethers.getContractFactory(name);
	const contract = await Contract.attach(address);
	return contract;
}
