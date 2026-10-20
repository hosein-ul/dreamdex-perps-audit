# dreamDEX Perps Protocol & Environment Links

This registry contains verified ground-truth endpoints, network metadata, and contract addresses gathered from official documentation and confirmed against the Somnia Tokyo testnet (Hideki, chain ID 50383).

---

## 1. Official Web Resources & Documentation

| Resource | Verified URL | Notes |
| :--- | :--- | :--- |
| **Bounty Program** | `https://dorahacks.io/hackathon/dreamdex-perps-bounty/detail` | DoraHacks Perps Builder Bounty |
| **dreamDEX App / Perps Arena** | `https://app.testnet.dreamdex.io/competition` | Testnet trading arena & UI |
| **dreamBot Builder** | `https://app.testnet.dreamdex.io/dreambot-builder` | Non-custodial bot configuration UI |
| **Developer Docs (Perps Testnet)** | `https://app.testnet.dreamdex.io/docs/developers/perps-testnet` | Developer network, contracts, SDK guide |
| **Trader Docs (Perps Testnet)** | `https://app.testnet.dreamdex.io/docs/trading/perps-testnet` | Orders, margin, funding, market limits |
| **Link a Bot Guide** | `https://app.testnet.dreamdex.io/docs/trading/common/link-a-bot` | Delegated trading keys & permissions |
| **dreamDEX Docs Root** | `https://app.dreamdex.io/docs` | General protocol documentation |
| **Somnia Markets SDK Docs** | `https://somnia-platform-docs.vercel.app/markets/somnia-markets` | TypeScript SDK & raw contract specs |
| **Somnia LLMs Full Index** | `https://docs.somnia.network/llms.txt` | Somnia chain docs index |
| **Bot Kit Repository** | `https://github.com/somnia-chain/dreamdex-bot-kit` | Official trading bot framework & strategies |
| **Security Submissions** | `mailto:security@dreamdex.io` | Private bounty email for critical vulns |

---

## 2. Network & Infrastructure Endpoints

### Somnia Tokyo Testnet (`hideki`) — PRIMARY SCOPE
- **Network Identifier**: `hideki`
- **Chain ID**: `50383`
- **Gas / Native Currency**: `STT` (Somnia Test Token), 18 decimals
- **HTTP RPC**: `https://api.hideki2.infra.testnet.somnia.network`
- **WebSocket RPC**: `wss://api.hideki2.infra.testnet.somnia.network/ws`
- **Indexer GraphQL**: `https://hideki-dev.smk.somnia.host/v1/graphql`
- **Block Explorer**: `https://smk-dev-markets-explorer-hideki-euw4-uzavbo36ra-ez.a.run.app`

### Somnia Shannon Testnet (`testnet`) — SECONDARY TESTNET
- **Network Identifier**: `testnet`
- **Chain ID**: `50312`
- **Gas / Native Currency**: `STT` (Somnia Test Token), 18 decimals
- **HTTP RPC**: `https://api.infra.testnet.somnia.network`
- **WebSocket RPC**: `wss://api.infra.testnet.somnia.network/ws`
- **Indexer GraphQL**: `https://dev.smk.somnia.host/v1/graphql`

### Somnia Mainnet — STRICTLY OUT OF SCOPE (NO PERPS)
- **Chain ID**: `5031`
- **Note**: Mainnet has no perp pools deployed. `NETWORK=mainnet` is rejected at startup.

---

## 3. Core Protocol Contracts (Verified On-Chain on Chain 50383)

