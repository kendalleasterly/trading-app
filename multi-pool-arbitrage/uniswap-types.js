class Immutables {
	constructor(factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick) {
		this.factory = factory;
		this.token0 = token0;
		this.token1 = token1;
		this.fee = fee;
		this.tickSpacing = tickSpacing;
		this.maxLiquidityPerTick = maxLiquidityPerTick;
	}
}

class State {
	constructor(
		liquidity,
		sqrtPriceX96,
		tick,
		observationIndex,
		observationCardinality,
		observationCardinalityNext,
		feeProtocol,
		unlocked
	) {
		this.liquidity = liquidity;
		this.sqrtPriceX96 = sqrtPriceX96;
		this.tick = tick;
		this.observationIndex = observationIndex;
		this.observationCardinality = observationCardinality;
		this.observationCardinalityNext = observationCardinalityNext;
		this.feeProtocol = feeProtocol;
		this.unlocked = unlocked;
	}
}

module.exports = {Immutables, State}