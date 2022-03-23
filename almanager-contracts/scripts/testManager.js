// const { ethers } = require("hardhat");


async function test(contractAddr) {
    
    let Manager = await ethers.getContractFactory("PositionManager");
	Manager = await Manager.attach(contractAddr);

    const wethAmount = ethers.utils.parseUnits("0.01", 18);
    const daiAmount = ethers.utils.parseUnits("1", 18);
    
    //approve both tokens

    await approve(WETH, Manager.address, wethAmount)
    await approve(DAI, Manager.address, daiAmount);
    await transfer(WETH, Manager.address, wethAmount);
	await transfer(DAI, Manager.address, daiAmount);

    const WETH_DAI_POOL = "0x6baD0f9a89Ca403bb91d253D385CeC1A2b6eca97";

    //call the function with max values of both（and pool)

    const gasPrice = await ethers.provider.getGasPrice()

    const functionData = [wethAmount, daiAmount, WETH_DAI_POOL]

    let tx = await Manager.mintNewPosition(functionData, {
        gasLimit: 840000,
        gasPrice
    });

    console.log(tx)

}

await test("0xdd55e66629f1e2f4f725b115b371bf059e7d3436");