| Contract / Role | Address | Source / Verification Method |
| :--- | :--- | :--- |
| **MarginBank** | `0x478769E1177C0773c43A593DCCc4Ad15F15F1394` | `getPerpSystemConfig`, verified live |
| **Perp Collateral (USDso)** | `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72` | 18 decimals; returned by `MarginBank.collateralToken` |
| **PerpPoolFactory** | `0xE631fAEE547baeE07353E290f0562ea67d856560` | Factory that deploys & registers perp pools |
| **LiquidationEngine** | `0xA66d3C24Ad4a389d863846905D8173e1017e9F4D` | Handles backstop bids, insurance, and ADL waterfall |
| **InsuranceFund** | `0x50826894D47C6D4f3BeA38BFDC7Dc5c5be171b80` | Holds 525,000 USDso in testnet solvency reserves |
| **Fee Recipient** | `0xd58596620Ee6951B2958a931949e4ff7ce6222be` | Configured protocol fee receiver in MarginBank |
| **OperatorPermissionsRegistry** | `0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a` | Authorization for `placeOrderFor`, `cancelOrderFor`, etc. |
| **VoucherDistributor** | `0x2ACD9EFdA721450906bfE1bef3edE269636E42C4` | Distributes paper USDso competition vouchers |
| **MarketsCore** | `0x2802504314685D89bF6C992CA5a8e7cC78bc0294` | Core control plane singleton |
| **OracleHub** | `0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b` | Price feed oracle hub |
| **PriceFeedScheduler** | `0x1998C88D54a240b8C671493f27f58eC416b81D7F` | Reactivity oracle schedule pusher |
| **Spot Collateral (tUSDC)** | `0x9E9492cC533E8696A3b6afC7df730800DF75148f` | 6 decimals (WARNING: SDK mislabels as `collateral`) |

---

## 4. Live Perp Markets Table (21 Live Markets on Chain 50383)

