## How it Works

- Strategically provides assets in liquidity pools for token swapping on the [Uniswap](https://uniswap.org/) platform
- Provides liquidity for a price range chosen by the bot
- The smaller the range, the more token swap fees a liquidity provider earns
- The bot automatically moves positions to stay within an extremely tight but highly profitable sub-range (moves when the price ratio is 20% away from moving outside the range of the position)

- I developed smart contracts (code that runs directly on the blockchain) for the bot to perform the evaluation and updating of its positions
	- The bot originally operated on the server (outside of the blockchain), but this led to it using old data and a multitude of inefficient and expensive transactions
	- Led me to [migrate my server code to smart contract code](https://github.com/kendalleasterly/trading-app/milestone/1?closed=1), moving the bot closer to the data it uses



## Stack
- [Polygon](https://polygon.technology/): Blockchain I chose for its innovative choices and extremely low gas fees
- [Infura](https://www.infura.io/): Web3 provider
- [Ethers](https://docs.ethers.org/v5/): Javascript library to interact with the blockchain
- [Hardhat](https://hardhat.org/): Smart Contract Testing Suite
- [Firestore](https://firebase.google.com/docs/firestore): Database to keep track of positions and gather analytics on how the bot was performing
- [Heroku](https://www.heroku.com/): Node.js server hosting service to trigger my smart contracts on the blockchain


## Additional Details

- Created my own mathematical formula to optimize my position
- Briefly did make a small amount of money with the bot

### What I learned

- Smart contract development
	- Solidity programming language
	- Hardhat testing suite
	- Running a copy of the blockchain for testing smart contracts (my favorite part of the process)
	- Running code on the blockchain cost money for each computation. Developing in this environment was a new and challenging language, very different from what I was used to. For the first time I was forced to think about how to make my code efficient, a perspective that's stayed's stayed with me since.
- Decentralized Finance (DeFi)
	- How arbitrage works in the context of the blockchain
	- Concepts like Impermanent loss, Liquidity Pools, Decentralize Autonomous Organizations (DAO)
	- A lot of my understanding came from youtube channels like [Whiteboard Crypto](https://www.youtube.com/@WhiteboardCrypto)
- How to mint an NFT
