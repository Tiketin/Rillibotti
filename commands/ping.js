const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Yhteyskokeilu vasteajoilla!'),

    async execute(interaction) {
        const start = Date.now();

        await interaction.reply({
            content: 'Pinging...',
            flags: MessageFlags.Ephemeral
        });

        const pingTime = Date.now() - start;

        await interaction.editReply({
            content: `Rillibotin versio: ${version}\nVasteajat:\n\tRillibotti: ${pingTime}ms\n\tWebsocket: ${Math.round(interaction.client.ws.ping)}ms`,
        });
    },
};