import { Message, TextChannel } from "discord.js";
import { Services } from "../../Services";
import TextCommand, { TextCommandBuilder } from "../TextCommand";
import { roleIds } from "../../Constants";

export default class ToggleGateCommand extends TextCommand {
    public data = new TextCommandBuilder()
        .setName("toggle gate")
        .setDescription("Toggles whether the join gate is enabled or not.")
        .addAllowedRoles(roleIds.staff)
        .allowInDMs(false);

    async execute(message: Message, args: string[], services: Services) {
        let joinGate = !services.state.state.joinGate;

        services.state.set("joinGate", joinGate);

        await message.reply(`Successfully **${joinGate ? "enabled" : "disabled"}** the join gate.`);
    }
}