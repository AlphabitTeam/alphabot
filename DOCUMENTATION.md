# Documentation

## Requirements

To interact with the bot, **users must allow direct messages from server members**.

## How it works?

Once subscribed:

- if a wallet is **>20% away from liquidation**, the bot will not send updates
- if a wallet is **<20% away from liquidation**, the bot will automatically send **hourly updates** via direct messages - the message will mention how many of the loan positions of the wallet subscribed are in **the red zone (<10% from liquidation)** or in **the yellow zone (<20% from liquidation)**
- if there are no such positions, the bot skip sending hourly updates to prevent unnecessary spamming

## Subscribe one wallet

To _subscribe_ to a wallet, run:

`/alphabit <network> subscribe <wallet_address>` where:

- `<network>` is the network (**karura** or **acala**)
- `<wallet_address>` is a Karura or Acala network wallet address

> Example: `/alphabit acala subscribe 23j4ay2zBSgaSs18xstipmHBNi39W2Su9n8G89kWrz8eCe8F`

## Subscribe multiple wallets

To _subscribe_ multiple wallets in once, use the same _subscribe_ command than for one wallet, but provide a list of wallet addresses **separated by spaces**.

> Example: `/alphabit acala subscribe 23j4ay2zBSgaSs18xstipmHBNi39W2Su9n8G89kWrz8eCe8F 23HMr3qWCFbxALigGN87tkh4VvsC4ADBGAT6HVYtgby2Y5Ds`

## Query wallets

To check the list of the subscribed loan positions that are in risk of liquidation:

`/alphabit <network> query`, where:

- `<network>` is the network (**karura** or **acala**)

> Example: `/alphabit acala query`

## Unsubscribe one wallet

To _unsubscribe_ a wallet, run:

`/alphabit <network> unsubscribe <wallet_address>`, where:

- `<network>` is the network (**karura** or **acala**)
- `<wallet_address>` is a Karura or Acala network wallet address

> Example: `/alphabit acala unsubscribe 23j4ay2zBSgaSs18xstipmHBNi39W2Su9n8G89kWrz8eCe8F`

## Unsubscribe multiple wallets

To _unsubscribe_ multiple wallets in once, use the same _unsubscribe_ command than for one wallet, but provide a list of wallet addresses **separated by spaces**.

> Example: `/alphabit acala unsubscribe 23j4ay2zBSgaSs18xstipmHBNi39W2Su9n8G89kWrz8eCe8F 23HMr3qWCFbxALigGN87tkh4VvsC4ADBGAT6HVYtgby2Y5Ds`

## Unsubscribe all wallets

To _unsubscribe_ from all wallets of a network, run:

`/alphabit <network> unsubscribe` where:

- `<network>` is the network (**karura** or **acala**)

> Example: `/alphabit acala unsubscribe`
