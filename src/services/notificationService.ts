import { Client, TextChannel, EmbedBuilder, ColorResolvable } from 'discord.js';
import cron from 'node-cron';
import dayjs from 'dayjs';
import { config } from '../config/config';
import { PrayerTimeService } from './prayerTimeService';
import ReminderModel from '../database/models/reminderModel';
import { logger } from '../utils/logger';

export class NotificationService {
  private static instance: NotificationService;
  private client: Client;
  private prayerService: PrayerTimeService;
  private cronJob: cron.ScheduledTask | null = null;

  private constructor(client: Client) {
    this.client = client;
    this.prayerService = PrayerTimeService.getInstance();
  }

  public static getInstance(client: Client): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(client);
    }
    return NotificationService.instance;
  }

  public startNotificationService(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }

    this.cronJob = cron.schedule(config.notificationCronInterval, async () => {
      try {
        const now = dayjs();
        const reminders = await ReminderModel.find({ isActive: true });

        for (const reminder of reminders) {
          try {
            const targetTime = reminder.type === 'iftar' 
              ? await this.prayerService.getIftarTime(reminder.city)
              : await this.prayerService.getSahurTime(reminder.city);
            
            const [hours, minutes] = targetTime.split(':');
            const targetDate = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
            
            const reminderTime = targetDate.subtract(reminder.minutesBefore, 'minute');
            
            if (now.hour() === reminderTime.hour() && now.minute() === reminderTime.minute()) {
              await this.sendNotification(reminder);
            }
          } catch (error) {
            logger.error(`Hatırlatıcı işlenirken hata: ${error}`);
          }
        }
      } catch (error) {
        logger.error(`Bildirim servisi çalışırken hata: ${error}`);
      }
    });
    
    logger.info('Bildirim servisi başlatıldı');
  }

  private async sendNotification(reminder: any): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(reminder.guildId);
      if (!guild) return;

      const channel = guild.channels.cache.get(reminder.channelId) as TextChannel;
      if (!channel) return;

      const type = reminder.type === 'iftar' ? 'İftar' : 'Sahur';
      const targetTime = reminder.type === 'iftar'
        ? await this.prayerService.getIftarTime(reminder.city)
        : await this.prayerService.getSahurTime(reminder.city);

      const embed = new EmbedBuilder()
        .setColor(config.botColor as ColorResolvable)
        .setTitle(`🔔 ${type} Vakti Hatırlatıcı`)
        .setDescription(`<@${reminder.userId}>, ${reminder.city} için ${type} vaktine **${reminder.minutesBefore} dakika** kaldı!`)
        .addFields(
          { name: 'Vakit', value: targetTime, inline: true },
          { name: 'Şehir', value: reminder.city, inline: true }
        )
        .setFooter({ text: config.embedFooter })
        .setTimestamp();

      await channel.send({ 
        content: `<@${reminder.userId}>`,
        embeds: [embed] 
      });
      
      logger.info(`${reminder.userId} kullanıcısına ${type} hatırlatıcısı gönderildi`);
    } catch (error) {
      logger.error(`Bildirim gönderilirken hata: ${error}`);
    }
  }
}