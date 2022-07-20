import { Message } from 'discord.js';
import { SubscriptionService } from '../services';
import { NetworkType } from './networks';

export interface Command {
  name: string;
  description: string;
  // Making `args` optional
  execute(
    message: Message,
    subscriptionService?: SubscriptionService,
    network?: NetworkType,
    args?: string[]
  ): any;
}
