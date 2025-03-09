import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import dayjs from 'dayjs';
import { PrayerTimeService } from '../services/prayerTimeService';
import { config } from '../config/config';
import { timeCalculator } from '../utils/timeCalculator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('iftar')
    .setDescription('Belirtilen şehir için iftar vaktini gösterir')
    .addStringOption(option =>
      option.setName('şehir')
        .setDescription('İftar vaktini öğrenmek istediğiniz şehir')
        .setRequired(false)),
  
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    
    const options = interaction.options as any;
    const city = options.getString('şehir') || config.defaultCity;
    const prayerService = PrayerTimeService.getInstance();
    
    try {
      const iftarTime = await prayerService.getIftarTime(city);
      const timeRemaining = timeCalculator.getTimeUntil(iftarTime);
      
      const embed = new EmbedBuilder()
        .setColor(config.botColor as ColorResolvable)
        .setTitle(`🌙 ${city} İftar Vakti`)
        .setDescription(`Bugün ${city} için iftar vakti: **${iftarTime}**`)
        .addFields(
          { name: 'Kalan Süre', value: timeRemaining, inline: true },
          { name: 'Tarih', value: dayjs().format(config.dateFormat), inline: true }
        )
        .setFooter({ text: config.embedFooter })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply(`Bir hata oluştu: ${city} şehri için iftar vakti alınamadı. Şehir adını kontrol ediniz.`);
    }
  },
};