// const { ethers } = require("hardhat");


async function test(contractAddr) {
    let Manager = await ethers.getContractFactory("PositionManager");
	Manager = await Manager.attach(contractAddr);

    const wethAmount = ethers.utils.parseUnits("0.04428", 18);
    const daiAmount = ethers.utils.parseUnits("1", 18);
    
    //approve both tokens

    // await approve(WETH, Manager.address, wethAmount)

    // await approve(DAI, Manager.address, daiAmount);

    const WETH_DAI_POOL = "0x6baD0f9a89Ca403bb91d253D385CeC1A2b6eca97";

    //call the function with max values of both（and pool)

    const gasPrice = await ethers.provider.getGasPrice()

    let tx = await Manager.callStatic.mintNewPosition([wethAmount, daiAmount, WETH_DAI_POOL], {
        gasLimit: 210000,
        gasPrice
    });

    console.log(tx)

}

await test("0x1fC287091D36fdC2c78f37d1b4a5b46D13358ffa");