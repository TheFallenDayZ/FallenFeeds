import { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { registerCommands } from './commands/register.js';
import { moderationCommands } from './commands/moderation.js';
import { economyCommands } from './commands/economy.js';
import { gamblingCommands } from './commands/gambling.js';
import { serverCommands } from './commands/server.js';
import { utilityCommands } from './commands/utility.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);

  await registerCommands(client);

  client.user.setActivity('DayZ Servers | /help', { type: 'WATCHING' });
});

client.on('guildCreate', async (guild) => {
  const { error } = await supabase
    .from('guilds')
    .insert({
      guild_id: guild.id,
      guild_name: guild.name,
      prefix: '!',
    });

  if (error) console.error('Error creating guild:', error);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (moderationCommands[commandName]) {
      await moderationCommands[commandName](interaction, supabase);
    } else if (economyCommands[commandName]) {
      await economyCommands[commandName](interaction, supabase);
    } else if (gamblingCommands[commandName]) {
      await gamblingCommands[commandName](interaction, supabase);
    } else if (serverCommands[commandName]) {
      await serverCommands[commandName](interaction, supabase);
    } else if (utilityCommands[commandName]) {
      await utilityCommands[commandName](interaction, supabase);
    }
  } catch (error) {
    console.error(`Error executing ${commandName}:`, error);

    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Error')
      .setDescription('An error occurred while executing this command.')
      .setTimestamp();

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

export { client, supabase };
