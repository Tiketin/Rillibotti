import { jest } from '@jest/globals';
import { Collection } from 'discord.js'; // Add this to your test imports

const { default: liitytalliinCommand } = await import('../../commands/liitytalliin.js');

describe('Liitytalliin Command', () => {
    let mockInteraction;
    let mockRole;
    let mockMember;

    beforeEach(() => {
        jest.clearAllMocks();

        // 1. Mock the specific role the user wants to join
        mockRole = { 
            id: '123', 
            name: 'Ferrari' 
        };

        // 1. Define the roles as a simple array first
        const currentRoles = [
            { name: 'Mercedes', id: '999' },
            { name: '@everyone', id: '000' }
        ];

        mockMember = {
            displayName: 'Testikäyttäjä',
            roles: {
                // We mock the cache object to behave like a Discord.js Collection
                cache: {
                    // .filter() returns an object that has .map()
                    filter: jest.fn().mockImplementation((fn) => {
                        const filtered = currentRoles.filter(fn);
                        return {
                            // .map() returns the actual results
                            map: jest.fn().mockImplementation((mapFn) => filtered.map(mapFn))
                        };
                    })
                },
                add: jest.fn(),
                remove: jest.fn(),
            }
        };

        // 3. Mock the Interaction and Guild
        mockInteraction = {
            options: { getString: jest.fn() },
            member: mockMember,
            guild: {
                roles: {
                    cache: {
                        // Simulating the .find() method on a collection
                        find: jest.fn()
                    }
                },
                members: {
                    me: {
                        permissions: {
                            has: jest.fn().mockReturnValue(true) // Bot has permissions by default
                        }
                    }
                }
            },
            reply: jest.fn(),
        };
    });

    test('should successfully switch roles', async () => {
        // Setup: User wants 'Ferrari'
        mockInteraction.options.getString.mockReturnValue('Ferrari');
        mockInteraction.guild.roles.cache.find.mockReturnValue(mockRole);

        await liitytalliinCommand.execute(mockInteraction);

        // Verify: Did it find the old role (Mercedes) and remove it?
        expect(mockMember.roles.remove).toHaveBeenCalled();
        
        // Verify: Did it add the new role?
        expect(mockMember.roles.add).toHaveBeenCalledWith(mockRole);
        
        // Verify: Correct success message
        expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('**Testikäyttäjä** liittyi talliin **Ferrari**!'),
            flags: 64 // 64 is the bitwise value for MessageFlags.Ephemeral
        }));
    });

    test('should fail if bot lacks ManageRoles permission', async () => {
        mockInteraction.options.getString.mockReturnValue('Ferrari');
        mockInteraction.guild.roles.cache.find.mockReturnValue(mockRole);
        
        // Simulate missing permission
        mockInteraction.guild.members.me.permissions.has.mockReturnValue(false);

        await liitytalliinCommand.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: 'Voi ei, minulla ei ole lupaa päivittää rooleja!'
        }));
        expect(mockMember.roles.add).not.toHaveBeenCalled();
    });

    test('should fail if role does not exist in guild', async () => {
        mockInteraction.options.getString.mockReturnValue('NonExistentTeam');
        mockInteraction.guild.roles.cache.find.mockReturnValue(null);

        await liitytalliinCommand.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('Ei löytynyt tallia')
        }));
    });
});