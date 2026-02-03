export async function getDriverStandings(year) {
    const url = 'https://api.jolpi.ca/ergast/f1/'+ year +'/driverstandings/';
    console.log(url);

    try {
        const res = await fetch(url);
        if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        return null;
        }

        const data = await res.json();

        // Navigate to the driver standings array
        const standingsList = data.MRData?.StandingsTable?.StandingsLists || [];
        if (standingsList.length === 0) return [];

        return standingsList[0].DriverStandings;
    } catch (err) {
        console.error('Fetch failed:', err);
        return null;
    }
}
