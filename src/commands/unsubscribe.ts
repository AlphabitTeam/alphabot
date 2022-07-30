import { Message } from 'discord.js';
import { SubscriptionService } from '../services';
import { Command, NetworkType } from '../types';

export const command: Command = {
  name: 'unsubscribe',
  description: 'unsubscribe from notifications',
  async execute(
    message: Message,
    subscriptionService: SubscriptionService,
    network: NetworkType,
    args?: string[]
  ) {
    if (!args || args.length === 0) {
      await subscriptionService.removeSubscription(message.author.id);
    }
 else {
      args.forEach(async (wallet) => {
        await subscriptionService.removeSubscription(
          message.author.id,
          network,
          wallet
        );
      });
    }
    await message.author.send('Unsubscribed successfully').catch((error) => {
      console.error(
        `Could not send help DM to ${message.author.tag}.\n`,
        error
      );
      message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
    });
  },
};
