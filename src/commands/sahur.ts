import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import dayjs from 'dayjs';
import { PrayerTimeService } from '../services/prayerTimeService';
import { config } from '../config/config';
import { timeCalculator } from '../utils/timeCalculator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sahur')
    .setDescription('Belirtilen şehir için sahur (imsak) vaktini gösterir')
    .addStringOption(option =>
      option.setName('şehir')
        .setDescription('Sahur vaktini öğrenmek istediğiniz şehir')
        .setRequired(false)),
  
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    
    const options = interaction.options as any;
    const city = options.getString('şehir') || config.defaultCity;
    const prayerService = PrayerTimeService.getInstance();
    
    try {
      const sahurTime = await prayerService.getSahurTime(city);
      
      // Eğer şu anki saat sahur vaktini geçmişse, ertesi günün vaktini göster
      const now = dayjs();
      const [hours, minutes] = sahurTime.split(':');
      const sahurDateTime = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
      
      let timeRemaining = '';
      let displayDate = dayjs().format(config.dateFormat);
      
      if (now.isAfter(sahurDateTime)) {
        // Yarının sahur vaktini al
        const tomorrow = dayjs().add(1, 'day').format('DD-MM-YYYY');
        const tomorrowSahurTime = await prayerService.getSahurTime(city, tomorrow);
        timeRemaining = timeCalculator.getTimeUntil(tomorrowSahurTime);
        displayDate = dayjs().add(1, 'day').format(config.dateFormat);
      } else {
        timeRemaining = timeCalculator.getTimeUntil(sahurTime);
      }
      
      const embed = new EmbedBuilder()
        .setColor(config.botColor as ColorResolvable)
        .setTitle(`🌙 ${city} Sahur (İmsak) Vakti`)
        .setDescription(`${displayDate} tarihinde ${city} için sahur vakti: **${sahurTime}**`)
        .addFields(
          { name: 'Kalan Süre', value: timeRemaining, inline: true },
          { name: 'Tarih', value: displayDate, inline: true }
        )
        .setFooter({ text: config.embedFooter })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply(`Bir hata oluştu: ${city} şehri için sahur vakti alınamadı. Şehir adını kontrol ediniz.`);
    }
  },
};