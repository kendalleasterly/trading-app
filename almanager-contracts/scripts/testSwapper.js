async function approve(token, spender, amount) {
    let signer = await ethers.getSigner()

	return new Promise(async (resolve, reject) => {
		const gasPrice = await signer.provider.getGasPrice();

		const tokenContract = new ethers.Contract(token.address, ERC20ABI, signer);
		const tx = await tokenContract.approve(spender, amount, {
			gasLimit: 800000,
			gasPrice,
		});

		tx.wait(4).then((value) => {
			console.log(`Approved ${token.symbol}`);
			currentTransaction = null;
			resolve();
		});
	});
}

async function test(contractAddr) {

    const DAI = {
			chainId: 137,
			address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
			decimals: 18,
			symbol: "DAI",
			name: "Dai Stablecoin",
		};

	let Swapper = await ethers.getContractFactory("Swapper");
	Swapper = await Swapper.attach(contractAddr);

	const daiAmount = ethers.utils.parseUnits("1", 18);

	await approve(DAI, Swapper.address, daiAmount);

    // await approve()

	const gasPrice = await ethers.provider.getGasPrice();

	const tx = await Swapper.swapExactInputSingle(daiAmount, {
		gasPrice,
		gasLimit: 210000,
	});

	console.log(tx);
}

await test("0x6eED5f2904b53A7111ea0d8feeF26A4b64CF78d3");
