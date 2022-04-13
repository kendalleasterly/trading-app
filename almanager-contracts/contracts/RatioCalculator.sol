// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/libraries/SqrtPriceMath.sol';

import "hardhat/console.sol";

library RatioCalculator {
    //

    struct Position {
        int24 tickUpper;
        int24 tickLower;
        uint160 currentSqrtPriceX96;

    }

    function calculateOptimalRatio(Position memory position) internal view returns (uint256 ratioX64)  {

        console.log("upper / lower:");
        console.logInt(position.tickUpper);
        console.logInt(position.tickLower);

        uint160 upperSqrtRatioX96 = TickMath.getSqrtRatioAtTick(position.tickUpper);
        uint160 lowerSqrtRatioX96 = TickMath.getSqrtRatioAtTick(position.tickLower);

        uint128 usableLiquidity = 1000000000000000000; 

        uint256 numerator = SqrtPriceMath.getAmount0Delta(
            position.currentSqrtPriceX96, 
            upperSqrtRatioX96, 
            usableLiquidity, 
            true);

        uint256 denominator = SqrtPriceMath.getAmount1Delta(
            position.currentSqrtPriceX96, 
            lowerSqrtRatioX96, 
            usableLiquidity, 
            true);

        ratioX64 = (numerator * 2**64)  / denominator; 

    }

}