import fs from 'fs/promises';
import { logBackend, logError, logErrorWithoutCode } from './logger.js';

export async function getDriverStandings(year) {

    const savedResponse = await readStandingsFromFile('drivers', year);

    if (savedResponse != null) {
        logBackend(`Haetaan vuoden ${year} kuljettajien tulokset tiedostosta.`);
        const responseStandingsList = savedResponse.MRData?.StandingsTable?.StandingsLists || [];
        return responseStandingsList[0];
    }

    try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/driverstandings/`;
        logBackend(`Rajapintakutsu: ${url}`);

        const res = await fetch(url);
        if (!res.ok) {
        logErrorWithoutCode(`HTTP-virhe! Status: ${res.status}`);
        return null;
        }

        const data = await res.json();

        const standingsList = data.MRData?.StandingsTable?.StandingsLists || [];
        if (standingsList.length === 0) return [];
        await saveStandingsToFile(data, 'drivers', year);
        return standingsList[0];
    } catch (err) {
        logError('Haku epäonnistui: ', err);
        return null;
    }
}

export async function getConstructorStandings(year) {

    const savedResponse = await readStandingsFromFile('constructors', year);
    
    if (savedResponse != null) {
        logBackend(`Haetaan vuoden ${year} valmistajien tulokset tiedostosta.`);
        const responseStandingsList = savedResponse.MRData?.StandingsTable?.StandingsLists || [];
        return responseStandingsList[0];
    }

    try {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/constructorstandings/`;
        logBackend(`Rajapintakutsu: ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
            logErrorWithoutCode(`HTTP-virhe! Status: ${res.status}`);
            return null;
        }

        const data = await res.json();

        const standingsList = data.MRData?.StandingsTable?.StandingsLists || [];
        if (standingsList.length === 0) return [];
        await saveStandingsToFile(data, 'constructors', year);
        return standingsList[0];
    } catch (err) {
        logError('Haku epäonnistui: ', err);
        return null;
    }
}

async function saveStandingsToFile(data, championship, year) {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
        logBackend(`Kuluvan vuoden (${year}) tuloksia ei tallenneta tiedostoon.`);
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
        logBackend(`Kuluvan vuoden (${year}) tulokset haetaan aina rajapinnasta.`);
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
