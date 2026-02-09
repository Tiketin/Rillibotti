import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getTeams } from '../logic/getteams.js';

const teams = getTeams();

export default {
  data: new SlashCommandBuilder()
    .setName('liitytalliin')
    .setDescription('Liity haluamaasi talliin!')
    .addStringOption(option => {
      option.setName('talli')
        .setDescription('Valitse haluamasi talli!')
        .setRequired(true);

      // Generate choices automatically from the teams array
      teams.forEach(team => option.addChoices({ name: team, value: team }));
      return option;
    }),

  async execute(interaction) {
    const roleName = interaction.options.getString('talli');
    const member = interaction.member;
    console.log(`/liitytalliin, ${roleName}, ${member.displayName}`);

    // Find the matching role by name
    const role = interaction.guild.roles.cache.find(
      r => r.name.toLowerCase() === roleName.toLowerCase()
    );

    if (!role) {
      return interaction.reply({
        content: `Ei löytynyt tallia **${roleName}**.`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: 'Voi ei, minulla ei ole lupaa päivittää rooleja!',
        flags: MessageFlags.Ephemeral
      });
    }

    // Ensure role is in the allowed list (it always will be, but safety check)
    if (!teams.includes(role.name)) {
      return interaction.reply({
        content: `**${role.name}** ei ole sallittu.`,
        flags: MessageFlags.Ephemeral
      });
    }

    try {
        // Use .map() to create an array of role names
        const excludedRoles = ['@everyone', 'FIA'];
        const roleNames = member.roles.cache
            .filter(role => !excludedRoles.includes(role.name)) // Exclude the default @everyone role
            .map(role => role.name);
        const roles = member.roles.cache
            .filter(role => !excludedRoles.includes(role.name)) // Exclude the default @everyone role
            .map(role => role);
        console.log(`Jäsenen edelliset roolit: ${roleNames}...`);
        await member.roles.remove(roles);
        console.log(`poistettu.`);
        await member.roles.add(role);
        console.log(`Jäsen lisätty rooliin ${role.name}.`);
        await interaction.reply({
        content: `**${member.displayName}** liittyi talliin **${role.name}**!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Jotain meni pieleen tallin määrittämisessä.',
        flags: MessageFlags.Ephemeral
      });
    }
  },
};

