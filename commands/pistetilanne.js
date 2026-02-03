const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { version } = require('../package.json');
const { getDriverStandings } = require('../logic/f1api.js');
const currentYear = new Date().getFullYear();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pistetilanne')
        .setDescription('Hae F1 pistetilanne!')
        .addStringOption(option => {
            option.setName('mestaruus')
            .setDescription('Valitse kumman sarjataulukon haluat nähdä!')
            .setRequired(true);

            option.addChoices({ name: 'kuljettajat', value: 'k' });
            option.addChoices({ name: 'tallit', value: 't' });
            return option;            
        })
        .addIntegerOption(option => {
            option.setName('vuosi')
            .setDescription('Valitse minkä vuoden tulokset haluat nähdä!')
            .setMinValue(1950)
            .setMaxValue(currentYear)
            return option;
        }),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const championship = interaction.options.getString('mestaruus');
        const year = interaction.options.getInteger('vuosi');
        
        if (championship === 'k') {
            const standings = await getDriverStandings(year);

            const rows = standings.map(d => {
                const pos = (d.position ?? d.positionText ?? '-').padEnd(5);
                const name = d.Driver.familyName.padEnd(16);
                const pts = d.points.padStart(4);

                return `${pos}${name}${pts}`;
            });

            await interaction.editReply(
                '```text\n' + 'Kuljettajien mestaruus kaudella ' + year + '\n\n' +
                '#    Kuljettaja       Pisteet\n' +
                rows.join('\n') +
                '\n```'
            );

        }
        else if (championship === 't') {
            return interaction.reply({
                content: `TALLIT!`,
                flags: MessageFlags.Ephemeral
            });
        }
    },
};