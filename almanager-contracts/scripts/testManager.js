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

	const usdcAmount = ethers.utils.parseUnits("5", 6);
    const wethAmount = ethers.utils.parseUnits("0.01", 18);
    
    //approve both tokens

    await approve(USDC, Manager.address, usdcAmount);
    await approve(WETH, Manager.address, wethAmount);
    await transfer(USDC, Manager.address, usdcAmount);
	await transfer(WETH, Manager.address, wethAmount);

    const poolAddress = "0x0e44cEb592AcFC5D3F09D996302eB4C499ff8c10";

    const immutables = await getPoolImmutables(poolAddress)

    const gasPrice = await ethers.provider.getGasPrice()
    

    const functionData = [
			usdcAmount,
			wethAmount,
			poolAddress,
			immutables.fee,
			immutables.token0,
			immutables.token1,
			immutables.tickSpacing,
			2
		];

    let tx = await Manager.mintNewPosition(functionData, {
        gasLimit: 840000,
        gasPrice
    });

    console.log(tx)

}

await test();