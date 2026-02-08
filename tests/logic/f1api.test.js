import { jest } from '@jest/globals';

// 1. Mock fs/promises with a default export
jest.unstable_mockModule('fs/promises', () => {
  const mockFs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  };
  return {
    ...mockFs,
    default: mockFs // This fixes the "does not provide an export named default" error
  };
});

// 2. You MUST use dynamic imports AFTER the mock for it to take effect
const { default: fs } = await import('fs/promises');
const { getDriverStandings, getConstructorStandings } = await import('../../logic/f1api.js');

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const mockApiResponse = {
  MRData: {
    StandingsTable: {
      StandingsLists: [
        { season: '1960', round: '11', Standings: ['data'] }
      ]
    }
  }
};

test('getDriverStandings returns data from file if present', async () => {
  fs.readFile.mockResolvedValue(JSON.stringify(mockApiResponse));

  const result = await getDriverStandings(1960);

  expect(fs.readFile).toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  expect(result).toEqual(mockApiResponse.MRData.StandingsTable.StandingsLists[0]);
});

test('getDriverStandings fetches from API if file is missing', async () => {
  fs.readFile.mockRejectedValue({ code: 'ENOENT' });

  fetch.mockResolvedValue({
    ok: true,
    json: async () => mockApiResponse
  });

  const result = await getDriverStandings(1960);

  expect(fetch).toHaveBeenCalledWith(
    'https://api.jolpi.ca/ergast/f1/1960/driverstandings/'
  );

  expect(fs.mkdir).toHaveBeenCalled();
  expect(fs.writeFile).toHaveBeenCalled();

  expect(result).toEqual(mockApiResponse.MRData.StandingsTable.StandingsLists[0]);
});

test('does not save standings for current year', async () => {
  const currentYear = new Date().getFullYear();

  fetch.mockResolvedValue({
    ok: true,
    json: async () => mockApiResponse
  });

  const result = await getDriverStandings(currentYear);

  expect(fs.writeFile).not.toHaveBeenCalled();
  expect(result).toEqual(mockApiResponse.MRData.StandingsTable.StandingsLists[0]);
});

test('returns null on HTTP error', async () => {
  fs.readFile.mockRejectedValue({ code: 'ENOENT' });

  fetch.mockResolvedValue({
    ok: false,
    status: 500
  });

  const result = await getDriverStandings(1960);

  expect(result).toBeNull();
});

test('getConstructorStandings uses constructor endpoint', async () => {
  fs.readFile.mockRejectedValue({ code: 'ENOENT' });

  fetch.mockResolvedValue({
    ok: true,
    json: async () => mockApiResponse
  });

  await getConstructorStandings(1960);

  expect(fetch).toHaveBeenCalledWith(
    'https://api.jolpi.ca/ergast/f1/1960/constructorstandings/'
  );
});
