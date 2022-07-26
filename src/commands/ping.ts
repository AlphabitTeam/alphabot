import { Message } from 'discord.js';
import { Command } from '../types';

export const command: Command = {
  name: 'ping',
  description: 'Ping Pong command',
  async execute(message: Message) {
    await message.channel.send('Pong!').catch(console.error);
  },
};
