import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { config } from '../config/config';

export const createEmbed = (
  title: string,
  description: string,
  fields?: { name: string; value: string; inline?: boolean }[]
): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor(config.botColor as ColorResolvable)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: config.embedFooter })
    .setTimestamp();

  if (fields && fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
};