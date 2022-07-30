import * as Keyv from 'keyv';
import { Client } from 'discord.js';
import {
  KaruraVaultsStatusService,
  Position,
  KaruraVaultsApi,
} from 'karura-vaults-api';
import { AcalaVaultsStatusService, AcalaVaultsApi } from 'acala-vaults-api';
import { delay } from './utils';
import { NetworkType } from '../types';
export class SubscriptionService {
  private keyv: Keyv;
  private karuraVaultStatusService: KaruraVaultsStatusService;
  private acalaVaultStatusService: AcalaVaultsStatusService;
  private karuraApiService: KaruraVaultsApi;
  private acalaApiService: AcalaVaultsApi;
  private client: Client;
  private latestHourlyUpdate: Date;
  private apiMap: Record<NetworkType, any>;
  private vaultsServiceMap: Record<NetworkType, any>;
  constructor(
    client: Client,
    keyv: Keyv,
    karuraVaultStatusService: KaruraVaultsStatusService,
    acalaVaultStatusService: AcalaVaultsStatusService,
    karuraApiService: KaruraVaultsApi,
    acalaApiService: AcalaVaultsApi
  ) {
    this.client = client;
    this.keyv = keyv;
    this.apiMap = {
      [NetworkType.Karura]: karuraApiService,
      [NetworkType.Acala]: acalaApiService,
    };
    this.vaultsServiceMap = {
      [NetworkType.Karura]: karuraVaultStatusService,
      [NetworkType.Acala]: acalaVaultStatusService,
    };
    Promise.all([this.sendHourlyUpdates()]);
  }

  async addSubscription(id: string, wallet: string, network: NetworkType) {
    let wallets;
    const subscribed = await this.checkSubscription(id, network);
    if (!subscribed) {
      wallets = {
        [NetworkType.Acala]: [],
        [NetworkType.Karura]: [],
      };
      const subscribors = await this.keyv.get('subscribers');
      subscribors.push(id);
      await this.keyv.set('subscribers', subscribors);
    }
 else {
      wallets = await this.keyv.get(id);
    }
    wallets[network].push(wallet);
    await this.keyv.set(id, wallets);
  }

  async removeSubscription(id: string, network?: NetworkType, wallet?: string) {
    if (!network) {
      await this.keyv.delete(id);
      const subscribors = await this.keyv.get('subscribers');
      const index = subscribors.indexOf(id);
      if (index !== -1) {
        subscribors.splice(index, 1);
      }
      await this.keyv.set('subscribers', subscribors);
      return;
    }
    if (!wallet) {
      const wallets = await this.keyv.get(id);
      wallets[network] = [];
      await this.keyv.set(id, wallets);
      return;
    }
    const subscribed = await this.keyv.get(id);
    const walletIndex = subscribed[network].indexOf(wallet);
    if (walletIndex > -1) {
      subscribed[network].splice(walletIndex, 1);
    }
    await this.keyv.set(id, subscribed);
  }

  async checkSubscription(id: string, network: NetworkType, wallet?: string) {
    const hasSubscription = await this.keyv.has(id);
    if (!hasSubscription) {
      return false;
    }
    const wallets = (await this.keyv.get(id))[network];
    if (wallet && !(wallet in wallets)) {
      return false;
    }
    return true;
  }

  async getSubscribedPositions(
    id: string,
    network: NetworkType,
    wallets?: string[]
  ): Promise<Position[]> {
    if (!(await this.checkSubscription(id, network))) {
      return [];
    }
    wallets = wallets
      ? wallets.filter(
          async (wallet) => await this.checkSubscription(id, network, wallet)
        )
      : (await this.keyv.get(id))[network];
    const positions: Position[] = [];
    for (const wallet of wallets) {
      const position = await this.apiMap[network].getPositionsByOwnerId(wallet);
      positions.push(...position);
    }

    return positions;
  }

  async formatPositionData(
    positions: Position[],
    network: NetworkType
  ): Promise<any> {
    const yellowZoned = this.vaultsServiceMap[network].yellowZoned;
    const redZoned = this.vaultsServiceMap[network].redZoned;

    return {
      all: positions,
      red: positions.filter((position) => redZoned[position.id] !== undefined),
      yellow: positions.filter(
        (position) => yellowZoned[position.id] !== undefined
      ),
    };
  }

