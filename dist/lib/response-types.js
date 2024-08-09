"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonResponse = exports.ImageResponse = exports.TextResponse = void 0;
const request = require('request-promise-native');
const Url = require('urijs');
const manamoji_1 = __importDefault(require("./middleware/manamoji"));
const utm = require('./middleware/utm');
const discord_js_1 = require("discord.js");
class TextResponse {
    client;
    cardName;
    middleware = [utm];
    url = 'https://api.scryfall.com/cards/named';
    constructor(client, cardName) {
        this.client = client;
        this.cardName = cardName;
    }
    makeQuerystring() {
        return {
            fuzzy: this.cardName,
            format: 'text',
        };
    }
    makeUrl() {
        return Url(this.url).query(this.makeQuerystring()).toString();
    }
    makeRequest() {
        return new Promise((resolve, reject) => {
            request({
                method: 'GET',
                resolveWithFullResponse: true,
                uri: this.makeUrl(),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
                    'Accept': 'application/json;q=0.9,*/*;q=0.8'
                },
            })
                .then((response) => {
                resolve(response);
            })
                .catch((err) => {
                resolve(err.response);
            });
        });
    }
    makeEmbed(response) {
        let parts = response.body.split('\n');
        const embedTitle = parts.shift();
        console.log(`embedding TextResponse ${parts}`);
        let embed = new discord_js_1.EmbedBuilder();
        embed.setTitle((0, manamoji_1.default)(this.client, embedTitle));
        embed.setDescription((0, manamoji_1.default)(this.client, parts.join('\n')));
        embed.setURL(response.headers['x-scryfall-card']);
        embed.setThumbnail(response.headers['x-scryfall-card-image']);
        return embed;
    }
    embed() {
        return new Promise((resolve, reject) => {
            this.makeRequest().then((response) => {
                let embed = this.makeEmbed(response);
                this.middleware.length > 0 &&
                    this.middleware.forEach((mw) => {
                        embed = mw(this.client, embed);
                    });
                resolve(embed);
            });
        });
    }
}
exports.TextResponse = TextResponse;
class ImageResponse extends TextResponse {
    makeEmbed(response) {
        let parts = response.body.split('\n');
        let embed = new discord_js_1.EmbedBuilder();
        embed.setTitle((0, manamoji_1.default)(this.client, parts[0].match(/^([^{]+)/)[0].trim()));
        embed.setDescription('');
        embed.setURL(response.headers['x-scryfall-card']);
        embed.setThumbnail(response.headers['x-scryfall-card-image']);
        embed.setImage(response.headers['x-scryfall-card-image']);
        return embed;
    }
}
exports.ImageResponse = ImageResponse;
class PokemonResponse extends TextResponse {
    cardInfo;
    constructor(client, cardName, cardInfo) {
        super(client, cardName);
        this.cardInfo = cardInfo;
    }
    /*{Expectation:
  title: 'Murder {1}{B}{B}',
  description: 'Instant\nDestroy target creature.',
  url: 'https://scryfall.com/card/clb/134/murder?utm_source=api',
  thumbnail: {
    url: 'https://cards.scryfall.io/large/front/b/d/bdef7fea-2bd0-42a2-96f6-6def18bd7f0c.jpg?1660725345'
  }
}*/
    embed() {
        return new Promise((resolve, reject) => {
            this.makeRequest().then((response) => {
                let embed = this.makeEmbed(this.cardInfo);
                this.middleware.length > 0 &&
                    this.middleware.forEach((mw) => {
                        embed = mw(this.client, embed);
                    });
                resolve(embed);
            });
        });
    }
    makeEmbed(cardInfo) {
        console.log(`embedding PokemonResponse ${JSON.stringify(cardInfo)}`);
        let embed = new discord_js_1.EmbedBuilder();
        embed.setTitle((0, manamoji_1.default)(this.client, cardInfo.title));
        embed.setDescription((0, manamoji_1.default)(this.client, cardInfo.description));
        embed.setURL(cardInfo.url);
        embed.setThumbnail(cardInfo.thumbnail);
        return embed;
    }
}
exports.PokemonResponse = PokemonResponse;
//# sourceMappingURL=response-types.js.map