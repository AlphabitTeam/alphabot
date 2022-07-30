import { Client } from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { Command, NetworkType } from './types';
import { KaruraVaultsApi, KaruraVaultStatusService } from 'karura-vaults-api';
import { AcalaVaultsApi, AcalaVaultStatusService } from 'acala-vaults-api';
import KeyvPostgres from '@keyvhq/postgres';
import Keyv from 'keyv';
import { SubscriptionService } from './services';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const globPromise = promisify(glob);
const commands: Command[] = [];

const client = new Client({
  intents: ['GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL'],
});
let keyv: Keyv;
let subscriptionService: SubscriptionService;
client.once('ready', async () => {
  keyv = new Keyv({ store: new KeyvPostgres(`${process.env.DATABASE_URI}`) });
  keyv.on('error', (err) => {
    throw err;
  });
  if (!(await keyv.has('subscribers'))) {
    await keyv.set('subscribers', []);
  }
  const commandFiles = await globPromise(`${__dirname}/commands/*.js`);
  console.log(commandFiles);
  for (const file of commandFiles) {
    const command = await import(file);
    commands.push(command.command as Command);
  }
  console.log(commands);

  const karuraApi = new KaruraVaultsApi();
  const karuraVaultsStatus = new KaruraVaultStatusService(karuraApi);

  const acalaApi = new AcalaVaultsApi();
  const acalaVaultsStatus = new AcalaVaultStatusService(acalaApi);

  await karuraVaultsStatus.init();
  await acalaVaultsStatus.init();

  subscriptionService = new SubscriptionService(
    client,
    keyv,
    karuraVaultsStatus,
    acalaVaultsStatus,
    karuraApi,
    acalaApi
  );

  Promise.all([karuraVaultsStatus.start(), acalaVaultsStatus.start()]);
});

const prefix = '/alphabit ';

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return;
  }

  const [network, commandName, ...args] = message.content
    .slice(prefix.length)
    .split(/ +/);

  console.log(commandName);
  console.log(args);

  if (!commandName) {
    return;
  }

  if (network !== NetworkType.Acala && network !== NetworkType.Karura) {
    message.channel
      .send(
        `You need to specify a network. Start your command with "/alphabit ${NetworkType.Acala}" or "/alphabit ${NetworkType.Karura}".`
      )
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

  const command = commands.find((c) => c.name === commandName);

  if (command) {
    command.execute(message, subscriptionService, network, args);
  }
 else {
    message.channel.send(`Command ${commandName} not found`).catch((error) => {
      console.error(
        `Could not send help DM to ${message.author.tag}.\n`,
        error
      );
      message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
    });
  }
});

client.login(process.env.TOKEN);
