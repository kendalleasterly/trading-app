const cron = require("node-cron");

const {tokens} = require("./constants/tokens");
const firebase = require("./firebase");
const {getPoolInfo} = require("./uniswap");

function isInSubRange() {
	return new Promise((resolve, reject) => {
		firebase.getMostRecentPosition().then((position) => {
			const token0 = tokens[position.token0.address];
			const token1 = tokens[position.token1.address];

			getPoolInfo(token0, token1, position.pool.address).then(
				([pool, immutables, state]) => {
					//get the current tick
					console.log(state.tick);
                    console.log(pool)
				}
			);
		});
	});
}

async function main() {
	firebase.addPosition({
		id: 10001,
		liquidity: 1223,
		pool: {
            address: "0x167384319B41F7094e62f7506409Eb38079AbfF8",
			token0: {
				symbol: "WMATIC",
				address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
			},
			token1: {
				symbol: "WETH",
				address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
			},
			fee: 3000,
		},
		tickLower: -1120,
		tickUpper: 1920,
	});
}

main();

// cron.schedule("*/5 * * * *", main);
