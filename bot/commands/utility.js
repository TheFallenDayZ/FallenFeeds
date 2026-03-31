import { EmbedBuilder } from 'discord.js';

export const utilityCommands = {
  help: async (interaction) => {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('📚 Bot Commands')
      .setDescription('Here are all available commands:')
      .addFields(
        {
          name: '⚖️ Moderation Commands',
          value: '`/ban` - Ban a user\n`/kick` - Kick a user\n`/warn` - Warn a user\n`/warnings` - View user warnings\n`/clearwarnings` - Clear warnings\n`/timeout` - Timeout a user\n`/purge` - Delete multiple messages\n`/modlogs` - View moderation logs',
          inline: false,
        },
        {
          name: '💰 Economy Commands',
          value: '`/balance` - Check balance\n`/daily` - Claim daily reward\n`/work` - Work for money\n`/pay` - Pay another user\n`/leaderboard` - View top users',
          inline: false,
        },
        {
          name: '🎰 Gambling Commands',
          value: '`/coinflip` - Flip a coin\n`/dice` - Roll dice\n`/slots` - Play slots',
          inline: false,
        },
        {
          name: '🎮 Server Management',
          value: '`/server` - View server status\n`/startserver` - Start server\n`/stopserver` - Stop server\n`/restartserver` - Restart server\n`/logs` - View server logs\n`/banlist` - View ban list\n`/addban` - Add a ban\n`/removeban` - Remove a ban\n`/psnlookup` - Lookup PSN ID',
          inline: false,
        },
        {
          name: '⚙️ Setup',
          value: '`/setup` - Configure Nitrado integration\n`/help` - Show this menu',
          inline: false,
        }
      )
      .setFooter({ text: 'Use /command to see detailed info about each command' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
