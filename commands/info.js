const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Tietoa Rillibotista.'),

    async execute(interaction) {
        const start = Date.now();

        await interaction.reply({
            content: 'Pinging...',
            flags: MessageFlags.Ephemeral
        });

        const pingTime = Date.now() - start;

        await interaction.editReply({
            content: `Rillibotin versio: ${version}\n\n`+
            `Komennot:\n\t**/sarjataulukko**\n\t\tHakee rajapinnasta joko **kuljettajien** tai **tallien** pistetilanteen.\n\t\t**vuosi**-parametrillä voi hakea aiempia vuosia.\n\n\t`+
            `**/liitytalliin**\n\t\tVoit liittyä haluamaasi **talliin** antamalla **tallin** nimen.\n\n\t**/info**\n\t\tTietoa Rillibotista.\n\n`+
            `Vasteajat:\n\tRillibotti: ${pingTime}ms\n\tWebsocket: ${Math.round(interaction.client.ws.ping)}ms`,
        });
    },
};