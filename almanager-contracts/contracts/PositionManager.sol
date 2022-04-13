// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/base/LiquidityManagement.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

import "hardhat/console.sol";
import "./RatioCalculator.sol";
import "./Swapper.sol";

contract PositionManager is IERC721Receiver, LiquidityManagement {

    //this contract has custody of the nft. 
    //this is optimal because if the nft is given to the user,
    //then they will have to make a separate transaction to give the nft back to the contract each time.

    // address public constant WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    // address public constant DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;

    // uint24 public constant poolFee = 3000;

    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    ISwapRouter public immutable swapRouter;

    struct Deposit {
        address owner;
        uint128 liquidity;
        address token0;
        address token1;
    }

    mapping(uint256 => Deposit) public deposits;

    constructor (
        INonfungiblePositionManager _nonfungiblePositionManager,
        ISwapRouter _swaprouter,
        address _factory,
        address _WETH9
    ) PeripheryImmutableState(_factory, _WETH9) {
        nonfungiblePositionManager = _nonfungiblePositionManager;
        swapRouter = _swaprouter;
    }

    function tokenReturn(address token, uint256 amount) external {
        _safeTransfer(token, msg.sender, amount);
    }

    function onERC721Received(
        address, 
        address, 
        uint256, 
        bytes calldata) external override pure returns (bytes4) {
            return this.onERC721Received.selector;
        }

    struct MintParams {
        uint256 amount0ToMint;
        uint256 amount1ToMint;
        address pool;
        uint24 poolFee;
        address token0;
        address token1;
        int24 tickSpacing;
        int24 spacingMultiplier;
        }
    struct RefundParams {
        uint256 amount0; 
        uint256 amount1;
        uint256 amount0ToMint; 
        uint256 amount1ToMint; 
        address token0; 
        address token1;
    }

    function mintNewPosition(MintParams memory mintParams)
        external
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
            ) 
    {

        IUniswapV3Pool pool = IUniswapV3Pool(mintParams.pool);
        
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = pool.slot0(); 

        console.logInt(_nearestUsableTick(tick, mintParams.tickSpacing));
        console.logInt(mintParams.spacingMultiplier);
        (uint256 amount0Desired, uint256 amount1Desired) = swap(mintParams, tick, sqrtPriceX96);

        _safeApprove(mintParams.token0, address(nonfungiblePositionManager), amount0Desired);
        _safeApprove(mintParams.token1, address(nonfungiblePositionManager), amount1Desired);
        
        
        INonfungiblePositionManager.MintParams memory params = 
            INonfungiblePositionManager.MintParams({
                token0: mintParams.token0,
                token1: mintParams.token1,
                fee: mintParams.poolFee,
                tickLower: _nearestUsableTick(tick, mintParams.tickSpacing) - (mintParams.tickSpacing * mintParams.spacingMultiplier),
                tickUpper: _nearestUsableTick(tick, mintParams.tickSpacing) + (mintParams.tickSpacing * mintParams.spacingMultiplier),
                amount0Desired: amount0Desired, //these values don't need to be an exact ratio
                amount1Desired: amount1Desired,
                amount0Min: 0, //TODO: Slippage tolerance the input value
                amount1Min: 0, //TODO: Slippage tolerance the input value,
                recipient: msg.sender,
                deadline: block.timestamp + 30 //30 seconds
            });

        
        (tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager.mint(params);

        // deposits[tokenId] = Deposit({owner: msg.sender, liquidity: liquidity, token0: token0, token1: token1});

        RefundParams memory refundParams = RefundParams({
            amount0: amount0,
            amount1: amount1,
            amount0ToMint: amount0Desired,
            amount1ToMint: amount1Desired,
            token0: mintParams.token0,
            token1: mintParams.token1
        });

        refund(refundParams);
    }

    function swap(MintParams memory mintParams, int24 tick, uint160 sqrtRatioX96) private returns (uint256 amount0Out, uint256 amount1Out) {

        (bool zeroForOne, uint256 amountToSwap) = getAmountToSwap(mintParams, tick, sqrtRatioX96);

        console.log("zero for one", zeroForOne);
        console.log("amountToSwap", amountToSwap);

        Swapper.SwapParams memory params = Swapper.SwapParams({
            swapRouter: swapRouter,
            tokenIn: zeroForOne ? mintParams.token0 : mintParams.token1,
            tokenOut: zeroForOne ? mintParams.token1 : mintParams.token0,
            amountIn: amountToSwap
        });

        uint256 amountOut = Swapper.swapExactInputSingle(params);
        console.log("amount Out", amountOut);

        amount0Out = zeroForOne ? mintParams.amount0ToMint - amountToSwap : mintParams.amount0ToMint + amountOut;
        amount1Out = zeroForOne ? mintParams.amount1ToMint + amountOut : mintParams.amount1ToMint - amountToSwap;
        
        console.log("amount0Out", amount0Out);
        console.log("amount1Out", amount1Out);

    }

    function getAmountToSwap(MintParams memory mintParams, int24 tick, uint160 sqrtRatioX96) private view returns (bool zeroForOne, uint256 amountToSwap) {

        RatioCalculator.Position memory ratioParams = 
            RatioCalculator.Position({
                tickUpper: _nearestUsableTick(tick, mintParams.tickSpacing) + (mintParams.tickSpacing * mintParams.spacingMultiplier),
                tickLower: _nearestUsableTick(tick, mintParams.tickSpacing) - (mintParams.tickSpacing * mintParams.spacingMultiplier),
                currentSqrtPriceX96:sqrtRatioX96
            });

        //this function can assume zeroForOne is true, and we can do the inversion afterwards
        uint256 ratioX64 = RatioCalculator.calculateOptimalRatio(ratioParams);

        uint256 balanceRatioX64 = (mintParams.amount0ToMint * 2**64) / mintParams.amount1ToMint; 
        zeroForOne = balanceRatioX64 > ratioX64;
        if (!zeroForOne) {
            ratioX64 = uint256(2**128) / ratioX64;
        }

        (uint256 inputBalance, uint256 outputBalance) = zeroForOne ? (mintParams.amount0ToMint, mintParams.amount1ToMint) : (mintParams.amount1ToMint, mintParams.amount0ToMint);

        //exchange rate will be calculated here using the sqrtPriceX96
        uint256 exchangeRateX64 = (uint256(sqrtRatioX96) ** 2 / 2 ** 128); //divided by X128 becuse 192 - 64 = 128
        if (!zeroForOne) {
            exchangeRateX64 = 2**128 / exchangeRateX64 ;
        }

        amountToSwap = (inputBalance - (ratioX64 * outputBalance / 2**64)) * 2**128 / ((ratioX64 * exchangeRateX64) + 2**128) ; //we add 2**128 to add 1. 
        console.log("amount to swap", amountToSwap);
    }

    function refund(RefundParams memory refundParams) private {
        if (refundParams.amount0 < refundParams.amount0ToMint) {

            uint256 refund0 = refundParams.amount0ToMint - refundParams.amount0;
            _safeTransfer(refundParams.token0, msg.sender, refund0);
        }

        if (refundParams.amount1 < refundParams.amount1ToMint) {

            uint256 refund1 = refundParams.amount1ToMint - refundParams.amount1;
            _safeTransfer(refundParams.token1, msg.sender, refund1);
        }
    }

    function _safeTransfer(address token, address to, uint256 amount) private {
        TransferHelper.safeTransfer(token, to, amount);
    }

    function _safeApprove(address token, address to, uint256 amount) private {
        TransferHelper.safeApprove(token, to, amount);
    }

    function _nearestUsableTick(int24 tick, int24 tickSpacing) private view returns (int24 nearestTick) {

        //find the difference between the upper nearest tick and the current tick, and the difference between the lower nearest tick and the current tick
        //see which difference is the least

        if (tick > 0) {
            //test diff and one directly above

            int24 lower = tick / tickSpacing;
            lower = lower * tickSpacing;
            int24 upper = lower + tickSpacing;

            if ((upper - tick) < (tick - lower)) { //the difference between the upper and the tick is less, so use that one since it's closer.
                nearestTick = upper;
            } else {
                nearestTick = lower;
            }
        } else {
            //test diff and one directly below

            int24 upper = tick / tickSpacing;
            upper = upper * tickSpacing;
            int24 lower = upper - tickSpacing;

            if (upper - tick < tick - lower) { //diff between upper and tick was lower, meaning it was closer.
                nearestTick = upper;
            } else {
                nearestTick = lower;
            }
        }
        //possibility that either of these values may end up being greater than TickMath.MAX_TICK (or vice versa), just subtract (or add) the tickSpacing
    }
}