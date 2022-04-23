async function deployedContract() {//DON'T USE IF ALREADY DEPLOYED
	const name = "PositionManager";

	const NonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
	const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
	const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
	const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

	// We get the contract to deploy
	const Contract = await ethers.getContractFactory(name);
	console.log(`Deploying ${name}...`);

	const gasPrice = await ethers.provider.getGasPrice()

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

async function getBalance(tokenAddr, callerAddr) {
	
	const signer = await ethers.getSigner()
	const tokenContract = new ethers.Contract(tokenAddr, ERC20ABI, signer);

	let balance = await tokenContract.balanceOf(callerAddr)
	return balance

}

async function test() {

	const testPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
	const signer = await ethers.getSigner()

	const poolAddress = "0x0e44cEb592AcFC5D3F09D996302eB4C499ff8c10";
	const immutables = await getPoolImmutables(poolAddress)
	const gasPrice = await ethers.provider.getGasPrice()

	const mintData = [
		0,
		0,
		poolAddress,
		immutables.fee,
		immutables.token0,
		immutables.token1,
		immutables.tickSpacing,
		1,
	];

	// init contract

	// let PositionManager = await deployedContract()
	let PositionManager = await getContract("PositionManager", "0x940bce4c370af3294cC2348D2fa24ED5b3e27b41")

	// let balance0 = await getBalance(immutables.token0, signer.address)
	// let balance1 = await getBalance(immutables.token1, signer.address)
	// console.log({balance0, balance1})

	// console.log(balance0.div("2"), balance1.div("2"))

	// //send funds to contract

	// const usdcAmount = balance0.div("2")
    // const wethAmount = balance1.div("2")
    
	// await approve(USDC, PositionManager.address, usdcAmount);
    // await approve(WETH, PositionManager.address, wethAmount);
    // await transfer(USDC, PositionManager.address, usdcAmount);
	// await transfer(WETH, PositionManager.address, wethAmount);

	// balance0 = await getBalance(immutables.token0, PositionManager.address)
	// balance1 = await getBalance(immutables.token1, PositionManager.address)
	// console.log({balance0, balance1})

	//tell argent to mint

	// let mintTx = await PositionManager.mint(mintData, {
    //     gasLimit: 720000,
    //     gasPrice: gasPrice
    // });

	// console.log(mintTx)

	// await mintTx.wait(1)

	balance0 = await getBalance(immutables.token0, PositionManager.address)
	balance1 = await getBalance(immutables.token1, PositionManager.address)
	console.log({balance0, balance1})

	//MARK: remove the liquidity

	

	// let balance0 = await getBalance(immutables.token0, PositionManager.address)
	// let balance1 = await getBalance(immutables.token1, PositionManager.address)
	// console.log({balance0, balance1})


    // console.log(resetTx)

	// await resetTx.wait(2)

	// balance0 = await getBalance(immutables.token0, PositionManager.address)
	// balance1 = await getBalance(immutables.token1, PositionManager.address)
	// console.log({balance0, balance1})

	PositionManager.tokenReturn("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "1000")

}

await test();