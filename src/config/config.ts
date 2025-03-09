// src/config/config.ts
export const config = {
    prefix: '!',
    botName: 'Harmony',
    defaultCity: 'Istanbul',
    botColor: 0x2ecc71, // Hexadecimal renk, # olmadan sayısal formatta
    prayerApiUrl: 'https://api.aladhan.com/v1/timingsByCity', // Yedek API
    collectApiUrl: 'https://api.collectapi.com/pray/single', // Tercih edilen API
    notificationCronInterval: '*/1 * * * *', // Her dakika kontrol et
    maxRemindersPerUser: 5,
    defaultReminderTime: 30, // Dakika
    timeFormat: 'HH:mm',
    dateFormat: 'DD.MM.YYYY',
    embedFooter: '🌙 Hayırlı Ramazanlar',
    
    // Otomatik iftar duyuruları için ayarlar
    iftarAnnouncements: {
      enabled: true, // Duyuruları etkinleştir/devre dışı bırak
      channelId: process.env.IFTAR_ANNOUNCEMENT_CHANNEL_ID || '', // İftar duyurularının gönderileceği kanal ID'si
      checkInterval: '*/1 * * * *', // Kontrol sıklığı (her dakika)
      cityList: [
        'Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 
        'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 
        'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 
        'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 
        'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 
        'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 
        'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 
        'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 
        'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 
        'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 
        'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 
        'Kilis', 'Osmaniye', 'Düzce'
      ]
    },
    
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/iftarbot',
      collectApiKey: process.env.COLLECTAPI_KEY || '',
    }
  };