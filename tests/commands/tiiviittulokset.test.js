import { jest } from '@jest/globals';

// 1. Mock the API logic
jest.unstable_mockModule('../../logic/f1api.js', () => ({
    getDriverStandings: jest.fn(),
    getConstructorStandings: jest.fn(),
}));

// 2. Import the command and mocked logic
const { default: tiiviittuloksetCommand } = await import('../../commands/tiiviittulokset.js');
const { getDriverStandings, getConstructorStandings } = await import('../../logic/f1api.js');

describe('Tulokset Command', () => {
    let mockInteraction;

    beforeEach(() => {
        jest.clearAllMocks();

        // 3. Create a fresh mock interaction for every test
        mockInteraction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
            followUp: jest.fn(),
            reply: jest.fn(),
            deferred: true,
            replied: false,
            options: {
                getString: jest.fn(),
                getInteger: jest.fn(),
            },
        };
    });

    test('should show error message if no driver standings found', async () => {
        // Setup mocks for this specific test
        mockInteraction.options.getString.mockReturnValue('k'); // 'k' = kuljettajat
        mockInteraction.options.getInteger.mockReturnValue(2023);
        getDriverStandings.mockResolvedValue([]); // Simulate empty results

        await tiiviittuloksetCommand.execute(mockInteraction);

        expect(mockInteraction.deferReply).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Tuloksia kaudelle 2023 ei ole saatavilla.')
        );
    });

    test('should show error message if no constructor standings found', async () => {
        // Setup mocks for this specific test
        mockInteraction.options.getString.mockReturnValue('t'); // 'k' = kuljettajat
        mockInteraction.options.getInteger.mockReturnValue(2023);
        getConstructorStandings.mockResolvedValue([]); // Simulate empty results

        await tiiviittuloksetCommand.execute(mockInteraction);

        expect(mockInteraction.deferReply).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Tuloksia kaudelle 2023 ei ole saatavilla.')
        );
    });

    test('should format driver standings correctly', async () => {
        const mockData = {
            round: '22',
            DriverStandings: [
                {
                    position: '1',
                    points: '575',
                    wins: '19',
                    Driver: { givenName: 'Max', familyName: 'Verstappen' },
                    Constructors: [{ name: 'Red Bull' }]
                }
            ]
        };
        
        mockInteraction.options.getString.mockReturnValue('k');
        getDriverStandings.mockResolvedValue(mockData);

        await tiiviittuloksetCommand.execute(mockInteraction);

        // Verify that followUp was called because it's the final step in your logic
        expect(mockInteraction.followUp).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('M. Verstappen')
            })
        );
    });

    test('should format constructor standings correctly', async () => {
        const mockData = {
            round: '22',
            ConstructorStandings: [
                {
                    position: '1',
                    points: '860',
                    wins: '21',
                    Constructor: { name: 'Red Bull' }
                }
            ]
        };
        
        mockInteraction.options.getString.mockReturnValue('t');
        getConstructorStandings.mockResolvedValue(mockData);

        await tiiviittuloksetCommand.execute(mockInteraction);

        // Verify that followUp was called because it's the final step in your logic
        expect(mockInteraction.followUp).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('Red Bull')
            })
        );
    });
});