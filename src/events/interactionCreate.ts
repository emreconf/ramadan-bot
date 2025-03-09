import { Interaction } from 'discord.js';
import { logger } from '../utils/logger';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const command = (interaction.client as any).commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Komut çalıştırılırken hata: ${error}`);
      const errorMessage = 'Bu komutu çalıştırırken bir hata oluştu!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};