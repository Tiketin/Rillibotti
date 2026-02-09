export function getTeams() {
  try {
    return JSON.parse(process.env.TEAMS ?? '[]');
  } catch {
    return [];
  }
}
