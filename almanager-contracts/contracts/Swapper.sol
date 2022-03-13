// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity = 0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract Swapper {
    //hardcode the owner as my address. only run any function if msg.sender == owner

    ISwapRouter public immutable swapRouter;
    address public constant WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    address public constant DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;

    uint24 public constant poolFee = 3000;

    constructor(ISwapRouter _swaprouter) {
        swapRouter = _swaprouter;
    }

    function swapExactInputSingle(uint256 amountIn) external returns (uint256 amountOut) {
        // msg.sender must approve this contract to use dai

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(DAI, msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(DAI, address(swapRouter), amountIn);

        //Create the params to be sent to the swap router for the swap
        ISwapRouter.ExactInputSingleParams memory params = 
            ISwapRouter.ExactInputSingleParams({
                    tokenIn: DAI,
                    tokenOut: WETH,
                    fee: poolFee,
                    recipient: msg.sender,
                    deadline: block.timestamp + (30 * 1000), // 30 seconds
                    amountIn: amountIn,
                    amountOutMinimum: 0, //TODO: make this not zero
                    sqrtPriceLimitX96: 0
                });

        amountOut = swapRouter.exactInputSingle(params);

    }

}