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

    function calculateOptimalRatio(Position memory position) internal view returns (uint256 numerator, uint256 denominator)  {

        uint160 upperSqrtRatioX96 = TickMath.getSqrtRatioAtTick(position.tickUpper);
        uint160 lowerSqrtRatioX96 = TickMath.getSqrtRatioAtTick(position.tickLower);

        console.log(position.currentSqrtPriceX96);
        console.log(upperSqrtRatioX96);
        console.log(lowerSqrtRatioX96);
        

        uint128 usableLiquidity = 1000000000000000000; 
        console.log(usableLiquidity);

        numerator = SqrtPriceMath.getAmount0Delta(
            position.currentSqrtPriceX96, 
            upperSqrtRatioX96, 
            usableLiquidity, 
            true);

        denominator = SqrtPriceMath.getAmount1Delta(
            position.currentSqrtPriceX96, 
            lowerSqrtRatioX96, 
            usableLiquidity, 
            true);

        console.log(numerator);
        console.log(denominator);

    }

}