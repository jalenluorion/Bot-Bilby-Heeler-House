import { AutocompleteInteraction, ChatInputCommandInteraction, Message, SlashCommandBuilder, Snowflake } from "discord.js";
import { Services } from "../Services";

export default class TextCommand {
    public data: TextCommandBuilder;

    constructor() {}

    /**
     * Executes the command.
     * @param message The message received from Discord.
     * @param args The processed arguments to this command.
     */
    async execute(message: Message, args: string[], services: Services) {
        await message.reply(":white_check_mark:");
    }
}

/**
 * Creates the data for a Text Command.
 * The main use for this is setting the command name, but it can be used as an input for a help command.
 */
export class TextCommandBuilder {
    public name: string;
    public description: string;
    public permissions: TextCommandPermissions;
    public arguments: TextCommandArgument[];
    public allowedInDMs: boolean;

    /**
     * Sets the command name.
     * @param name The new name to set
     * @returns This TextCommandBuilder
     */
    setName(name: string): TextCommandBuilder {
        this.name = name;
        return this;
    }

    /**
     * Sets the command description.
     * @param description The new description to set
     * @returns This TextCommandBuilder
     */
    setDescription(description: string): TextCommandBuilder {
        this.description = description;
        return this;
    }

    /**
     * Allows the provided roles to execute the command.
     * @param roles The role id(s) to allow
     * @returns This TextCommandBuilder
     */
    addAllowedRoles(...roles: Snowflake[]): TextCommandBuilder {
        this.permissions.allowedRoles.push(...roles);
        return this;
    }

    /**
     * Denies the provided roles from executing the command.
     * @param roles The role id(s) to deny
     * @returns This TextCommandBuilder
     */
    addDeniedRoles(...roles: Snowflake[]): TextCommandBuilder {
        this.permissions.deniedRoles.push(...roles);
        return this;
    }

    /**
     * Allows the provided users to execute the command.
     * @param users The user id(s) to allow
     * @returns This TextCommandBuilder
     */
    addAllowedUsers(...users: Snowflake[]): TextCommandBuilder {
        this.permissions.allowedUsers.push(...users);
        return this;
    }

    /**
     * Adds an argument to the command.
     * @param name The name of the argument
     * @param description The description of the argument
     * @returns This TextCommandBuilder
     */
    addArgument(name: string, description: string): TextCommandBuilder {
        this.arguments.push({
            name,
            description
        });
        return this;
    }

    /**
     * Sets whether the command is allowed in DMs.
     * @param allowedInDMs Whether the command is allowed in DMs or not
     * @returns This TextCommandBuilder
     */
    allowInDMs(allowedInDMs: boolean): TextCommandBuilder {
        this.allowedInDMs = allowedInDMs;
        return this;
    }
}

interface TextCommandPermissions {
    allowedRoles: Snowflake[],
    deniedRoles: Snowflake[],
    allowedUsers: Snowflake[]
}

interface TextCommandArgument {
    name: string,
    description: string
}