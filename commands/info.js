import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import pkg from '../package.json' with { type: 'json' };
import { isDebugEnabled } from '../logic/configuration.js';
import { logCommand } from '../logic/logger.js';
const { version } = pkg;

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Tietoa Rillibotista.'),

    async execute(interaction) {
        logCommand(interaction, '/info');
        const start = Date.now();

        await interaction.reply({
            content: 'Pinging...',
            flags: MessageFlags.Ephemeral
        });

        const pingTime = Date.now() - start;

        if(isDebugEnabled) {
            const timestamp = new Date().toLocaleString();
            await interaction.editReply({
                content: `Rillibotin versio: ${version}\n\n`+
                `Palvelimen aikaleima: ${timestamp}\n\n` +
                `Vasteajat:\n\tRillibotti: ${pingTime}ms\n\tWebsocket: ${Math.round(interaction.client.ws.ping)}ms`,
            });
        } else {
            await interaction.editReply({
                content: `Rillibotin versio: ${version}\n\n`+
                `Komennot:\n\t**/tulokset**\n\t\tHakee rajapinnasta joko **kuljettajien** tai **tallien** pistetilanteen.\n\t\t**vuosi**-parametrillä voi hakea aiempia vuosia.\n\n\t`+
                `**/tiiviit-tulokset**\n\t\tYksinkertaistetut tulokset kännykän näytölle sopivammin.\n\n\t`+
                `**/liitytalliin**\n\t\tVoit liittyä haluamaasi **talliin** antamalla **tallin** nimen.\n\n\t**/info**\n\t\tTietoa Rillibotista.\n\n`+
                `Vasteajat:\n\tRillibotti: ${pingTime}ms\n\tWebsocket: ${Math.round(interaction.client.ws.ping)}ms`,
            });
        }

        
    },
};