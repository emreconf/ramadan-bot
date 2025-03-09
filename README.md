# 🌙 Discord İftar Botu

Discord İftar Botu, Ramazan ayı boyunca Türkiye'deki 81 il için iftar ve sahur vakitlerini takip eden, kullanıcılara hatırlatmalar gönderen ve otomatik duyurular yapan kapsamlı bir Discord botudur.

## ✨ Özellikler

- **Anlık Vakit Sorgulama**: İftar, sahur ve diğer namaz vakitlerini şehirlere göre sorgulama
- **Özel Hatırlatıcılar**: Kullanıcıların kendi iftar ve sahur hatırlatıcılarını ayarlayabilmeleri
- **Otomatik İftar Duyuruları**: Tüm Türkiye illeri için iftar vakitlerinde otomatik duyurular
- **Güvenilir Veri Kaynağı**: Diyanet İşleri Başkanlığı verilerine dayalı kesin ve doğru vakit bilgileri
- **Önbellekleme Sistemi**: Gereksiz API isteklerini önlemek için akıllı önbellekleme
- **Hata Toleranslı Yapı**: API hataları durumunda yedek kaynaklara geçiş yapma
- **Kolay Kurulum**: Basit Docker veya npm kurulumu ile hızlıca başlama

## 🚀 Kurulum

### Gereksinimler

- Node.js (v16.6.0 veya üstü)
- MongoDB
- Discord Bot Token

### Adımlar

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/emreconf/discord-iftar-bot.git
   cd discord-iftar-bot
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri doldurun:
   ```bash
   cp .env.example .env
   ```

4. `.env` dosyasını düzenleyin:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   APPLICATION_ID=your_application_id_here
   MONGODB_URI=
   IFTAR_ANNOUNCEMENT_CHANNEL_ID=your_channel_id_here
   COLLECTAPI_KEY=your_collectapi_key_here (isteğe bağlı)
   NODE_ENV=production
   LOG_LEVEL=info
   DEBUG_API=false
   ```

5. Slash komutlarını kaydedin:
   ```bash
   npm run deploy
   ```

6. Botu başlatın:
   ```bash
   npm run build
   npm start
   ```

### Docker ile Kurulum

Docker kullanarak botu çalıştırmak için:

```bash
docker-compose up -d
```

## 📝 Komutlar

- `/iftar [şehir]` - Belirtilen şehir için iftar vaktini gösterir
- `/sahur [şehir]` - Belirtilen şehir için sahur vaktini gösterir
- `/vakit [şehir]` - Belirtilen şehir için günlük namaz vakitlerini gösterir
- `/hatirlatici ekle [tip] [şehir] [dakika]` - İftar veya sahur vaktine belirtilen dakika kala hatırlatma ayarlar
- `/hatirlatici listele` - Ayarladığınız tüm hatırlatıcıları listeler
- `/hatirlatici sil [id]` - Belirtilen ID'ye sahip hatırlatıcıyı siler
- `/help` - Tüm komutların listesini ve açıklamalarını gösterir

## 🛠️ Özelleştirme

### İftar Duyuru Kanalı

İftar duyurularının gönderileceği kanalı belirlemek için:

1. Discord sunucunuzda bir metin kanalı oluşturun
2. Kanal ID'sini kopyalayın (Geliştirici Modu'nu açıp kanala sağ tıklayarak ID'yi kopyalayabilirsiniz)
3. `.env` dosyasındaki `IFTAR_ANNOUNCEMENT_CHANNEL_ID` değişkenine bu ID'yi yapıştırın

### Şehir Emojileri ve Görselleri

`src/services/iftarAnnouncementService.ts` dosyasındaki `loadCityData` metodunu düzenleyerek şehirlere özel emoji ve görseller ekleyebilirsiniz.

### API Tercihi

Bot, varsayılan olarak namaz vakitlerini almak için yedek API'yi kullanır. CollectAPI kullanmak isterseniz:
1. https://collectapi.com/api adresinden bir anahtar alın
2. `.env` dosyasındaki `COLLECTAPI_KEY` değişkenine bu anahtarı ekleyin

## 📊 Geliştirme

### Yeni Komut Ekleme

1. `src/commands/` dizini altında yeni bir dosya oluşturun
2. Komutu SlashCommandBuilder ile tanımlayın
3. `npm run deploy` komutunu çalıştırarak Discord'a kaydedin

### Debug Modu

Geliştirme sırasında daha fazla log görmek için:

```
DEBUG_API=true
```

değişkenini `.env` dosyasına ekleyin.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

Ramazan ayında hayırlı iftarlar ve sahurlar dileriz! 🌙
