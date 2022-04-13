// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity = 0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

library Swapper {
    //hardcode the owner as my address. only run any function if msg.sender == owner

    uint24 public constant poolFee = 500;

    struct SwapParams {
        ISwapRouter swapRouter;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
    }

    function swapExactInputSingle(SwapParams memory swapParams) internal returns (uint256 amountOut) {
        // msg.sender must approve this contract to use dai

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(swapParams.tokenIn, address(swapParams.swapRouter), swapParams.amountIn);

        //Create the params to be sent to the swap router for the swap
        ISwapRouter.ExactInputSingleParams memory params = 
            ISwapRouter.ExactInputSingleParams({
                    tokenIn: swapParams.tokenIn,
                    tokenOut: swapParams.tokenOut,
                    fee: poolFee,
                    recipient: address(this),
                    deadline: block.timestamp + (30), // 30 seconds
                    amountIn: swapParams.amountIn,
                    amountOutMinimum: 0, //TODO: make this not zero (this is the .5 slippage tolerance)
                    sqrtPriceLimitX96: 0
                });

        amountOut = swapParams.swapRouter.exactInputSingle(params);

    }

}