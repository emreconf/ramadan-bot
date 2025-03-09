export interface ReminderSetting {
    reminderId: string;
    userId: string;
    guildId: string;
    channelId: string;
    city: string;
    minutesBefore: number;
    isActive: boolean;
    type: 'iftar' | 'sahur';
    createdAt?: Date;
  }