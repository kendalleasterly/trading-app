const cron = require("node-cron");

const {tokens} = require("./constants/tokens");
const firebase = require("./firebase");
const {getPoolInfo, removeLiquidity, mintPosition} = require("./uniswap");

async function getPositionAndStatus() {
	return new Promise((resolve, reject) => {
		firebase.getMostRecentPosition().then((position) => {
			const token0 = tokens[position.pool.token0.address];
			const token1 = tokens[position.pool.token1.address];

			getPoolInfo(token0, token1, position.pool.address).then(([pool]) => {
				//get the current tick

				const relativeTickUpper = position.tickUpper - position.tickLower;
				const relativeTickCurrent = pool.tickCurrent - position.tickLower;

				const percentage = (relativeTickCurrent / relativeTickUpper) * 100;

				console.log(
					`Position ${position.id}: At ${percentage}%. At ${pool.tickCurrent}, from ${position.tickLower} to ${position.tickUpper} `
				);
				resolve([position, percentage]) 
			});
		});
	});
}

async function main() {

	const [position, percentage] = await getPositionAndStatus();

	if (percentage < 25 || percentage > 75) {
		// begin the fixing process

		// remove the liquidity from the position
		console.log("Removing Liquidity...");

		const [fee0, fee1] = await removeLiquidity(position);
		firebase.updateWithFees(position.id, fee0, fee1);

        console.log("Minting new position...")

		const [newTickLower, newTickUpper, liquidity, newId] = await mintPosition(position.pool);
        firebase.addPosition({
					id: newId,
                    pool: position.pool,
                    tickLower: newTickLower,
                    tickUpper: newTickUpper,
                    liquidity: liquidity
				});

	}
}

main();

// cron.schedule("*/5 * * * *", main);
