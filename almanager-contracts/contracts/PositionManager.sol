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

import "hardhat/console.sol";
import "./RatioCalculator.sol";

contract PositionManager is IERC721Receiver, LiquidityManagement {

    //this contract has custody of the nft. 
    //this is optimal because if the nft is given to the user,
    //then they will have to make a separate transaction to give the nft back to the contract each time.

    // address public constant WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    // address public constant DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;

    // uint24 public constant poolFee = 3000;

    INonfungiblePositionManager public immutable nonfungiblePositionManager;

    struct Deposit {
        address owner;
        uint128 liquidity;
        address token0;
        address token1;
    }

    mapping(uint256 => Deposit) public deposits;

    constructor (
        INonfungiblePositionManager _nonfungiblePositionManager,
        address _factory,
        address _WETH9
    ) PeripheryImmutableState(_factory, _WETH9) {
        nonfungiblePositionManager = _nonfungiblePositionManager;
    }

    function refund(address token, uint256 amount) external {
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

        //can be put in call params
        // uint24 poolFee = pool.fee();
        // address token0 = pool.token0();
        // address token1 = pool.token1();
        // int24 tickSpacing = pool.tickSpacing();

        // int24 nearestTick = 

        (uint256 amount0Desired, uint256 amount1Desired) = swap(mintParams, tick, sqrtPriceX96);

        _safeApprove(mintParams.token0, address(nonfungiblePositionManager), mintParams.amount0ToMint);
        _safeApprove(mintParams.token1, address(nonfungiblePositionManager), mintParams.amount1ToMint);
        
        INonfungiblePositionManager.MintParams memory params = 
            INonfungiblePositionManager.MintParams({
                token0: mintParams.token0,
                token1: mintParams.token1,
                fee: mintParams.poolFee,
                tickLower: _nearestUsableTick(tick, mintParams.tickSpacing) - mintParams.tickSpacing,
                tickUpper: _nearestUsableTick(tick, mintParams.tickSpacing) + mintParams.tickSpacing,
                amount0Desired: mintParams.amount0ToMint, //these values don't need to be an exact ratio
                amount1Desired: mintParams.amount1ToMint,
                amount0Min: 0, //TODO: Slippage tolerance the input value
                amount1Min: 0, //TODO: Slippage tolerance the input value,
                recipient: msg.sender,
                deadline: block.timestamp + 30 //30 seconds
            });

        
        (tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager.mint(params);

        // deposits[tokenId] = Deposit({owner: msg.sender, liquidity: liquidity, token0: token0, token1: token1});

        refund(amount0, amount1, mintParams, mintParams.token0, mintParams.token1);
    }

    function swap(MintParams memory mintParams, int24 tick, uint160 sqrtRatioX96) private returns (uint256 amount0Desired, uint256 amount1Desired) {

        RatioCalculator.Position memory ratioParams = 
            RatioCalculator.Position({
                tickUpper: _nearestUsableTick(tick, mintParams.tickSpacing) + mintParams.tickSpacing,
                tickLower: _nearestUsableTick(tick, mintParams.tickSpacing) - mintParams.tickSpacing,
                currentSqrtPriceX96:sqrtRatioX96
            });

        

        //this function can assume zeroForOne is true, and we can do the inversion afterwards
        uint256 ratioX64 = RatioCalculator.calculateOptimalRatio(ratioParams);

        uint256 balanceRatioX64 = (mintParams.amount0ToMint * 2**64) / mintParams.amount1ToMint; 
        bool zeroForOne = balanceRatioX64 > ratioX64;
        console.log("ratioX64", ratioX64);
        if (!zeroForOne) {
            ratioX64 = uint256(2**128) / ratioX64;
            
        }
        console.log("ratioX64 inverted", ratioX64);

        (uint256 inputBalance, uint256 outputBalance) = zeroForOne ? (mintParams.amount0ToMint, mintParams.amount1ToMint) : (mintParams.amount1ToMint, mintParams.amount0ToMint);

        // (5000000000000000000 - 12883500000000) / (1676510888887728230186266021 * 0.00025767) + 1
        // (inputBalance - (optimalRatio * outputBalance)) / ((optimalRatio * inputTokenPrice) + 1))

        //exchange rate will be calculated here using the sqrtPriceX96
        uint256 exchangeRate = 2 ** 64 / uint256(sqrtRatioX96) ** 2;

        console.log("input", inputBalance);
        console.log("output", outputBalance);
        console.log("exchange rate", exchangeRate);
        console.log("sqrtRatioX96", uint256(sqrtRatioX96));
        uint256 amountToSwap = (inputBalance - (ratioX64 * outputBalance / 2**64)) / (((ratioX64 * (2 ** 64 / uint256(sqrtRatioX96) ** 2)) / 2**64) + 1); //not that percise but i doubt it matters that much.
        console.log("amount to swap", amountToSwap); 

        amount0Desired = mintParams.amount0ToMint;
        amount1Desired = mintParams.amount0ToMint;
    }

    function refund(uint256 amount0, uint256 amount1, MintParams memory mintParams, address token0, address token1) private {
        if (amount0 < mintParams.amount0ToMint) {

            uint256 refund0 = mintParams.amount0ToMint - amount0;
            _safeTransfer(token0, msg.sender, refund0);
        }

        if (amount1 < mintParams.amount1ToMint) {

            uint256 refund1 = mintParams.amount1ToMint - amount1;
            _safeTransfer(token1, msg.sender, refund1);
        }
    }

    function _safeTransfer(address token, address to, uint256 amount) private {
        TransferHelper.safeTransfer(token, to, amount);
    }

    function _safeApprove(address token, address to, uint256 amount) private {
        TransferHelper.safeApprove(token, to, amount);
    }

    function _nearestUsableTick(int24 tick, int24 tickSpacing) private pure returns (int24 nearestTick) {

        //find the difference between the upper nearest tick and the current tick, and the difference between the lower nearest tick and the current tick
        //see which difference is the least

        int24 upper = tick / tickSpacing; 
        upper = upper * tickSpacing; 
        int24 lower = upper - tickSpacing;

        if ((upper - tick) < (tick - lower)) {
            nearestTick = upper;
        } else {
            nearestTick = lower;
        }
        //possibility that either of these values may end up being greater than TickMath.MAX_TICK (or vice versa), just subtract (or add) the tickSpacing
    }
}