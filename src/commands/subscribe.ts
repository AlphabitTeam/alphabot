import { Message } from 'discord.js';
import { Command, NetworkType } from '../types';
import { SubscriptionService } from '../services';

export const command: Command = {
  name: 'subscribe',
  description: 'Subscribe to notifications',
  async execute(
    message: Message,
    subscriptionService: SubscriptionService,
    network: NetworkType,
    args: string[]
  ) {
    if (args.length < 1) {
      message.channel
        .send('You need to specify a wallet address.')
        .catch((error) => {
          console.error(
            `Could not send help DM to ${message.author.tag}.\n`,
            error
          );
          message.reply(
            'It seems like I can\'t DM you! Do you have DMs disabled?'
          );
        });
      return;
    }
    args.forEach(async (wallet) => {
      await subscriptionService.addSubscription(
        message.author.id,
        wallet,
        network
      );
    });
    await message.author
      .send(`Subscribed to ${args.join(', ')}`)
      .catch((error) => {
        console.error(
          `Could not send help DM to ${message.author.tag}.\n`,
          error
        );
        message.reply(
          'It seems like I can\'t DM you! Do you have DMs disabled?'
        );
      });
  },
};
