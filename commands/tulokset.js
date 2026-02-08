import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getDriverStandings, getConstructorStandings } from '../logic/f1api.js';
const currentYear = new Date().getFullYear();

export default {
    data: new SlashCommandBuilder()
        .setName('tulokset')
        .setDescription('Hae tulokset kaudelle...')
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
            console.log('/tulokset, kuljettajat, ' + year);
            const standings = await getDriverStandings(year);

            if (standings.length === 0) {
                await interaction.editReply(`Tuloksia kaudelle ${year} ei ole saatavilla.`);
            }
            else {
                const driverStandings = standings.DriverStandings;
                const header = 'Kuljettajien mestaruus kaudella ' + year + ', osakilpailuja '+standings.round + '\n\n' +
                    '#   Kuljettaja                    Pisteet    Voitot    Talli\n\n';

                const rows = driverStandings.map(d => {
                let pos = (d.position ?? d.positionText ?? '-');
                if (pos !== '-') {
                    pos = pos + '.';
                }
                pos = pos.padEnd(4);
                const name = (d.Driver.givenName + ' ' + d.Driver.familyName).padEnd(30);
                const pts = d.points.padStart(6).padEnd(10);
                const wins = d.wins.padStart(5).padEnd(10);
                const teams = d.Constructors.map(c => {
                    const team = c.name;
                    return ` ${team}`;
                });

                    return `${pos}${name}${pts}${wins}${teams}`;
                });

                let currentMessage = '```text\n' + header;

                for (const row of rows) {
                    // Check if adding this row + the closing code block ``` would exceed 2000 chars
                    if ((currentMessage + row + '\n```').length > 2000) {
                        // Close the current block and send it
                        await interaction.followUp(currentMessage + '```');
            
                        // Start a new block for the remaining rows
                        currentMessage = '```text\n' + row + '\n';
                        } else {
                            currentMessage += row + '\n';
                        }
                }

                // Send the final chunk
                // Use editReply for the first part if you haven't sent anything yet, 
                // or followUp if you already cleared the initial defer.
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({content: currentMessage + '```', flags: MessageFlags.Ephemeral});
                } else {
                    await interaction.reply(currentMessage + '```');
                }
            }
        }
        else if (championship === 't') {
            console.log('/tulokset, tallit, ' + year);
            const standings = await getConstructorStandings(year);

            if (standings.length === 0) {
                await interaction.editReply(`Tuloksia kaudelle ${year} ei ole saatavilla.`);
            }
            else {
                const constructorStandings = standings.ConstructorStandings;
                const header = 'Valmistajien mestaruus kaudella ' + year + ', osakilpailuja '+standings.round+'\n\n' +
                    '#   Talli             Pisteet    Voitot\n\n';

                const rows = constructorStandings.map(c => {
                let pos = (c.position ?? c.positionText ?? '-');
                if (pos !== '-') {
                    pos = pos + '.';
                }
                pos = pos.padEnd(4);
                const name = c.Constructor.name.padEnd(18);
                const pts = c.points.padStart(6).padEnd(10);
                const wins = c.wins.padStart(5);

                    return `${pos}${name}${pts}${wins}`;
                });

                let currentMessage = '```text\n' + header;

                for (const row of rows) {
                    // Check if adding this row + the closing code block ``` would exceed 2000 chars
                    if ((currentMessage + row + '\n```').length > 2000) {
                        // Close the current block and send it
                        await interaction.followUp(currentMessage + '```');
            
                        // Start a new block for the remaining rows
                        currentMessage = '```text\n' + row + '\n';
                        } else {
                            currentMessage += row + '\n';
                        }
                }

                // Send the final chunk
                // Use editReply for the first part if you haven't sent anything yet, 
                // or followUp if you already cleared the initial defer.
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({content: currentMessage + '```', flags: MessageFlags.Ephemeral});
                } else {
                    await interaction.reply(currentMessage + '```');
                }
            }
        }
    },
};