const { Command } = require("discord-akairo");
const ReactionMenu = require("@amanda/reactionmenu");

const { token, chewey_bot, nasa, webhooks} = require("../../../config.js");
const { stringify } = require("../../util/utils");

const blacklist = [
    token,
    chewey_bot,
    nasa,
];

module.exports = class EvalCommand extends Command {
    constructor() {
        super("eval", {
            aliases: ["eval", "evaluate"],
            description: "Evaluate and execute code from within the bot process.",
            ownerOnly: true,
            typing: true,
            args: [
                {
                    id: "depth",
                    default: 0,
                    type: "number",
                    match: "flag",
                    flag: "--depth"
                },
                {
                    id: "code",
                    prompt: {
                        start: "Please supply something to execute.",
                        timeout: 100000
                    },
                    match: "content",
                    type: "string",
                }
            ]
        })

    }

    async exec(msg, { depth, code }) {
        let result;

        try {
            result = eval(code.replace(/this.client.token/g, `"${this.client.fakeToken}"`))
        } catch (e) {
            result = e
        }

        let output = await stringify(result, depth)
        for (const item of blacklist) {
            output = output.replace(new RegExp(item, "g"), this.client.fakeToken)
        }

        let nmsg = await msg.util.send(output)
        const menu = new ReactionMenu(nmsg, [{ emoji: "🗑", allowedUsers: [msg.author.id], remove: "message" }]);
		return setTimeout(() => menu.destroy(true), 5 * 60 * 1000);
    }
}