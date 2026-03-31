import { EmbedBuilder } from 'discord.js';

const DAILY_REWARD = 1000;
const WORK_MIN = 100;
const WORK_MAX = 500;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const WORK_COOLDOWN = 60 * 60 * 1000;

const cooldowns = new Map();

async function getOrCreateUser(supabase, discordId, username) {
  const { data: existing } = await supabase
    .from('discord_users')
    .select('*')
    .eq('discord_id', discordId)
    .maybeSingle();

  if (existing) return existing;

  const { data: newUser } = await supabase
    .from('discord_users')
    .insert({
      discord_id: discordId,
      username: username,
      balance: 0,
      xp: 0,
      level: 1,
    })
    .select()
    .single();

  return newUser;
}

async function updateBalance(supabase, discordId, amount) {
  const { data } = await supabase
    .from('discord_users')
    .select('balance')
    .eq('discord_id', discordId)
    .single();

  const newBalance = (data?.balance || 0) + amount;

  await supabase
    .from('discord_users')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('discord_id', discordId);

  return newBalance;
}

export const economyCommands = {
  balance: async (interaction, supabase) => {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const user = await getOrCreateUser(supabase, targetUser.id, targetUser.username);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`💰 ${targetUser.username}'s Balance`)
      .setDescription(`**Balance:** $${user.balance.toLocaleString()}`)
      .addFields(
        { name: 'Level', value: `${user.level}`, inline: true },
        { name: 'XP', value: `${user.xp}`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  daily: async (interaction, supabase) => {
    const userId = interaction.user.id;
    const cooldownKey = `daily_${userId}`;
    const lastDaily = cooldowns.get(cooldownKey);

    if (lastDaily && Date.now() - lastDaily < DAILY_COOLDOWN) {
      const timeLeft = DAILY_COOLDOWN - (Date.now() - lastDaily);
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

      return interaction.reply({
        content: `⏰ You've already claimed your daily reward! Come back in ${hours}h ${minutes}m`,
        ephemeral: true,
      });
    }

    await getOrCreateUser(supabase, userId, interaction.user.username);
    const newBalance = await updateBalance(supabase, userId, DAILY_REWARD);

    await supabase.from('economy_transactions').insert({
      user_id: userId,
      guild_id: interaction.guildId,
      amount: DAILY_REWARD,
      type: 'daily',
      description: 'Daily reward claimed',
    });

    cooldowns.set(cooldownKey, Date.now());

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎁 Daily Reward')
      .setDescription(`You've claimed your daily reward of **$${DAILY_REWARD.toLocaleString()}**!`)
      .addFields({ name: 'New Balance', value: `$${newBalance.toLocaleString()}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  work: async (interaction, supabase) => {
    const userId = interaction.user.id;
    const cooldownKey = `work_${userId}`;
    const lastWork = cooldowns.get(cooldownKey);

    if (lastWork && Date.now() - lastWork < WORK_COOLDOWN) {
      const timeLeft = WORK_COOLDOWN - (Date.now() - lastWork);
      const minutes = Math.floor(timeLeft / (60 * 1000));

      return interaction.reply({
        content: `⏰ You're tired! Rest for ${minutes} more minutes before working again.`,
        ephemeral: true,
      });
    }

    await getOrCreateUser(supabase, userId, interaction.user.username);

    const jobs = [
      { name: 'delivered packages', emoji: '📦' },
      { name: 'coded a website', emoji: '💻' },
      { name: 'streamed on Twitch', emoji: '🎮' },
      { name: 'made coffee', emoji: '☕' },
      { name: 'walked dogs', emoji: '🐕' },
      { name: 'cleaned houses', emoji: '🏠' },
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1)) + WORK_MIN;

    const newBalance = await updateBalance(supabase, userId, earnings);

    await supabase.from('economy_transactions').insert({
      user_id: userId,
      guild_id: interaction.guildId,
      amount: earnings,
      type: 'work',
      description: `Worked: ${job.name}`,
    });

    cooldowns.set(cooldownKey, Date.now());

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`${job.emoji} Work Complete!`)
      .setDescription(`You ${job.name} and earned **$${earnings.toLocaleString()}**!`)
      .addFields({ name: 'New Balance', value: `$${newBalance.toLocaleString()}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  pay: async (interaction, supabase) => {
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (recipient.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot pay yourself!', ephemeral: true });
    }

    if (recipient.bot) {
      return interaction.reply({ content: '❌ You cannot pay bots!', ephemeral: true });
    }

    const sender = await getOrCreateUser(supabase, interaction.user.id, interaction.user.username);

    if (sender.balance < amount) {
      return interaction.reply({
        content: `❌ You don't have enough money! Your balance: $${sender.balance.toLocaleString()}`,
        ephemeral: true,
      });
    }

    await getOrCreateUser(supabase, recipient.id, recipient.username);
    await updateBalance(supabase, interaction.user.id, -amount);
    await updateBalance(supabase, recipient.id, amount);

    await supabase.from('economy_transactions').insert([
      {
        user_id: interaction.user.id,
        guild_id: interaction.guildId,
        amount: -amount,
        type: 'transfer',
        description: `Paid ${recipient.username}`,
      },
      {
        user_id: recipient.id,
        guild_id: interaction.guildId,
        amount: amount,
        type: 'transfer',
        description: `Received from ${interaction.user.username}`,
      },
    ]);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('💸 Payment Sent')
      .setDescription(`You paid **${recipient.username}** $${amount.toLocaleString()}!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  leaderboard: async (interaction, supabase) => {
    const { data: users } = await supabase
      .from('discord_users')
      .select('*')
      .order('balance', { ascending: false })
      .limit(10);

    if (!users || users.length === 0) {
      return interaction.reply({ content: 'No users found in the economy system.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🏆 Economy Leaderboard')
      .setDescription('Top 10 Richest Users')
      .setTimestamp();

    users.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      embed.addFields({
        name: `${medal} ${user.username}`,
        value: `Balance: $${user.balance.toLocaleString()} | Level: ${user.level}`,
        inline: false,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
