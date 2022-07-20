# alphabot

A Discord bot to monitor liquidation status of wallets for Acala.

## About Acala

[Acala](https://acala.network/) is a specialized stablecoin and liquidity blockchain that is decentralized, cross-chain by design, and future-proof with forkless upgradability.

Read more about the liquidation process [here](https://wiki.acala.network/learn/acala-introduction#liquidation-process).

Try the [Acala apps](https://apps.acala.network/)!

## Requirements

- Alphabot runs with [Node.js](https://nodejs.org/en/)
- Alphabot dependencies are managed and built by [Yarn](https://yarnpkg.com/)
- Alphabot stores subscription informations in a [PostgreSQL](https://www.postgresql.org/) database
- Alphabot needs a [Discord](https://discord.com/) bot token from an [application](https://discord.com/developers/applications)

## Installation

1. Set and export environment variables present in `.env` file
2. Run `yarn install`
3. Run `yarn build`
4. Run `yarn bot`

## Code formatting

1. `yarn format`
2. `yarn lint`

## Contributing

Contributions are welcome!
We would like to keep a good code quality:
- the code should accomplish its task as simply as possible
- the code should be commened for complex and non-obvious functionalities
- the code should be always formatted

## License

Alphabot is licensed under the MIT [LICENSE](LICENSE).
