import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const timeCalculator = {
  getTimeUntil(targetTime: string | undefined): string {
    if (!targetTime || typeof targetTime !== 'string' || !targetTime.includes(':')) {
      return 'Zaman bilgisi alınamadı';
    }

    const now = dayjs();
    const [hours, minutes] = targetTime.split(':');
    
    if (isNaN(Number(hours)) || isNaN(Number(minutes))) {
      return 'Geçersiz zaman formatı';
    }
    
    let target = dayjs().hour(parseInt(hours)).minute(parseInt(minutes)).second(0);
    
    if (target.isBefore(now)) {
      target = target.add(1, 'day');
    }
    
    const diff = target.diff(now);
    const durationObj = dayjs.duration(diff);
    
    const hours24 = Math.floor(durationObj.asHours());
    const minutes60 = durationObj.minutes();
    
    if (hours24 > 0) {
      return `${hours24} saat ${minutes60} dakika`;
    } else {
      return `${minutes60} dakika`;
    }
  }
};