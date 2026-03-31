import { EmbedBuilder } from 'discord.js';
import axios from 'axios';

async function getGuildConfig(supabase, guildId) {
  const { data } = await supabase
    .from('guilds')
    .select('*')
    .eq('guild_id', guildId)
    .maybeSingle();

  return data;
}

async function nitradoRequest(token, serverId, endpoint, method = 'GET', data = null) {
  const url = `https://api.nitrado.net/services/${serverId}${endpoint}`;

  try {
    const response = await axios({
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data,
    });

    return response.data;
  } catch (error) {
    console.error('Nitrado API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Nitrado API request failed');
  }
}

export const serverCommands = {
  setup: async (interaction, supabase) => {
    const nitradoToken = interaction.options.getString('nitrado_token');
    const serverId = interaction.options.getString('server_id');

    await interaction.deferReply({ ephemeral: true });

    try {
      const serverInfo = await nitradoRequest(nitradoToken, serverId, '/gameservers');

      const { error } = await supabase
        .from('guilds')
        .upsert({
          guild_id: interaction.guildId,
          guild_name: interaction.guild.name,
          nitrado_token: nitradoToken,
          nitrado_server_id: serverId,
        }, { onConflict: 'guild_id' });

      if (error) throw error;

      await supabase
        .from('dayz_servers')
        .upsert({
          guild_id: interaction.guildId,
          server_name: serverInfo.data.gameserver.game || 'DayZ Server',
          nitrado_id: serverId,
          game_type: 'dayz',
        }, { onConflict: 'guild_id,nitrado_id' });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Setup Complete')
        .setDescription('Nitrado server has been successfully configured!')
        .addFields(
          { name: 'Server ID', value: serverId },
          { name: 'Game', value: serverInfo.data.gameserver.game || 'DayZ' }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Setup error:', error);
      await interaction.editReply({ content: '❌ Failed to setup Nitrado integration. Please check your credentials.' });
    }
  },

  server: async (interaction, supabase) => {
    await interaction.deferReply();

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      const serverData = await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers');
      const gameserver = serverData.data.gameserver;

      await supabase
        .from('dayz_servers')
        .update({
          status: gameserver.status,
          players_online: gameserver.query?.player_current || 0,
          max_players: gameserver.query?.player_max || 60,
          updated_at: new Date().toISOString(),
        })
        .eq('guild_id', interaction.guildId)
        .eq('nitrado_id', config.nitrado_server_id);

      const statusEmoji = gameserver.status === 'started' ? '🟢' : '🔴';
      const statusColor = gameserver.status === 'started' ? 0x00FF00 : 0xFF0000;

      const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🎮 DayZ Server Status')
        .addFields(
          { name: 'Status', value: `${statusEmoji} ${gameserver.status.toUpperCase()}`, inline: true },
          { name: 'Players', value: `${gameserver.query?.player_current || 0}/${gameserver.query?.player_max || 60}`, inline: true },
          { name: 'IP Address', value: `${gameserver.ip}:${gameserver.port}`, inline: false },
          { name: 'Game', value: gameserver.game || 'DayZ', inline: true },
          { name: 'Location', value: gameserver.location || 'Unknown', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Server status error:', error);
      await interaction.editReply({ content: '❌ Failed to fetch server status.' });
    }
  },

  startserver: async (interaction, supabase) => {
    await interaction.deferReply();

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/restart', 'POST', {
        message: 'Server starting via Discord bot',
        restart_message: 'Server is starting...',
      });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Server Starting')
        .setDescription('The DayZ server is now starting. This may take a few minutes.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Start server error:', error);
      await interaction.editReply({ content: '❌ Failed to start the server.' });
    }
  },

  stopserver: async (interaction, supabase) => {
    await interaction.deferReply();

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/stop', 'POST', {
        message: 'Server stopping via Discord bot',
        stop_message: 'Server is shutting down...',
      });

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('⛔ Server Stopping')
        .setDescription('The DayZ server is now stopping.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Stop server error:', error);
      await interaction.editReply({ content: '❌ Failed to stop the server.' });
    }
  },

  restartserver: async (interaction, supabase) => {
    await interaction.deferReply();

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/restart', 'POST', {
        message: 'Server restarting via Discord bot',
        restart_message: 'Server is restarting...',
      });

      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('🔄 Server Restarting')
        .setDescription('The DayZ server is now restarting. This may take a few minutes.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Restart server error:', error);
      await interaction.editReply({ content: '❌ Failed to restart the server.' });
    }
  },

  logs: async (interaction, supabase) => {
    await interaction.deferReply({ ephemeral: true });

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      const logsData = await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/file_server/list?dir=/games');

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📄 Server Logs')
        .setDescription('Access your server logs through the Nitrado web interface or use the dashboard.')
        .addFields(
          { name: 'Web Interface', value: '[Nitrado Dashboard](https://server.nitrado.net)' }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Logs error:', error);
      await interaction.editReply({ content: '❌ Failed to fetch server logs.' });
    }
  },

  banlist: async (interaction, supabase) => {
    await interaction.deferReply({ ephemeral: true });

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      const bans = await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/games/banlist');

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🚫 Server Ban List')
        .setDescription(bans.data?.entries?.length ? `Total Bans: ${bans.data.entries.length}` : 'No bans found')
        .setTimestamp();

      if (bans.data?.entries) {
        bans.data.entries.slice(0, 10).forEach((ban, index) => {
          embed.addFields({
            name: `Ban ${index + 1}`,
            value: `ID: ${ban.identifier || 'Unknown'}\nReason: ${ban.reason || 'No reason'}`,
            inline: false,
          });
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Banlist error:', error);
      await interaction.editReply({ content: '❌ Failed to fetch ban list.' });
    }
  },

  addban: async (interaction, supabase) => {
    await interaction.deferReply();

    const identifier = interaction.options.getString('identifier');
    const reason = interaction.options.getString('reason');

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/games/banlist', 'POST', {
        identifier: identifier,
        reason: reason,
      });

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🚫 Player Banned')
        .addFields(
          { name: 'Identifier', value: identifier },
          { name: 'Reason', value: reason },
          { name: 'Banned By', value: interaction.user.tag }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Add ban error:', error);
      await interaction.editReply({ content: '❌ Failed to add ban.' });
    }
  },

  removeban: async (interaction, supabase) => {
    await interaction.deferReply();

    const identifier = interaction.options.getString('identifier');

    const config = await getGuildConfig(supabase, interaction.guildId);

    if (!config || !config.nitrado_token || !config.nitrado_server_id) {
      return interaction.editReply({
        content: '❌ Server not configured! Use `/setup` to configure Nitrado integration.',
      });
    }

    try {
      await nitradoRequest(config.nitrado_token, config.nitrado_server_id, '/gameservers/games/banlist', 'DELETE', {
        identifier: identifier,
      });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Player Unbanned')
        .addFields(
          { name: 'Identifier', value: identifier },
          { name: 'Unbanned By', value: interaction.user.tag }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Remove ban error:', error);
      await interaction.editReply({ content: '❌ Failed to remove ban.' });
    }
  },

  psnlookup: async (interaction, supabase) => {
    await interaction.deferReply({ ephemeral: true });

    const deviceId = interaction.options.getString('deviceid');

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🔍 PSN Device ID Lookup')
      .setDescription(`Device ID: \`${deviceId}\``)
      .addFields(
        { name: 'Information', value: 'PSN Device IDs are unique identifiers for PlayStation Network devices.' },
        { name: 'Format', value: 'Device IDs are typically 64-character hexadecimal strings.' },
        { name: 'Usage', value: 'Use this ID to ban or track PlayStation players on your DayZ server.' }
      )
      .setFooter({ text: 'Note: Public PSN lookup services are limited. Check your server logs for player connections.' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
