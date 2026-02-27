export function logCommand(interaction, message) {
    const displayName = interaction.member?.displayName ?? '-----';
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    console.log(`[${date}] [${time}] [${displayName}] ${message}`);   
}

export function logBackend(message) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    console.log(`[${date}] [${time}] [backend] ${message}`);   
}

export function logError(message, error) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    console.error(`[${date}] [${time}] [ERROR] ${message}`, error); 
}

export function logErrorWithoutCode(message) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    console.error(`[${date}] [${time}] [ERROR] ${message}`); 
}