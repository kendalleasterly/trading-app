async function test(contractAddr) {

	let Swapper = await ethers.getContractFactory("Swapper");
	Swapper = await Swapper.attach(contractAddr);

	const daiAmount = ethers.utils.parseUnits("1", 18);

	await approve(DAI, Swapper.address, daiAmount);

    // await approve()

	const gasPrice = await ethers.provider.getGasPrice();

	const tx = await Swapper.callStatic.swapExactInputSingle(daiAmount, {
		gasPrice,
		gasLimit: 210000,
	});

	console.log(tx);
}

await test("0x6eED5f2904b53A7111ea0d8feeF26A4b64CF78d3");
