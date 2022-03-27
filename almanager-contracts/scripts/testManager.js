// const { ethers } = require("hardhat");

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

    let Manager = await ethers.getContractFactory("PositionManager");
	Manager = await Manager.attach(contractAddr);

    const wethAmount = ethers.utils.parseUnits("0.005", 18);
    const token1Amount = ethers.utils.parseUnits(".5", 18);
    
    //approve both tokens

    await approve(WETH, Manager.address, wethAmount)
    await approve(WMATIC, Manager.address, token1Amount);
    await transfer(WETH, Manager.address, wethAmount);
	await transfer(WMATIC, Manager.address, token1Amount);

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

await test("0x6D560772A92125Cb85c0d1c8d54702749eBa4a96");