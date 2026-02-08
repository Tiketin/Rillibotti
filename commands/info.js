import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import pkg from '../package.json' with { type: 'json' };
const { version } = pkg;

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Tietoa Rillibotista.'),

    async execute(interaction) {
        console.log('/info');
        const start = Date.now();

        await interaction.reply({
            content: 'Pinging...',
            flags: MessageFlags.Ephemeral
        });

        const pingTime = Date.now() - start;

        await interaction.editReply({
            content: `Rillibotin versio: ${version}\n\n`+
            `Komennot:\n\t**/tulokset**\n\t\tHakee rajapinnasta joko **kuljettajien** tai **tallien** pistetilanteen.\n\t\t**vuosi**-parametrillä voi hakea aiempia vuosia.\n\n\t`+
            `**/tiiviit-tulokset**\n\t\tYksinkertaistetut tulokset kännykän näytölle sopivammin.\n\n\t`+
            `**/liitytalliin**\n\t\tVoit liittyä haluamaasi **talliin** antamalla **tallin** nimen.\n\n\t**/info**\n\t\tTietoa Rillibotista.\n\n`+
            `Vasteajat:\n\tRillibotti: ${pingTime}ms\n\tWebsocket: ${Math.round(interaction.client.ws.ping)}ms`,
        });
    },
};