import { jest } from '@jest/globals';

const { default: infoCommand } = await import('../../commands/info.js');

describe('Info Command', () => {
    let mockInteraction;

    beforeEach(() => {
        jest.clearAllMocks();

        // 3. Setup interaction with a mocked websocket ping
        mockInteraction = {
            client: {
                ws: { ping: 45 } // Simulated websocket latency
            },
            reply: jest.fn().mockResolvedValue(true),
            editReply: jest.fn().mockResolvedValue(true),
        };
    });

    test('should reply with version', async () => {
        await infoCommand.execute(mockInteraction);

        // Check first reply (initial ping message)
        expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: 'Pinging...',
            flags: 64 // MessageFlags.Ephemeral
        }));

        // Check the editReply (the final table/info)
        expect(mockInteraction.editReply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('Rillibotin versio: ')
        }));
    });
});