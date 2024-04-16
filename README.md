# TARS Coin - A Base Network Token

If everyone is willing to pile on on complete scam coins, might as well give them one that is not a rug pull.

I have no interest in making money out of it, and to be frank I'll probably just deploy this for fun.

The contract provides a method to renounce ownership and a couple of methods to provide liquidity, but no way to revert/remove liquidity.

It does have Pause/Unpause capabilities and an OpenTrading method.

I might add some more options to lock liquidity even further, but seems unnecessary considering unlikely that I will personally push liquidity to the pool anyway.

## Commands

### test
Runs all tests for the project
```bash
  npm run test
```

### test:grep
Runs tests that match the provided grep
```bash
  npm run test:grep --grep={title-to-match}
```

### format:contracts
Formats contracts with prettier
```bash
  npm run format:contracts
```

### deploy:local
Deploys project to local enviromnent
```bash
  npm run deploy:local
```

### deploy:goerli
Deploys project to goerli
```bash
  npm run deploy:goerli
```

### deploy:mainnet
Deploys project to goerli
```bash
  npm run deploy:mainnet
```
