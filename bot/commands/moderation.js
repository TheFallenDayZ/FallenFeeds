import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const moderationCommands = {
  ban: async (interaction, supabase) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
    }

    try {
      await interaction.guild.members.ban(user, { reason });

      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: user.id,
        moderator_id: interaction.user.id,
        action: 'ban',
        reason: reason,
      });

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🔨 User Banned')
        .setDescription(`**${user.tag}** has been banned`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Ban error:', error);
      await interaction.reply({ content: '❌ Failed to ban user.', ephemeral: true });
    }
  },

  kick: async (interaction, supabase) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to kick members.', ephemeral: true });
    }

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);

      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: user.id,
        moderator_id: interaction.user.id,
        action: 'kick',
        reason: reason,
      });

      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('👢 User Kicked')
        .setDescription(`**${user.tag}** has been kicked`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Kick error:', error);
      await interaction.reply({ content: '❌ Failed to kick user.', ephemeral: true });
    }
  },

  warn: async (interaction, supabase) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    await supabase.from('warnings').insert({
      guild_id: interaction.guildId,
      user_id: user.id,
      moderator_id: interaction.user.id,
      reason: reason,
      active: true,
    });

    await supabase.from('moderation_logs').insert({
      guild_id: interaction.guildId,
      user_id: user.id,
      moderator_id: interaction.user.id,
      action: 'warn',
      reason: reason,
    });

    const { data: warnings } = await supabase
      .from('warnings')
      .select('*')
      .eq('guild_id', interaction.guildId)
      .eq('user_id', user.id)
      .eq('active', true);

    const embed = new EmbedBuilder()
      .setColor(0xFFFF00)
      .setTitle('⚠️ User Warned')
      .setDescription(`**${user.tag}** has been warned`)
      .addFields(
        { name: 'Reason', value: reason },
        { name: 'Total Warnings', value: `${warnings?.length || 1}` },
        { name: 'Moderator', value: interaction.user.tag }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  warnings: async (interaction, supabase) => {
    const user = interaction.options.getUser('user');

    const { data: warnings } = await supabase
      .from('warnings')
      .select('*')
      .eq('guild_id', interaction.guildId)
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!warnings || warnings.length === 0) {
      return interaction.reply({ content: `${user.tag} has no active warnings.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFF00)
      .setTitle(`⚠️ Warnings for ${user.tag}`)
      .setDescription(`Total Active Warnings: ${warnings.length}`)
      .setTimestamp();

    warnings.slice(0, 10).forEach((warning, index) => {
      const date = new Date(warning.created_at).toLocaleDateString();
      embed.addFields({
        name: `Warning ${index + 1} - ${date}`,
        value: `Reason: ${warning.reason}`,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },

  clearwarnings: async (interaction, supabase) => {
    const user = interaction.options.getUser('user');

    await supabase
      .from('warnings')
      .update({ active: false })
      .eq('guild_id', interaction.guildId)
      .eq('user_id', user.id);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Warnings Cleared')
      .setDescription(`All warnings for **${user.tag}** have been cleared`)
      .addFields({ name: 'Moderator', value: interaction.user.tag })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  timeout: async (interaction, supabase) => {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(duration * 60 * 1000, reason);

      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: user.id,
        moderator_id: interaction.user.id,
        action: 'timeout',
        reason: reason,
        duration: duration,
      });

      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('⏱️ User Timed Out')
        .setDescription(`**${user.tag}** has been timed out`)
        .addFields(
          { name: 'Duration', value: `${duration} minutes` },
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Timeout error:', error);
      await interaction.reply({ content: '❌ Failed to timeout user.', ephemeral: true });
    }
  },

  purge: async (interaction, supabase) => {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to manage messages.', ephemeral: true });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      const messages = await interaction.channel.messages.fetch({ limit: amount });
      await interaction.channel.bulkDelete(messages, true);

      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        moderator_id: interaction.user.id,
        action: 'purge',
        reason: `Deleted ${messages.size} messages`,
      });

      await interaction.editReply({ content: `✅ Successfully deleted ${messages.size} messages.` });
    } catch (error) {
      console.error('Purge error:', error);
      await interaction.editReply({ content: '❌ Failed to delete messages.' });
    }
  },

  modlogs: async (interaction, supabase) => {
    const limit = interaction.options.getInteger('limit') || 10;

    const { data: logs } = await supabase
      .from('moderation_logs')
      .select('*')
      .eq('guild_id', interaction.guildId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!logs || logs.length === 0) {
      return interaction.reply({ content: 'No moderation logs found.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('📋 Moderation Logs')
      .setDescription(`Showing last ${logs.length} actions`)
      .setTimestamp();

    logs.forEach((log, index) => {
      const date = new Date(log.created_at).toLocaleDateString();
      const time = new Date(log.created_at).toLocaleTimeString();
      embed.addFields({
        name: `${log.action.toUpperCase()} - ${date} ${time}`,
        value: `User: <@${log.user_id}>\nModerator: <@${log.moderator_id}>\nReason: ${log.reason || 'No reason'}`,
        inline: false,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
