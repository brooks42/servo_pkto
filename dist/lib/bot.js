"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pokecube_cards_1 = __importDefault(require("./pokecube_cards"));
const discord_js_1 = require("discord.js");
const messenger_1 = require("./messenger");
class Servo {
    token;
    client;
    cardList;
    constructor(token) {
        console.log('pokédex client init');
        this.token = token;
        this.client = this.makeClient(token);
        this.cardList = new pokecube_cards_1.default();
    }
    makeClient(token) {
        console.log(`Client created...`);
        const clientOptions = {
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers,
            ],
        };
        const client = new discord_js_1.Client(clientOptions);
        client.on('ready', async () => {
            if (!client.user || !client.application) {
                console.log('client user or client app not set');
                return;
            }
            console.log(`${client.user.username} is online`);
        });
        client.on('messageCreate', (msg) => {
            console.log(`messageCreate recieved message ${JSON.stringify(msg.embeds)}`);
            new messenger_1.Messenger(client, msg, this.cardList);
        });
        client.login(token);
        return client;
    }
}
exports.default = Servo;
//# sourceMappingURL=bot.js.map