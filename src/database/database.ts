import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const dbUri = process.env.MONGODB_URI || '';
    await mongoose.connect(dbUri);
    logger.info('Veritabanı bağlantısı başarılı');
  } catch (error) {
    logger.error('Veritabanı bağlantısı başarısız:', error);
    process.exit(1);
  }
};