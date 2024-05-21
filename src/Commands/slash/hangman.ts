import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ReactionCollector,
    SlashCommandBuilder
} from "discord.js";
import { Services } from "../../Services";
import SlashCommand from "../SlashCommand";
import path from "path";
import { readFileSync } from "fs";
import { randomInt } from "crypto";

const HANGMAN_STATE_FILEPATH = path.join(__dirname, "../../Assets/hangman-data/hangman-state.txt")
const HANGMAN_STATE_RAW_DATA = readFileSync(HANGMAN_STATE_FILEPATH, { encoding: "utf-8" })
const HANGMAN_STATE = HANGMAN_STATE_RAW_DATA
    .split("----- SEPARATOR -----")
    .map(v => v.trim())

const WORD_BANK_FILEPATH = path.join(__dirname, "../../Assets/hangman-data/word-bank.txt")
const WORD_BANK_RAW_DATA = readFileSync(WORD_BANK_FILEPATH, { encoding: "utf-8" })
const WORD_BANK = WORD_BANK_RAW_DATA.split("\n")

const REACTIONS = [
    //? have to split into two due to discord limitation with reaction
    [
        "🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬",
        "🇭", "🇮", "🇯", "🇰", "🇱", "🇲"
    ],
    [
        "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹",
        "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"
    ]
]
const REACTION_MAPPING = {
    "🇦": "a", "🇧": "b", "🇨": "c", "🇩": "d", "🇪": "e", "🇫": "f", "🇬": "g",
    "🇭": "h", "🇮": "i", "🇯": "j", "🇰": "k", "🇱": "l", "🇲": "m", "🇳": "n",
    "🇴": "o", "🇵": "p", "🇶": "q", "🇷": "r", "🇸": "s", "🇹": "t", "🇺": "u",
    "🇻": "v", "🇼": "w", "🇽": "x", "🇾": "y", "🇿": "z"
}

export default class HangmanCommand extends SlashCommand {
    public data = new SlashCommandBuilder()
        .setName("hangman")
        .setDescription("Play Hangman with Bluey themed words!")

    async execute(interaction: ChatInputCommandInteraction, services: Services) {
        const SELECTED_WORD = WORD_BANK[randomInt(0, WORD_BANK.length)].trim()
        let gameState = {
            currentTries: 1,
            maxTries: HANGMAN_STATE.length,
            result: "playing",
            guessedLetters: [], // letters that have already been guessed
            currentlyGuessed: new Array(SELECTED_WORD.length).fill(""),
            needToGuess: SELECTED_WORD.length, // the amount of letters needed to win
            haveGuessed: 0, // the current amount of letters the user have guessed
        }

        const INIT_EMBED = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Initializing")
            .setFooter({ text: "Bot Billy" })

        const renderCurrentlyGuessed = () => gameState.currentlyGuessed
            .map(v => v == "" ? "**_**" : `__${v}__`)
            .join(" ")

        const findCharacter = (letter: string) => {
            var foundPos: number[] = []
            for (var i = 0; i < SELECTED_WORD.length; i++) {
                if (SELECTED_WORD[i] != letter) continue
                foundPos.push(i)
            }
            return foundPos
        }

        const generateGameEmbed = (extraMessage: string = "") => {
            //? the last 6 characters are the hex colors for the embed
            const EMBED_COLOR = parseInt(
                HANGMAN_STATE[gameState.currentTries - 1].slice(-6), 16)

            return new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("Hangman - Bluey Themed!")
                .addFields([
                    {
                        name: "Your word to guess",
                        value: renderCurrentlyGuessed(),
                        inline: true
                    },
                    {
                        name: "Guesses",
                        value: `** **${gameState.guessedLetters.join(", ")}`,
                        inline: true
                    },
                ])
                .setDescription(
                    `This game session was created by <@${interaction.user.id}>.\n` +
                    `Only reactions from this user will be accepted.\n` +
                    "```\n" +
                    //? remove the last 7 characters (6 hex colors mentioned above + 1 break line)
                    HANGMAN_STATE[gameState.currentTries - 1].slice(0, -7) +
                    "```\n" +
                    extraMessage
                )
                .setTimestamp()
                .setFooter({ text: "Bot Billy" })
            }

        const updateGuesses = (foundCharPos: number[], letter: string) => {
            for (const i of foundCharPos) {
                gameState.currentlyGuessed[i] = letter
                gameState.haveGuessed++
            }
            gameState.guessedLetters.push(letter)
        }

        await interaction.reply({
            embeds: [INIT_EMBED]
        })

        const letterCollectorList: ReactionCollector[] = []
        const stopCollector = () => letterCollectorList.forEach(v => v.stop())

        for (const i of REACTIONS) {
            const MESSAGE = await interaction.channel.send("** **")
            for (const j of i) {
                const EMOJI = j.split(":")[0]
                //const LETTER = j.split(":")[1]
                await MESSAGE.react(EMOJI)
            }
            letterCollectorList.push(
                MESSAGE.createReactionCollector({
                    time: 120_000,
                    filter: (reaction, user) =>
                        reaction.message.id == MESSAGE.id &&
                        i.includes(reaction.emoji.name) &&
                        user.id == interaction.user.id
                })
            )
        }

        await interaction.editReply({
            embeds: [generateGameEmbed()]
        })

        for (const i of letterCollectorList) {
            i.on("collect", async (reaction, user) => {
                if (user.id != interaction.user.id) return

                const EMOJI = reaction.emoji.name
                const CHAR = REACTION_MAPPING[EMOJI]

                const FOUND_CHAR_IN = findCharacter(CHAR)
                if (gameState.guessedLetters.includes(CHAR)) return

                if (FOUND_CHAR_IN.length == 0) {
                    gameState.guessedLetters.push(CHAR)
                    gameState.currentTries++

                    if (gameState.currentTries >= gameState.maxTries) {
                        await interaction.editReply({
                            embeds: [
                                generateGameEmbed(`Game Over! You lose!\nThe word was **${SELECTED_WORD}**.`)
                            ]
                        })
                        stopCollector()
                    } else {
                        await interaction.editReply({
                            embeds: [generateGameEmbed()]
                        })
                    }
                    return
                }

                updateGuesses(FOUND_CHAR_IN, CHAR)

                if (gameState.haveGuessed == gameState.needToGuess) {
                    gameState.currentTries = 1
                    await interaction.editReply({
                        embeds: [
                            generateGameEmbed(`Congratulation! You won!`)
                        ]
                    })
                    stopCollector()
                    return
                }

                await interaction.editReply({
                    embeds: [generateGameEmbed()]
                })
            })
        }
    }
}