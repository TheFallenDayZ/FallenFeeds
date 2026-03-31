import { EmbedBuilder } from 'discord.js';

async function getUser(supabase, discordId) {
  const { data } = await supabase
    .from('discord_users')
    .select('*')
    .eq('discord_id', discordId)
    .maybeSingle();

  return data;
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

async function logGamble(supabase, userId, guildId, gameType, betAmount, resultAmount, won) {
  await supabase.from('gambling_history').insert({
    user_id: userId,
    guild_id: guildId,
    game_type: gameType,
    bet_amount: betAmount,
    result_amount: resultAmount,
    won: won,
  });

  await supabase.from('economy_transactions').insert({
    user_id: userId,
    guild_id: guildId,
    amount: resultAmount,
    type: 'gambling',
    description: `${gameType} - ${won ? 'Won' : 'Lost'}`,
  });
}

export const gamblingCommands = {
  coinflip: async (interaction, supabase) => {
    const betAmount = interaction.options.getInteger('amount');
    const choice = interaction.options.getString('choice');
    const userId = interaction.user.id;

    const user = await getUser(supabase, userId);
    if (!user || user.balance < betAmount) {
      return interaction.reply({
        content: `❌ You don't have enough money! Your balance: $${user?.balance.toLocaleString() || 0}`,
        ephemeral: true,
      });
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === choice;
    const winAmount = won ? betAmount : -betAmount;

    const newBalance = await updateBalance(supabase, userId, winAmount);
    await logGamble(supabase, userId, interaction.guildId, 'coinflip', betAmount, winAmount, won);

    const embed = new EmbedBuilder()
      .setColor(won ? 0x00FF00 : 0xFF0000)
      .setTitle('🪙 Coinflip')
      .setDescription(
        `You chose **${choice}**\nThe coin landed on **${result}**!\n\n${
          won ? `🎉 You won **$${betAmount.toLocaleString()}**!` : `😢 You lost **$${betAmount.toLocaleString()}**!`
        }`
      )
      .addFields({ name: 'New Balance', value: `$${newBalance.toLocaleString()}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  dice: async (interaction, supabase) => {
    const betAmount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;

    const user = await getUser(supabase, userId);
    if (!user || user.balance < betAmount) {
      return interaction.reply({
        content: `❌ You don't have enough money! Your balance: $${user?.balance.toLocaleString() || 0}`,
        ephemeral: true,
      });
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    let multiplier = 0;
    let won = false;

    if (roll === 6) {
      multiplier = 4;
      won = true;
    } else if (roll === 5) {
      multiplier = 2;
      won = true;
    } else if (roll === 4) {
      multiplier = 1;
      won = true;
    }

    const winAmount = won ? betAmount * multiplier - betAmount : -betAmount;
    const newBalance = await updateBalance(supabase, userId, winAmount);
    await logGamble(supabase, userId, interaction.guildId, 'dice', betAmount, winAmount, won);

    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    const embed = new EmbedBuilder()
      .setColor(won ? 0x00FF00 : 0xFF0000)
      .setTitle('🎲 Dice Roll')
      .setDescription(
        `You rolled: **${diceEmojis[roll - 1]} ${roll}**\n\n${
          won
            ? `🎉 You won **$${(betAmount * multiplier).toLocaleString()}**! (${multiplier}x multiplier)`
            : `😢 You lost **$${betAmount.toLocaleString()}**!`
        }`
      )
      .addFields(
        { name: 'Payout Rules', value: '🎲 6 = 4x\n🎲 5 = 2x\n🎲 4 = 1x\n🎲 1-3 = Loss', inline: true },
        { name: 'New Balance', value: `$${newBalance.toLocaleString()}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  slots: async (interaction, supabase) => {
    const betAmount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;

    const user = await getUser(supabase, userId);
    if (!user || user.balance < betAmount) {
      return interaction.reply({
        content: `❌ You don't have enough money! Your balance: $${user?.balance.toLocaleString() || 0}`,
        ephemeral: true,
      });
    }

    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

    let multiplier = 0;
    let won = false;

    if (reel1 === reel2 && reel2 === reel3) {
      if (reel1 === '7️⃣') {
        multiplier = 10;
      } else if (reel1 === '💎') {
        multiplier = 7;
      } else {
        multiplier = 5;
      }
      won = true;
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      multiplier = 2;
      won = true;
    }

    const winAmount = won ? betAmount * multiplier - betAmount : -betAmount;
    const newBalance = await updateBalance(supabase, userId, winAmount);
    await logGamble(supabase, userId, interaction.guildId, 'slots', betAmount, winAmount, won);

    const embed = new EmbedBuilder()
      .setColor(won ? 0x00FF00 : 0xFF0000)
      .setTitle('🎰 Slot Machine')
      .setDescription(
        `**[ ${reel1} | ${reel2} | ${reel3} ]**\n\n${
          won
            ? `🎉 You won **$${(betAmount * multiplier).toLocaleString()}**! (${multiplier}x multiplier)`
            : `😢 You lost **$${betAmount.toLocaleString()}**!`
        }`
      )
      .addFields(
        { name: 'Payout Rules', value: '7️⃣7️⃣7️⃣ = 10x\n💎💎💎 = 7x\nOther 3-match = 5x\n2-match = 2x', inline: true },
        { name: 'New Balance', value: `$${newBalance.toLocaleString()}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
