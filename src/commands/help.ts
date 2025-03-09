import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import { config } from '../config/config';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Bot komutları hakkında bilgi verir'),
  
  async execute(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(config.botColor as ColorResolvable)
      .setTitle(`📝 ${config.botName} Komutları`)
      .setDescription('Ramazan ayı boyunca iftar ve sahur vakitlerini takip etmenize yardımcı olur.')
      .addFields(
        { 
          name: '⏰ Vakit Komutları', 
          value: 
          '`/iftar [şehir]` - Belirtilen şehir için iftar vaktini gösterir\n' +
          '`/sahur [şehir]` - Belirtilen şehir için sahur (imsak) vaktini gösterir\n' +
          '`/vakit [şehir]` - Belirtilen şehir için tüm namaz vakitlerini gösterir'
        },
        { 
          name: '🔔 Hatırlatıcı Komutları', 
          value: 
          '`/hatirlatici ekle [tip] [şehir] [dakika]` - Yeni bir hatırlatıcı ekler\n' +
          '`/hatirlatici listele` - Tüm hatırlatıcılarınızı listeler\n' +
          '`/hatirlatici sil [id]` - Belirtilen hatırlatıcıyı siler'
        },
        { 
          name: '📚 İpuçları', 
          value: 
          '- Şehir belirtmezseniz varsayılan olarak İstanbul kullanılır\n' +
          '- Hatırlatıcı eklerken, vakit gelmeden kaç dakika önce hatırlatılacağını belirleyebilirsiniz\n' +
          '- En fazla ' + config.maxRemindersPerUser + ' hatırlatıcı ekleyebilirsiniz'
        }
      )
      .setFooter({ text: config.embedFooter })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};