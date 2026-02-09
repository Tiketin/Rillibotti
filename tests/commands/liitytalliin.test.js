import { jest } from '@jest/globals';
import { Collection, MessageFlags } from 'discord.js';

// 1. Set the environment variable BEFORE importing the command
process.env.TEAMS = JSON.stringify(['Ferrari', 'Mercedes', 'Red Bull']);

// 2. Now import the command
const { default: liitytalliinCommand } = await import('../../commands/liitytalliin.js');

describe('Liitytalliin Command', () => {
    let mockInteraction;
    let mockRole;
    let mockMember;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock the target role
        mockRole = { id: '123', name: 'Ferrari' };

        // Mock the member's current roles
        const currentRoles = new Collection([
            ['999', { id: '999', name: 'Mercedes' }],
            ['000', { id: '000', name: '@everyone' }]
        ]);

        mockMember = {
            displayName: 'Testikäyttäjä',
            roles: {
                cache: currentRoles,
                add: jest.fn().mockResolvedValue({}),
                remove: jest.fn().mockResolvedValue({})
            }
        };

        mockInteraction = {
            options: { getString: jest.fn() },
            member: mockMember,
            guild: {
                roles: {
                    cache: {
                        find: jest.fn()
                    }
                },
                members: {
                    me: {
                        permissions: {
                            has: jest.fn().mockReturnValue(true)
                        }
                    }
                }
            },
            reply: jest.fn().mockResolvedValue({})
        };
    });

    test('should successfully switch roles', async () => {
        mockInteraction.options.getString.mockReturnValue('Ferrari');
        mockInteraction.guild.roles.cache.find.mockReturnValue(mockRole);

        await liitytalliinCommand.execute(mockInteraction);

        // Verify removal: it should be called with an array of roles (excluding @everyone)
        expect(mockMember.roles.remove).toHaveBeenCalled();
        
        // Verify add
        expect(mockMember.roles.add).toHaveBeenCalledWith(mockRole);
        
        // Verify reply
        expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('liittyi talliin **Ferrari**!'),
            flags: MessageFlags.Ephemeral
        }));
    });

    test('should fail if bot lacks ManageRoles permission', async () => {
        mockInteraction.options.getString.mockReturnValue('Ferrari');
        mockInteraction.guild.roles.cache.find.mockReturnValue(mockRole);
        mockInteraction.guild.members.me.permissions.has.mockReturnValue(false);

        await liitytalliinCommand.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: 'Voi ei, minulla ei ole lupaa päivittää rooleja!'
        }));
    });
});