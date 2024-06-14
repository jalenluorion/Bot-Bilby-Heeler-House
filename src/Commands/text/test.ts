import { AttachmentBuilder, Message } from "discord.js";
import { Services } from "../../Services";
import TextCommand, { TextCommandBuilder } from "../TextCommand";
import PlaceAlliance from "../../Services/Database/models/placeAlliance";
import { compareCurrentTemplateWithNew, cropTemplateDiff, generateTemplate } from "../../Helper/PlaceCanvasHelper";
import PlaceArtwork from "../../Services/Database/models/placeArtwork";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { buildTemplate } from "../../Helper/PlaceHelper";

export default class PingCommand extends TextCommand {
    public data = new TextCommandBuilder()
        .setName("test")
        .setDescription("Testing bullshit")
        .allowInDMs(true);

    async execute(message: Message, args: string[], services: Services) {
        let msg = await message.reply("Processing...");

        buildTemplate(
            await services.database.collections.place.artworks.find().toArray() as unknown as PlaceArtwork[],
            await services.database.collections.place.alliances.find().toArray() as unknown as PlaceAlliance[],
            services.state.state.place,
            async (data) => {
                await msg.edit({
                    content: "hello!\n crop coords: (" + data.croppedDiff.x + ", " + data.croppedDiff.y + ")\n\n" + data.missingArtworks,
                    files: [
                        new AttachmentBuilder(Buffer.from(data.template.buffer.data), {
                            name: "template.png",
                            description: "template generator yes"
                        }),
                        new AttachmentBuilder(Buffer.from(data.diff.data), {
                            name: "diff.png",
                            description: "template diff generator yes"
                        }),
                        new AttachmentBuilder(Buffer.from(data.croppedDiff.buffer.data), {
                            name: "cropped.png",
                            description: "this took way too long"
                        })
                    ]
                });
            }
        )
    }
}