| Market Display | CCXT Symbol | PerpPool Address | Stop Registry Address | Base Decimals | Tick Size | Min Quantity | Initial Margin (bps) | Max Leverage |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :---: |
| **BTC-PERP** | `BTC/USDso:USDso` | `0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0` | `0x52e2ccebEa246830df2b37B474a001a1d102e3Ce` | 8 | 0.1 | 0.00013 | 500 (5%) | 20x |
| **ETH-PERP** | `ETH/USDso:USDso` | `0xD6Cb1DD58580B84D76068aC21594219ce03aeddf` | `0x44bfa5b2f676451a995ce4adfa2a0df8664ecb27` | 18 | 0.01 | 0.004 | 500 (5%) | 20x |
| **SOL-PERP** | `SOL/USDso:USDso` | `0xB483ec1fb34996638677c20ab087b16F1896FA53` | `0x85a0879d727a296b63ca047ea795dbe5a57007e0` | 9 | 0.01 | 0.1 | 500 (5%) | 20x |
| **HYPE-PERP** | `HYPE/USDso:USDso` | `0x63B47eD4A7DE0FdE659b0d82441dD74828b7297A` | `0x44c24cd2f33b1e75ff9841838848dbb1fc769da8` | 6 | 0.01 | 0.12 | 500 (5%) | 20x |
| **XRP-PERP** | `XRP/USDso:USDso` | `0x7058579F3248559963f79AdB937c6De9f953E060` | `0x655e89a74421b53fca8eb4aebec47b864a78007a` | 6 | 0.0001 | 6.9 | 500 (5%) | 20x |
| **DOGE-PERP** | `DOGE/USDso:USDso` | `0xC410012e39765Cd5f772e84BAcB19554AEC040Df` | `0xb09cf2f2e519280db51421062b109ba2491bb7f6` | 8 | 0.00001 | 120 | 1000 (10%) | 10x |
| **BNB-PERP** | `BNB/USDso:USDso` | `0x3D2A99fE1e2BdEaA25024515A2D2202DAF9531aD` | `0x487fd1e89df96b27d42cfcf19ad62ad33e387c32` | 18 | 0.001 | 0.014 | 1000 (10%) | 10x |
| **ADA-PERP** | `ADA/USDso:USDso` | `0x34fa62909f77699a7a6278D992F72Ff31c7a619D` | `0x3a76c35cae266a2cb1f9c8d5c4146a482b535805` | 6 | 0.0001 | 46 | 1000 (10%) | 10x |
| **SUI-PERP** | `SUI/USDso:USDso` | `0x1Be21287cfB865a7c462Ff3c4f275E70BcccefE4` | `0xfdcfb2f9eb20566415f3ec4736fca6e147dfb28e` | 9 | 0.0001 | 13 | 1000 (10%) | 10x |
| **LINK-PERP** | `LINK/USDso:USDso` | `0xf71b619450baFe953F47b9b556416A3A67b443b5` | `0x1c3fabc4bb34237d80ae18bf97b5e408544d678b` | 18 | 0.001 | 0.9 | 1000 (10%) | 10x |
| **AVAX-PERP** | `AVAX/USDso:USDso` | `0xde9762B6b441133D1314C68864ae4e63A6eE45C7` | `0xc33db2da579a32c3bbd4fe0f77918a287fa4429e` | 18 | 0.001 | 1.4 | 1000 (10%) | 10x |
| **XLM-PERP** | `XLM/USDso:USDso` | `0x74b05B9B8c8F180b53b7891018F3B254B3E658C9` | `0xa1b615be0b14b29bbd6978411d331907cb5cf546` | 7 | 0.0001 | 54 | 1000 (10%) | 10x |
| **NEAR-PERP** | `NEAR/USDso:USDso` | `0x1cD15ae8bFf0FE0a7F49233BE8b90734775bA454` | `0xf3a51c2617631cecf3f674519961604a181165bc` | 24 | 0.0001 | 5.1 | 1000 (10%) | 10x |
| **WLD-PERP** | `WLD/USDso:USDso` | `0x0F464d57c1FD839E4d87A408BBcCDAb8f77E6394` | `0x092ba740aa54cb4304e28c6aa5cf24ca9574ef06` | 18 | 0.0001 | 26 | 2000 (20%) | 5x |
| **TAO-PERP** | `TAO/USDso:USDso` | `0xD9b6A347A3Ae9FD6BA21179D3343F2c8A922F697` | `0x450b968db781b0a88a09f87c2aa5b64c76046e8c` | 9 | 0.001 | 0.044 | 2000 (20%) | 5x |
| **ZEC-PERP** | `ZEC/USDso:USDso` | `0x2a73129f12d264259b3bc82136e053d86503c80a` | `0xbfe6f50058b8d96dbb19c28bf7fcff08705bc035` | 8 | 0.001 | 0.009 | 2000 (20%) | 5x |
| **PUMP-PERP** | `PUMP/USDso:USDso` | `0x76c981a545e82ad71e1fe353c9247d51b3ebc012` | `0xe09c75508c5c7ce1a5dc0c46b9a22d8618eb785a` | 6 | 0.000001 | 1800 | 2000 (20%) | 5x |
| **1000PEPE-PERP** | `1000PEPE/USDso:USDso` | `0xfa9b9e504c552ee16fa4fa3972665e7144ec1eb9` | `0x9942cd84be328bfb0a9b1c7c7f4ea6c56fc4db2d` | 18 | 0.0000001 | 2700 | 2000 (20%) | 5x |
| **VVV-PERP** | `VVV/USDso:USDso` | `0x352636ab2b295e86541528aa1d3df8e76c12ad1d` | `0x6ba14290fb4b3736502280d0d82d431c15f8ba66` | 18 | 0.001 | 0.44 | 2000 (20%) | 5x |
| **LIT-PERP** | `LIT/USDso:USDso` | `0xdcb0ad22915dd7c2892978ffc1ff456e5df4ee0c` | `0x6243c81d898a83a0f76906a4b1eb7285ee13c19e` | 18 | 0.0001 | 2.8 | 2000 (20%) | 5x |
| **ZRO-PERP** | `ZRO/USDso:USDso` | `0x2a1822b0c1e878347f7d4999d36329e46a788894` | `0x1667a20a4beea4383c07629b1dd2659e924a6839` | 18 | 0.0001 | 5.1 | 2000 (20%) | 5x |

---

## 5. Identified Gaps & Inconsistencies Recorded During Recon

1. **`SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral` is wrong**:
   - SDK exports `collateral = 0x9E9492cC533E8696A3b6afC7df730800DF75148f` (tUSDC, 6 decimals).
   - On-chain `MarginBank.collateralToken` is `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72` (USDso, 18 decimals).
2. **Missing `operatorPermissionsRegistry` in SDK address sets**:
   - `SOMNIA_HIDEKI_TESTNET_ADDRESSES` and `SOMNIA_TESTNET_ADDRESSES` omit `operatorPermissionsRegistry` entirely.
   - Calling `trader.placePerpStopOrder` throws `NotConfiguredError` unless manually supplied.
3. **Outdated market tables in documentation**:
   - `somnia-markets/contracts.md` documents only 15 markets (omitting ZRO, LIT, VVV, 1000PEPE, PUMP, ZEC).
4. **Markets SDK Version mismatch**:
   - Developer documentation references `0.32.1`, but `dreamdex-bot-kit` locks `@somnia-chain/markets-sdk` to `0.31.0` in `package-lock.json`, which lacks `SOMNIA_HIDEKI_TESTNET_ADDRESSES`.
