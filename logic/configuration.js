export function getTeams() {
  try {
    return JSON.parse(process.env.TEAMS ?? '[]');
  } catch {
    return [];
  }
}

export function isDebugEnabled() {
  let debugEnabled = false;
  if(process.env.DEBUG === "true") {
    debugEnabled = true;
  }
  return debugEnabled;
}

