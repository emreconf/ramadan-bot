import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import dayjs from 'dayjs';
import { PrayerTimeService } from '../services/prayerTimeService';
import { config } from '../config/config';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vakit')
    .setDescription('Belirtilen şehir için günlük namaz vakitlerini gösterir')
    .addStringOption(option =>
      option.setName('şehir')
        .setDescription('Namaz vakitlerini öğrenmek istediğiniz şehir')
        .setRequired(false)),
  
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    
    const options = interaction.options as any;
    const city = options.getString('şehir') || config.defaultCity;
    const prayerService = PrayerTimeService.getInstance();
    
    try {
      const prayerTimes = await prayerService.getPrayerTimes(city);
      
      const embed = new EmbedBuilder()
        .setColor(config.botColor as ColorResolvable)
        .setTitle(`📿 ${city} Namaz Vakitleri`)
        .setDescription(`${dayjs().format(config.dateFormat)} tarihine ait namaz vakitleri`)
        .addFields(
          { name: 'İmsak (Sahur)', value: prayerTimes.fajr, inline: true },
          { name: 'Güneş', value: prayerTimes.sunrise, inline: true },
          { name: 'Öğle', value: prayerTimes.dhuhr, inline: true },
          { name: 'İkindi', value: prayerTimes.asr, inline: true },
          { name: 'Akşam (İftar)', value: prayerTimes.maghrib, inline: true },
          { name: 'Yatsı', value: prayerTimes.isha, inline: true }
        )
        .setFooter({ text: config.embedFooter })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply(`Bir hata oluştu: ${city} şehri için namaz vakitleri alınamadı. Şehir adını kontrol ediniz.`);
    }
  },
};