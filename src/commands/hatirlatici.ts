// src/commands/hatirlatici.ts
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import ReminderModel from '../database/models/reminderModel';
import { config } from '../config/config';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hatirlatici')
    .setDescription('İftar ve sahur hatırlatıcı ayarları')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ekle')
        .setDescription('Yeni bir hatırlatıcı ekler')
        .addStringOption(option =>
          option.setName('tip')
            .setDescription('Hatırlatıcı tipi')
            .setRequired(true)
            .addChoices(
              { name: 'İftar', value: 'iftar' },
              { name: 'Sahur', value: 'sahur' }
            ))
        .addStringOption(option =>
          option.setName('şehir')
            .setDescription('Vaktin hesaplanacağı şehir')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('dakika')
            .setDescription('Vakitten kaç dakika önce hatırlatılsın')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(180)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('listele')
        .setDescription('Tüm hatırlatıcılarınızı listeler'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('sil')
        .setDescription('Bir hatırlatıcıyı siler')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('Silinecek hatırlatıcının ID\'si')
            .setRequired(true))),
  
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    
    const options = interaction.options as any;
    const subcommand = options.getSubcommand();
    
    if (subcommand === 'ekle') {
      await handleAddReminder(interaction);
    } else if (subcommand === 'listele') {
      await handleListReminders(interaction);
    } else if (subcommand === 'sil') {
      await handleDeleteReminder(interaction);
    }
  },
};

async function handleAddReminder(interaction: CommandInteraction) {
  const options = interaction.options as any;
  const type = options.getString('tip') as 'iftar' | 'sahur';
  const city = options.getString('şehir') as string;
  const minutesBefore = options.getInteger('dakika') as number;
  
  try {
    const userRemindersCount = await ReminderModel.countDocuments({
      userId: interaction.user.id
    });
    
    if (userRemindersCount >= config.maxRemindersPerUser) {
      await interaction.editReply(`En fazla ${config.maxRemindersPerUser} hatırlatıcı ekleyebilirsiniz. Yeni bir hatırlatıcı eklemek için önce bazılarını silin.`);
      return;
    }
    
    const reminder = new ReminderModel({
      reminderId: uuidv4().slice(0, 8),
      userId: interaction.user.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      city: city,
      minutesBefore: minutesBefore,
      isActive: true,
      type: type
    });
    
    await reminder.save();
    
    const typeText = type === 'iftar' ? 'İftar' : 'Sahur';
    
    const embed = new EmbedBuilder()
      .setColor(config.botColor as ColorResolvable)
      .setTitle('✅ Hatırlatıcı Eklendi')
      .setDescription(`${city} şehri için ${typeText} vaktine ${minutesBefore} dakika kala hatırlatıcı ayarlandı.`)
      .addFields(
        { name: 'Hatırlatıcı ID', value: reminder.reminderId, inline: true }, // id -> reminderId
        { name: 'Hatırlatıcı Tipi', value: typeText, inline: true }
      )
      .setFooter({ text: `ID'yi not alın, hatırlatıcıyı silmek için lazım olacak.` })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply('Hatırlatıcı eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}

async function handleListReminders(interaction: CommandInteraction) {
  try {
    const reminders = await ReminderModel.find({
      userId: interaction.user.id
    });
    
    if (reminders.length === 0) {
      await interaction.editReply('Henüz bir hatırlatıcı eklemediniz.');
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.botColor as ColorResolvable)
      .setTitle('📋 Hatırlatıcılarınız')
      .setDescription(`Toplam ${reminders.length} hatırlatıcı bulundu.`)
      .setFooter({ text: config.embedFooter })
      .setTimestamp();
    
    reminders.forEach((reminder, index) => {
      const typeText = reminder.type === 'iftar' ? 'İftar' : 'Sahur';
      embed.addFields({
        name: `${index + 1}. ${typeText} Hatırlatıcısı (ID: ${reminder.reminderId})`, // id -> reminderId
        value: `🏙️ **Şehir:** ${reminder.city}\n⏱️ **Dakika Önce:** ${reminder.minutesBefore}\n📊 **Durum:** ${reminder.isActive ? 'Aktif' : 'Pasif'}`
      });
    });
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply('Hatırlatıcılar listelenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}

async function handleDeleteReminder(interaction: CommandInteraction) {
  const options = interaction.options as any;
  const reminderId = options.getString('id');
  
  try {
    const reminder = await ReminderModel.findOne({
      reminderId: reminderId,
      userId: interaction.user.id
    });
    
    if (!reminder) {
      await interaction.editReply(`ID'si ${reminderId} olan bir hatırlatıcı bulunamadı veya bu hatırlatıcı size ait değil.`);
      return;
    }
    
    await reminder.deleteOne();
    
    const typeText = reminder.type === 'iftar' ? 'İftar' : 'Sahur';
    
    const embed = new EmbedBuilder()
      .setColor(config.botColor as ColorResolvable)
      .setTitle('🗑️ Hatırlatıcı Silindi')
      .setDescription(`${reminder.city} şehri için ${typeText} hatırlatıcısı başarıyla silindi.`)
      .setFooter({ text: config.embedFooter })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply('Hatırlatıcı silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}