  async sendHourlyUpdates() {
    this.latestHourlyUpdate = new Date();
    const subscribers = await this.keyv.get('subscribers');

    const acalaPositions = await this.apiMap[NetworkType.Acala].getPositions();

    const acalaYellowZoneCount = this.vaultsServiceMap[NetworkType.Acala]
      .yellowZoned
      ? Object.keys(
          this.vaultsServiceMap[NetworkType.Acala].yellowZoned
        ).filter(
          (key) =>
            this.vaultsServiceMap[NetworkType.Acala].yellowZoned[key] !==
            undefined
        ).length
      : 0;
    const acalaRedZoneCount = this.vaultsServiceMap[NetworkType.Acala].redZoned
      ? Object.keys(this.vaultsServiceMap[NetworkType.Acala].redZoned).filter(
          (key) =>
            this.vaultsServiceMap[NetworkType.Acala].redZoned[key] !== undefined
        ).length
      : 0;

    const acalaYellowZonePercentage =
      (acalaYellowZoneCount / acalaPositions.length) * 100;
    const acalaRedZonePercentage =
      (acalaRedZoneCount / acalaPositions.length) * 100;

    const karuraPositions = await this.apiMap[
      NetworkType.Karura
    ].getPositions();

    const karuraYellowZoneCount = this.vaultsServiceMap[NetworkType.Karura]
      .yellowZoned
      ? Object.keys(
          this.vaultsServiceMap[NetworkType.Karura].yellowZoned
        ).filter(
          (key) =>
            this.vaultsServiceMap[NetworkType.Karura].yellowZoned[key] !==
            undefined
        ).length
      : 0;
    const karuraRedZoneCount = this.vaultsServiceMap[NetworkType.Karura]
      .redZoned
      ? Object.keys(this.vaultsServiceMap[NetworkType.Karura].redZoned).filter(
          (key) =>
            this.vaultsServiceMap[NetworkType.Karura].redZoned[key] !==
            undefined
        ).length
      : 0;

    const karuraYellowZonePercentage =
      (karuraYellowZoneCount / karuraPositions.length) * 100;
    const karuraRedZonePercentage =
      (karuraRedZoneCount / karuraPositions.length) * 100;

    for await (const subscriber of subscribers) {
      console.log(`sending hourly updates to ${subscriber}`);
      const wallets = await this.keyv.get(subscriber);
      const karuraPos: Position[] = [];
      const acalaPos: Position[] = [];

      for (const wallet of wallets[NetworkType.Karura]) {
        const positions = await this.apiMap[
          NetworkType.Karura
        ].getPositionsByOwnerId(wallet);
        karuraPos.push(...positions);
      }

      for (const wallet of wallets[NetworkType.Acala]) {
        const positions = await this.apiMap[
          NetworkType.Acala
        ].getPositionsByOwnerId(wallet);
        acalaPos.push(...positions);
      }

      const formattedAcalaData = await this.formatPositionData(
        acalaPos,
        NetworkType.Acala
      );
      const formattedKaruraData = await this.formatPositionData(
        karuraPos,
        NetworkType.Karura
      );
      const user = await this.client.users.fetch(subscriber);

      if (formattedAcalaData.yellow.length > 0) {
        // concat position.id by newline
        const positionList = formattedAcalaData.yellow.reduce(
          (acc, position) => {
            acc += `${position.id}\n`;
            return acc;
          },
          ''
        );
        await user
          .send(
            `${formattedAcalaData.yellow.length} of your subscribed Acala positions are in the yellow zone:\n` +
              positionList
          )
          .catch(console.error);
      }

      if (formattedAcalaData.red.length > 0) {
        // concat position.id by newline
        const positionList = formattedAcalaData.red.reduce((acc, position) => {
          acc += `${position.id}\n`;
          return acc;
        }, '');
        await user
          .send(
            `${formattedAcalaData.red.length} of your subscribed Acala positions are in the red zone:\n` +
              positionList
          )
          .catch(console.error);
      }

      if (acalaYellowZonePercentage > 20) {
        user
          .send(
            `${acalaYellowZonePercentage}% of the Acala vaults are in yellow zone`
          )
          .catch(console.error);
      }
      if (acalaRedZonePercentage > 10) {
        user
          .send(
            `${acalaRedZonePercentage}% of the Acala vaults are in red zone`
          )
          .catch(console.error);
      }

      if (formattedKaruraData.yellow.length > 0) {
        // concat position.id by newline
        const positionList = formattedKaruraData.yellow.reduce(
          (acc, position) => {
            acc += `${position.id}\n`;
            return acc;
          },
          ''
        );
        await user
          .send(
            `${formattedKaruraData.yellow.length} of your subscribed Karura positions are in the yellow zone:\n` +
              positionList
          )
          .catch(console.error);
      }

      if (formattedKaruraData.red.length > 0) {
        // concat position.id by newline
        const positionList = formattedKaruraData.red.reduce((acc, position) => {
          acc += `${position.id}\n`;
          return acc;
        }, '');
        await user
          .send(
            `${formattedKaruraData.red.length} of your subscribed Karura positions are in the red zone:\n` +
              positionList
          )
          .catch(console.error);
      }

      if (karuraYellowZonePercentage > 20) {
        user
          .send(
            `${karuraYellowZonePercentage}% of the Karura vaults are in yellow zone`
          )
          .catch(console.error);
      }
      if (karuraRedZonePercentage > 10) {
        user
          .send(
            `${karuraRedZonePercentage}% of the Karura vaults are in red zone`
          )
          .catch(console.error);
      }
    }
    const currentDateTime = new Date();
    const delayTime = Math.abs(
      this.latestHourlyUpdate.getTime() - currentDateTime.getTime() + 3600000
    );
    await delay(delayTime);
    return this.sendHourlyUpdates();
  }
}
