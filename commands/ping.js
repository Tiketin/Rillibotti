const { SlashCommandBuilder } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Yhteyskokeilu vasteajoilla!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const pingTime = sent.createdTimestamp - interaction.createdTimestamp;
        
        await interaction.editReply(`Rillibotin versio: ${version}\nVasteajat:\n\tRillibotti: ${pingTime}ms\n\tWebsocket: ${Math.round(interaction.client.ws.ping)}ms`);
    },
};