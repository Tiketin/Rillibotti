import fs from 'fs/promises';

export async function getDriverStandings(year) {

    const savedResponse = await readStandingsFromFile('drivers', year);

    if (savedResponse != null) {
        console.log(`Haetaan vuoden ${year} kuljettajien tulokset tiedostosta.`);
        const responseStandingsList = savedResponse.MRData?.StandingsTable?.StandingsLists || [];
        return responseStandingsList[0];
    }

    try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/driverstandings/`;
        console.log('Rajapintakutsu: '+url);

        const res = await fetch(url);
        if (!res.ok) {
        console.error(`HTTP-virhe! Status: ${res.status}`);
        return null;
        }

        const data = await res.json();

        const standingsList = data.MRData?.StandingsTable?.StandingsLists || [];
        if (standingsList.length === 0) return [];
        await saveStandingsToFile(data, 'drivers', year);
        return standingsList[0];
    } catch (err) {
        console.error('Haku epäonnistui:', err);
        return null;
    }
}

export async function getConstructorStandings(year) {

    const savedResponse = await readStandingsFromFile('constructors', year);
    
    if (savedResponse != null) {
        console.log(`Haetaan vuoden ${year} valmistajien tulokset tiedostosta.`);
        const responseStandingsList = savedResponse.MRData?.StandingsTable?.StandingsLists || [];
        return responseStandingsList[0];
    }

    try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/constructorstandings/`;
        console.log('Rajapintakutsu: '+url);
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`HTTP-virhe! Status: ${res.status}`);
            return null;
        }

        const data = await res.json();

        const standingsList = data.MRData?.StandingsTable?.StandingsLists || [];
        if (standingsList.length === 0) return [];
        await saveStandingsToFile(data, 'constructors', year);
        return standingsList[0];
    } catch (err) {
        console.error('Haku epäonnistui:', err);
        return null;
    }
}

async function saveStandingsToFile(data, championship, year) {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
        console.log('Kuluvan vuoden tuloksia ei tallenneta tiedostoon.');
        return;
    }
    const dirPath = `./data/championships/${championship}`;
    const filePath = dirPath+`/${year}.json`

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function readStandingsFromFile(championship, year) {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
        console.log('Kuluvan vuoden tulokset haetaan aina rajapinnasta.');
        return null;
    }
    const filePath = `./data/championships/${championship}/${year}.json`

    try {
        const file = await fs.readFile(filePath, 'utf8');
        return JSON.parse(file);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err; // real error, not "file missing"
        }
        return null;
    }
}
