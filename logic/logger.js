export function logCommand(interaction, message) {
    const displayName = interaction.member?.displayName ?? '-';
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    console.log(`[${date}] [${time}] [${displayName}] ${message}`);   
}