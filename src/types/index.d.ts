import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface PrayerTime {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface ReminderSetting {
  id: string;
  userId: string;
  guildId: string;
  channelId: string;
  city: string;
  minutesBefore: number;
  isActive: boolean;
  type: 'iftar' | 'sahur';
}