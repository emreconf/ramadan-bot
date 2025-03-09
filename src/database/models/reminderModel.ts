import mongoose, { Schema, Document } from 'mongoose';
import { ReminderSetting } from '../../types';

export interface IReminder extends Omit<Document, 'id'>, Omit<ReminderSetting, 'id'> {
  reminderId: string;
}

const ReminderSchema: Schema = new Schema({
  reminderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  city: { type: String, required: true },
  minutesBefore: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['iftar', 'sahur'], default: 'iftar' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReminder>('Reminder', ReminderSchema);