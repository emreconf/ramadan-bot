import axios from 'axios';
import dayjs from 'dayjs';
import { config } from '../config/config';
import { PrayerTime } from '../types';
import { logger } from '../utils/logger';

export class PrayerTimeService {
  private static instance: PrayerTimeService;
  private cache: Map<string, { data: PrayerTime, timestamp: number }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;
  private readonly DEBUG_MODE = process.env.NODE_ENV === 'development' && process.env.DEBUG_API === 'true';
  
  private lastRequestTime: number = 0;
  private readonly REQUEST_DELAY = 500; // 500ms
  
  private readonly API_URL = 'https://api.collectapi.com/pray/single';
  private readonly API_KEY = process.env.COLLECTAPI_KEY || '';

  private constructor() {}

  public static getInstance(): PrayerTimeService {
    if (!PrayerTimeService.instance) {
      PrayerTimeService.instance = new PrayerTimeService();
    }
    return PrayerTimeService.instance;
  }


  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const waitTime = this.REQUEST_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  public async getPrayerTimes(city: string, date?: string): Promise<PrayerTime> {
    const formattedDate = date || dayjs().format('DD.MM.YYYY');
    const cacheKey = `${city}-${formattedDate}`;
    
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < this.CACHE_TTL)) {
      if (this.DEBUG_MODE) {
        logger.debug(`Önbellekten ${city} için namaz vakitleri alındı`);
      }
      return cachedData.data;
    }

    try {
      await this.rateLimit();
      
      if (!this.API_KEY || this.API_KEY.trim() === '') {
        if (this.DEBUG_MODE) {
          logger.debug('CollectAPI key tanımlanmamış, yedek API kullanılacak');
        }
        throw new Error('CollectAPI key tanımlanmamış');
      }
      
      if (this.DEBUG_MODE) {
        logger.debug(`CollectAPI isteği gönderiliyor: Şehir=${city}, Tarih=${formattedDate}`);
      }
      
      const response = await axios.get(this.API_URL, {
        params: {
          date: formattedDate,
          city: city
        },
        headers: {
          'content-type': 'application/json',
          'authorization': `apikey ${this.API_KEY}`
        }
      });

      if (response.status === 200 && response.data.result) {
        const result = response.data.result;
        
        const prayerTime: PrayerTime = {
          fajr: result.fajr,
          sunrise: result.sunrise,
          dhuhr: result.dhuhr,
          asr: result.asr,
          maghrib: result.maghrib,
          isha: result.isha,
          date: formattedDate
        };
        
        this.cache.set(cacheKey, { data: prayerTime, timestamp: Date.now() });
        
        if (this.DEBUG_MODE) {
          logger.debug(`CollectAPI'den ${city} için namaz vakitleri başarıyla alındı`);
        }
        
        return prayerTime;
      } else {
        throw new Error(`API'den geçersiz yanıt alındı: ${response.status}`);
      }
    } catch (error: any) {
      if (this.DEBUG_MODE) {
        logger.debug(`CollectAPI'den namaz vakitleri alınırken hata: ${error.message}`);
      }
      
      try {
        if (this.DEBUG_MODE) {
          logger.debug(`Yedek API kullanılıyor: ${city}`);
        }
        
        await this.rateLimit();
        
        return await this.getPrayerTimesFromBackupAPI(city, date);
      } catch (backupError: any) {
        if (this.DEBUG_MODE) {
          logger.debug(`Yedek API de başarısız oldu: ${backupError.message}`);
        }
        throw new Error(`Namaz vakitleri alınamadı: ${backupError.message}`);
      }
    }
  }


  private async getPrayerTimesFromBackupAPI(city: string, date?: string): Promise<PrayerTime> {
    const formattedDate = date ? date : dayjs().format('DD-MM-YYYY');
    
    try {
      const response = await axios.get(config.prayerApiUrl, {
        params: {
          city,
          country: 'Turkey',
          method: 13,
          date: formattedDate
        }
      });

      if (response.data.code === 200 && response.data.data) {
        const timings = response.data.data.timings;
        const prayerTime: PrayerTime = {
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
          date: formattedDate
        };
        
        const cacheKey = `${city}-${formattedDate}`;
        this.cache.set(cacheKey, { data: prayerTime, timestamp: Date.now() });
        
        if (this.DEBUG_MODE) {
          logger.debug(`Yedek API'den ${city} için namaz vakitleri başarıyla alındı`);
        }
        
        return prayerTime;
      } else {
        throw new Error('Yedek API\'den geçerli veri alınamadı');
      }
    } catch (error: any) {
      if (this.DEBUG_MODE) {
        logger.debug(`Yedek API'den veri alınırken hata: ${error.message}`);
      }
      
      const now = dayjs();
      const defaultPrayerTime: PrayerTime = {
        fajr: "05:00",
        sunrise: "06:30",
        dhuhr: "13:00",
        asr: "16:30",
        maghrib: "19:30",
        isha: "21:00",
        date: formattedDate
      };
      
      if (this.DEBUG_MODE) {
        logger.debug(`${city} için varsayılan namaz vakitleri kullanılıyor`);
      }
      
      return defaultPrayerTime;
    }
  }

  public async getIftarTime(city: string, date?: string): Promise<string> {
    try {
      const prayerTimes = await this.getPrayerTimes(city, date);
      return prayerTimes.maghrib;
    } catch (error) {
      if (this.DEBUG_MODE) {
        logger.debug(`İftar vakti alınırken hata: ${error}`);
      }
      return "19:30";
    }
  }

  public async getSahurTime(city: string, date?: string): Promise<string> {
    try {
      const prayerTimes = await this.getPrayerTimes(city, date);
      return prayerTimes.fajr;
    } catch (error) {
      if (this.DEBUG_MODE) {
        logger.debug(`Sahur vakti alınırken hata: ${error}`);
      }
      return "05:00";
    }
  }
}