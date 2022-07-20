import { Message } from 'discord.js';
import { Command, NetworkType } from '../types';
import { SubscriptionService } from '../services';

export const command: Command = {
	name: 'query',
	description: 'query positions',
	async execute(
		message: Message,
		subscriptionService: SubscriptionService,
		network: NetworkType,
		args: string[]
	) {
		const positions = await subscriptionService.getSubscribedPositions(
			message.author.id,
			network,
			args.length === 0 ? undefined : args
		);
		if (positions.length === 0) {
			message.author.send('No subscriptions found').catch((error) => {
				console.error(
					`Could not send help DM to ${message.author.tag}.\n`,
					error
				);
				message.reply(
					'it seems like I can\'t DM you! Do you have DMs disabled?'
				);
			});
		}

		const formattedPos = await subscriptionService.formatPositionData(
			positions,
			network
		);

		console.log(formattedPos);

		if (formattedPos.yellow.length > 0) {
			// concat position.id by newline
			const positionList = formattedPos.yellow.reduce((acc, position) => {
				acc += `${position.id}\n`;
				return acc;
			}, '');
			await message.author
				.send(
					`${formattedPos.yellow.length} of your subscribed positions are in the yellow zone:\n` +
            positionList
				)
				.catch((error) => {
					console.error(
						`Could not send help DM to ${message.author.tag}.\n`,
						error
					);
					message.reply(
						'it seems like I can\'t DM you! Do you have DMs disabled?'
					);
				});
		}
		else if (formattedPos.red.length > 0) {
			// concat position.id by newline
			const positionList = formattedPos.red.reduce((acc, position) => {
				acc += `${position.id}\n`;
				return acc;
			}, '');
			await message.author
				.send(
					`${formattedPos.red.length} of your subscribed positions are in the red zone:\n` +
            positionList
				)
				.catch((error) => {
					console.error(
						`Could not send help DM to ${message.author.tag}.\n`,
						error
					);
					message.reply(
						'it seems like I can\'t DM you! Do you have DMs disabled?'
					);
				});
		}
		else {
			await message.author
				.send('All your subscribed positions are safe from liquidation')
				.catch((error) => {
					console.error(
						`Could not send help DM to ${message.author.tag}.\n`,
						error
					);
					message.reply(
						'it seems like I can\'t DM you! Do you have DMs disabled?'
					);
				});
		}
	},
};
