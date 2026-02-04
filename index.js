require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes, Client, GatewayIntentBits, Partials, Collection, ActivityType, PresenceUpdateStatus, Events, EmbedBuilder } = require('discord.js');

const deployCommands = async () => {
    try {
        const commands = [];

        const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`);
            }
        }
    

    const rest = new REST().setToken(process.env.BOT_TOKEN);

    console.log(`Started refreshing application slash commands globally.`);

    const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
    );

    console.log('Successfully reloaded all commands!');
    } catch (error) {
        console.error('Error deploying commands:', error)
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

client.commands = new Collection();



const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`The Command ${filePath} is missing a required "data" or "execute" property.`)
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    //Deploy Commands
    await deployCommands();
    console.log(`Commands deployed globally.`);

    const statusType = process.env.BOT_STATUS || 'idle';
    const activityType = process.env.ACTIVITY_TYPE || 'WATCHING';
    const activityName = process.env.ACTIVITY_NAME || 'F1';

    const activityTypeMap = {
        'PLAYING': ActivityType.Playing,
        'WATCHING': ActivityType.Watching,
        'LISTENING': ActivityType.Listening,
        'STREAMING': ActivityType.Streaming,
        'COMPETING': ActivityType.Competing
    };

    const statusMap = {
        'online': PresenceUpdateStatus.Online,
        'idle': PresenceUpdateStatus.Idle,
        'dnd': PresenceUpdateStatus.DoNotDisturb,
        'invisible': PresenceUpdateStatus.Invisible
    };

    client.user.setPresence({
        status: statusMap[statusType],
        activities: [{
            name: activityName,
            type: activityTypeMap[activityType]
        }]
    });
    
    console.log(`Bot status set to: ${statusType}`);
    console.log(`Activity set to: ${activityType} ${activityName}`)
});

async function sendWelcomeMessage(member) {
  const channelName = 'tervetuloa';
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === channelName && ch.isTextBased()
  );

  if (!channel) {
    console.error(`Kanavaa "${channelName}" ei löytynyt.`);
    return;
  }

  // Create an embed message
  const embed = new EmbedBuilder()
    .setColor('#f74907')
    .setTitle(`${member.displayName} kurvasi lähtöruudukkoon!`)
    .setDescription(`Tervetuloa Rillirouskujen F1 Podcast-palvelimelle!` + 
        `\n Olet ${member.guild.memberCount - 1}. jäsen.`) //Member count - Bot
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Liittynyt ${new Date().toLocaleDateString()}` });

  await channel.send({ embeds: [embed] });
}

client.on('guildMemberAdd', sendWelcomeMessage);

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        // console.error(`No command matching ${interaction.commandName} was found.`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Virhe komentoa suoritettaessa!', ephemeral: true});
        } else {
            await interaction.reply({ content: 'Virhe komentoa suoritettaessa!', ephemeral: true});
        }
    }
});

/*client.on('messageCreate', (message) => {
  if (message.content === '!testwelcome') {
    client.emit('guildMemberAdd', message.member);
  }
});*/



client.login(process.env.BOT_TOKEN);