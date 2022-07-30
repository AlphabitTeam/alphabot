# alphabot

A Discord bot to monitor liquidation status of wallets for Acala.

## Overview

- Alphabot runs with [Node.js](https://nodejs.org/en/)
- Alphabot dependencies are managed and built by [Yarn](https://yarnpkg.com/)
- Alphabot stores subscription informations in a [PostgreSQL](https://www.postgresql.org/) database
- Alphabot needs a [Discord](https://discord.com/) bot token from an [application](https://discord.com/developers/applications)

## Usage

Learn more about how to interact with the Discord bot in the [DOCUMENTATION](DOCUMENTATION.md).

## Run your own Discord bot

```
git clone https://github.com/AlphabitTeam/alphabot.git
cd alphabot
```

### Setup using Docker

1. Configure environment variables in `.env` file
2. Build and start Alphabot backend and database services
```sh
docker-compose up --build
```

### Setup manually

1. Export environment variables `DATABASE_URI` and `TOKEN`
2. Run `yarn install`
3. Run `yarn build`
4. Run `yarn bot`

## Contributing

Contributions are welcome!
We would like to keep a good code quality:

- the code should accomplish its task as simply as possible
- the code should be commented for complex and non-obvious functionalities
- the code should be always formatted (with `yarn format` and `yarn lint`)

## License

Alphabot is licensed under the MIT [LICENSE](LICENSE).

## About Acala

[Acala](https://acala.network/) is a specialized stablecoin and liquidity blockchain that is decentralized, cross-chain by design, and future-proof with forkless upgradability.

Read more about the liquidation process [here](https://wiki.acala.network/learn/acala-introduction#liquidation-process).

Try the [Acala apps](https://apps.acala.network/)!
