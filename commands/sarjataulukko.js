const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { version } = require('../package.json');
const { getDriverStandings, getConstructorStandings } = require('../logic/f1api.js');
const currentYear = new Date().getFullYear();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sarjataulukko')
        .setDescription('Hae F1 sarjataulukko!')
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
        let year = interaction.options.getInteger('vuosi');
        if (year == null) {
            year = currentYear;
        }
        
        if (championship === 'k') {
            const standings = await getDriverStandings(year);

            if (standings.length === 0) {
                await interaction.editReply(`Tuloksia kaudelle ${year} ei ole saatavilla.`);
            }
            else {
                const rows = standings.map(d => {
                const pos = (d.position ?? d.positionText ?? '-').padEnd(5);
                const name = (d.Driver.givenName + ' ' + d.Driver.familyName).padEnd(30);
                const pts = d.points.padStart(4).padEnd(10);
                const wins = d.wins.padStart(4).padEnd(10);
                const teams = d.Constructors.map(c => {
                    const team = c.name;
                    return ` ${team}`;
                });

                    return `${pos}${name}${pts}${wins}${teams}`;
                });

                await interaction.editReply(
                    '```text\n' + 'Kuljettajien mestaruus kaudella ' + year + '\n\n' +
                    '#    Kuljettaja                    Pisteet    Voitot    Talli\n' +
                    rows.join('\n') +
                    '\n```'
                );
            }
        }
        else if (championship === 't') {
            const standings = await getConstructorStandings(year);

            if (standings.length === 0) {
                await interaction.editReply(`Tuloksia kaudelle ${year} ei ole saatavilla.`);
            }
            else {
                const rows = standings.map(c => {
                const pos = (c.position ?? c.positionText ?? '-').padEnd(5);
                const name = c.Constructor.name.padEnd(18);
                const pts = c.points.padStart(4).padEnd(10);
                const wins = c.wins.padStart(4);

                    return `${pos}${name}${pts}${wins}`;
                });

                await interaction.editReply(
                    '```text\n' + 'Valmistajien mestaruus kaudella ' + year + '\n\n' +
                    '#    Talli             Pisteet    Voitot\n' +
                    rows.join('\n') +
                    '\n```'
                );
            }
        }
    },
};