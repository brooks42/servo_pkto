"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pokecube_cards_1 = __importDefault(require("./pokecube_cards"));
const discord_js_1 = require("discord.js");
const messenger_1 = require("./messenger");
class Servo {
    constructor(token) {
        console.log('pokédex client init');
        this.token = token;
        this.client = this.makeClient(token);
        this.cardList = new pokecube_cards_1.default();
    }
    makeClient(token) {
        const clientOptions = { intents: [] };
        const client = new discord_js_1.Client(clientOptions);
        client.on('message', (msg) => {
            new messenger_1.Messenger(client, msg, this.cardList);
        });
        client.login(token);
        return client;
    }
}
exports.default = Servo;
//# sourceMappingURL=bot.js.map