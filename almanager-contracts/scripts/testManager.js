// const { tenderly } = require("hardhat");

async function deployedContract() {//DON'T USE IF ALREADY DEPLOYED
	const name = "PositionManager";

	// const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
	const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
	const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
	const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
	const NonfungiblePositionManager =
		"0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

	// We get the contract to deploy
	const Contract = await ethers.getContractFactory(name);
	console.log(`Deploying ${name}...`);
	const contract = await Contract.deploy(
		NonfungiblePositionManager,
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


async function getPoolImmutables(poolAddress) {
	const poolContract = new ethers.Contract(
		poolAddress,
		IUniswapV3PoolABI,
		ethers.provider
	);

	const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
		await Promise.all([
			poolContract.factory(),
			poolContract.token0(),
			poolContract.token1(),
			poolContract.fee(),
			poolContract.tickSpacing(),
			poolContract.maxLiquidityPerTick(),
		]);

	const immutables = {
		factory,
		token0,
		token1,
		fee,
		tickSpacing,
		maxLiquidityPerTick,
	};
	return immutables;
}

async function test(contractAddr) {

    let Manager = await deployedContract()
	console.log("got it")

    const wethAmount = ethers.utils.parseUnits("0.05", 18);
    const token1Amount = ethers.utils.parseUnits("5", 18);
    
    //approve both tokens

    await approve(WETH, Manager.address, wethAmount)
    await approve(WMATIC, Manager.address, token1Amount);
    // await transfer(WETH, Manager.address, wethAmount);
	// await transfer(WMATIC, Manager.address, token1Amount);

    const poolAddress = "0x167384319B41F7094e62f7506409Eb38079AbfF8";

    const immutables = await getPoolImmutables(poolAddress)

    const gasPrice = await ethers.provider.getGasPrice()
    

    const functionData = [wethAmount, token1Amount, poolAddress, immutables.fee, immutables.token0, immutables.token1, immutables.tickSpacing]

    let tx = await Manager.mintNewPosition(functionData, {
        gasLimit: 840000,
        gasPrice
    });

    console.log(tx)

}

await test();