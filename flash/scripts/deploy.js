async function deploy(name) {
    // We get the contract to deploy
    const Contract = await ethers.getContractFactory(name);
    console.log(`Deploying ${name}...`);
    const contract = await Contract.deploy();
    await contract.deployed();
    console.log(name, "deployed to:", contract.address);

    const interactableContract = await getContract(name, contract.address)
    return interactableContract

  }

async function getContract(name, address) {
  const Contract = await ethers.getContractFactory(name)
  const contract = await Contract.attach(address)
  return contract
}