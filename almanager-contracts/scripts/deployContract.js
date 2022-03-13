async function deployedContract() {//DON'T USE IF ALREADY DEPLOYED
	const name = "Swapper";

	const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
	// const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

	// We get the contract to deploy
	const Contract = await ethers.getContractFactory(name);
	console.log(`Deploying ${name}...`);
	const contract = await Contract.deploy(
		swapRouterAddress,
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
