import { Client } from 'discord.js';
import { logger } from '../utils/logger';
import { NotificationService } from '../services/notificationService';
import { IftarAnnouncementService } from '../services/iftarAnnouncementService';

module.exports = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    logger.info(`Bot hazır! ${client.user?.tag} olarak giriş yapıldı`);
    
    const notificationService = NotificationService.getInstance(client);
    notificationService.startNotificationService();
    
    const iftarAnnouncementService = IftarAnnouncementService.getInstance(client);
    iftarAnnouncementService.startAnnouncementService();
  },
};