import { Client, TextChannel, EmbedBuilder, ColorResolvable } from 'discord.js';
import cron from 'node-cron';
import dayjs from 'dayjs';
import { config } from '../config/config';
import { PrayerTimeService } from './prayerTimeService';
import { logger } from '../utils/logger';


export class IftarAnnouncementService {
  private static instance: IftarAnnouncementService;
  private client: Client;
  private prayerService: PrayerTimeService;
  private cronJob: cron.ScheduledTask | null = null;
  
  private cityIftarTimes: Map<string, { time: string, announced: boolean }> = new Map();
  
  private cityEmojis: Map<string, string> = new Map();
  private cityImages: Map<string, string> = new Map();
  
  private lastApiCheck: Date = new Date(0);
  private readonly API_CHECK_INTERVAL = 60 * 60 * 1000;

  private constructor(client: Client) {
    this.client = client;
    this.prayerService = PrayerTimeService.getInstance();
    this.loadCityData();
  }

  public static getInstance(client: Client): IftarAnnouncementService {
    if (!IftarAnnouncementService.instance) {
      IftarAnnouncementService.instance = new IftarAnnouncementService(client);
    }
    return IftarAnnouncementService.instance;
  }


  private loadCityData(): void {
    this.cityEmojis.set('İstanbul', '🌉');
    this.cityEmojis.set('Ankara', '🏛️');
    this.cityEmojis.set('İzmir', '🌊');
    this.cityEmojis.set('Bursa', '🏔️');
    this.cityEmojis.set('Antalya', '🏖️');
    this.cityEmojis.set('Adana', '🌶️');
    this.cityEmojis.set('Konya', '🕌');
    this.cityEmojis.set('Trabzon', '🏞️');
    
    this.cityImages.set('İstanbul', 'https://i.imgur.com/example1.jpg');
    this.cityImages.set('Ankara', 'https://i.imgur.com/example2.jpg');
  }


  private shouldResetData(): boolean {
    const today = dayjs().format('YYYY-MM-DD');
    
    if (this.cityIftarTimes.size === 0) {
      return false;
    }
    
    const firstEntry = this.cityIftarTimes.values().next().value;
    if (!firstEntry) {
      return false;
    }
    
    return !firstEntry.time.includes(today);
  }


  private async loadCityIftarTimes(): Promise<void> {
    const now = new Date();
    const today = dayjs().format('YYYY-MM-DD');
    
    if (now.getTime() - this.lastApiCheck.getTime() >= this.API_CHECK_INTERVAL || 
        this.cityIftarTimes.size === 0) {
        
      logger.info('Tüm şehirler için iftar vakitleri yükleniyor...');
      
      if (this.shouldResetData()) {
        this.cityIftarTimes.clear();
        logger.info('Yeni gün başladı, iftar duyuru bilgileri sıfırlandı');
      }
      
      for (const city of config.iftarAnnouncements.cityList) {
        try {
          if (this.cityIftarTimes.has(city)) {
            continue;
          }
          
          const iftarTime = await this.prayerService.getIftarTime(city);
          this.cityIftarTimes.set(city, { time: iftarTime, announced: false });
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          logger.error(`${city} için iftar vakti alınırken hata: ${error}`);
        }
      }
      
      this.lastApiCheck = now;
      logger.info(`${this.cityIftarTimes.size} şehir için iftar vakitleri yüklendi`);
    }
  }


  public async startAnnouncementService(): Promise<void> {
    if (!config.iftarAnnouncements.enabled) {
      logger.info('İftar duyuru servisi devre dışı bırakıldı');
      return;
    }
    
    if (this.cronJob) {
      this.cronJob.stop();
    }
    
    await this.loadCityIftarTimes();

    this.cronJob = cron.schedule(config.iftarAnnouncements.checkInterval, async () => {
      try {
        await this.loadCityIftarTimes();
        
        const now = dayjs();
        const currentHour = now.hour();
        const currentMinute = now.minute();
        
        for (const [city, iftarData] of this.cityIftarTimes.entries()) {
          if (iftarData.announced) {
            continue;
          }
          
          const [iftarHour, iftarMinute] = iftarData.time.split(':').map(Number);
          
          if (currentHour === iftarHour && currentMinute === iftarMinute) {
            await this.announceIftarTime(city, iftarData.time);
            this.cityIftarTimes.set(city, { ...iftarData, announced: true });
          }
        }
      } catch (error) {
        logger.error(`İftar duyuru servisi çalışırken hata: ${error}`);
      }
    });
    
    logger.info('İftar duyuru servisi başlatıldı');
  }


  private async announceIftarTime(city: string, iftarTime: string): Promise<void> {
    try {
      const channelId = config.iftarAnnouncements.channelId;
      const channel = await this.client.channels.fetch(channelId) as TextChannel;
      
      if (!channel) {
        logger.error(`Duyuru kanalı bulunamadı: ${channelId}`);
        return;
      }
      
      const emoji = this.cityEmojis.get(city) || '🕌';
      
      const imageUrl = this.cityImages.get(city);
      
      const embed = new EmbedBuilder()
        .setColor(config.botColor as ColorResolvable)
        .setTitle(`${emoji} ${city} İftar Vakti ${emoji}`)
        .setDescription(`**${city}** için iftar vakti geldi!\n\n**${iftarTime}** itibariyle oruçlar açılabilir.\n\nHayırlı iftarlar, Allah kabul etsin.`)
        .setFooter({ text: `${config.embedFooter} | ${dayjs().format(config.dateFormat)}` })
        .setTimestamp();
      
      if (imageUrl) {
        embed.setImage(imageUrl);
      }
      
      await channel.send({ embeds: [embed] });
      logger.info(`${city} için iftar duyurusu yapıldı - ${iftarTime}`);
    } catch (error) {
      logger.error(`İftar duyurusu yapılırken hata: ${error}`);
    }
  }
}