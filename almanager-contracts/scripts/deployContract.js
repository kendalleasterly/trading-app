async function deployedContract() {
	const name = "Swapper";

	const swapRouterAddress = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
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
