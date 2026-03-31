import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export async function registerCommands(client) {
  const commands = [
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a user from the server')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to ban')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Reason for the ban')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a user from the server')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to kick')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Reason for the kick')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Warn a user')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to warn')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Reason for the warning')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('warnings')
      .setDescription('Check warnings for a user')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to check')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('clearwarnings')
      .setDescription('Clear all warnings for a user')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to clear warnings for')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('Timeout a user')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to timeout')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('duration')
          .setDescription('Duration in minutes')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Reason for the timeout')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('purge')
      .setDescription('Delete multiple messages')
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Number of messages to delete (1-100)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Check your or another users balance')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to check')
          .setRequired(false)),

    new SlashCommandBuilder()
      .setName('daily')
      .setDescription('Claim your daily reward'),

    new SlashCommandBuilder()
      .setName('work')
      .setDescription('Work to earn money'),

    new SlashCommandBuilder()
      .setName('pay')
      .setDescription('Pay another user')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to pay')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Amount to pay')
          .setRequired(true)
          .setMinValue(1)),

    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('View the server economy leaderboard'),

    new SlashCommandBuilder()
      .setName('coinflip')
      .setDescription('Flip a coin and bet on the outcome')
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Amount to bet')
          .setRequired(true)
          .setMinValue(10))
      .addStringOption(option =>
        option.setName('choice')
          .setDescription('Heads or tails?')
          .setRequired(true)
          .addChoices(
            { name: 'Heads', value: 'heads' },
            { name: 'Tails', value: 'tails' }
          )),

    new SlashCommandBuilder()
      .setName('dice')
      .setDescription('Roll dice and win based on the number')
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Amount to bet')
          .setRequired(true)
          .setMinValue(10)),

    new SlashCommandBuilder()
      .setName('slots')
      .setDescription('Play the slot machine')
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Amount to bet')
          .setRequired(true)
          .setMinValue(10)),

    new SlashCommandBuilder()
      .setName('server')
      .setDescription('View DayZ server status'),

    new SlashCommandBuilder()
      .setName('startserver')
      .setDescription('Start the DayZ server')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('stopserver')
      .setDescription('Stop the DayZ server')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('restartserver')
      .setDescription('Restart the DayZ server')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('banlist')
      .setDescription('View the server ban list')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('addban')
      .setDescription('Add a player to the ban list')
      .addStringOption(option =>
        option.setName('identifier')
          .setDescription('Steam ID, Xbox ID, or PSN Device ID')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Reason for the ban')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('removeban')
      .setDescription('Remove a player from the ban list')
      .addStringOption(option =>
        option.setName('identifier')
          .setDescription('Steam ID, Xbox ID, or PSN Device ID')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('psnlookup')
      .setDescription('Lookup PSN Device ID information')
      .addStringOption(option =>
        option.setName('deviceid')
          .setDescription('PSN Device ID to lookup')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('logs')
      .setDescription('View server logs')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Setup bot configuration for this server')
      .addStringOption(option =>
        option.setName('nitrado_token')
          .setDescription('Your Nitrado API token')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('server_id')
          .setDescription('Your Nitrado server ID')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('help')
      .setDescription('View all available commands'),

    new SlashCommandBuilder()
      .setName('modlogs')
      .setDescription('View moderation logs')
      .addIntegerOption(option =>
        option.setName('limit')
          .setDescription('Number of logs to show')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(25))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}
