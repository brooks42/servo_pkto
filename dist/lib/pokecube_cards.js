"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xml2json_1 = __importDefault(require("xml2json"));
const request_promise_native_1 = __importDefault(require("request-promise-native"));
class PktoUtils {
    constructor() {
        this.downloadPokecubeCardlist();
    }
    downloadPokecubeCardlist() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('downloading pokemon cards');
            // the PJTO card XML contains all of the cards across both PKTO and PJTO
            let xml = yield this.downloadPJTOPokecubeCardXml();
            this.pokecubeFile = xml2json_1.default.toJson(xml, { object: true });
            this.cards = this.pokecubeFile.cockatrice_carddatabase.cards.card;
        });
    }
    downloadPokecubeCardXml() {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = null;
            yield new Promise((resolve, reject) => {
                (0, request_promise_native_1.default)({
                    method: 'GET',
                    resolveWithFullResponse: true,
                    uri: 'https://brooks42.github.io/pkto/pkto_cockatrice.xml',
                })
                    .then((response) => {
                    console.log(`got cockatrice file`);
                    xml = response.body;
                    resolve(response);
                })
                    .catch((err) => {
                    console.log(`failed to load cockatrice file with error ${err}`);
                    resolve(err.response);
                });
            });
            return xml;
        });
    }
    downloadPJTOPokecubeCardXml() {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = null;
            yield new Promise((resolve, reject) => {
                (0, request_promise_native_1.default)({
                    method: 'GET',
                    resolveWithFullResponse: true,
                    uri: 'https://brooks42.github.io/pjto/pjto_cockatrice.xml',
                })
                    .then((response) => {
                    console.log(`got PJTO cockatrice file`);
                    xml = response.body;
                    resolve(response);
                })
                    .catch((err) => {
                    console.log(`failed to load PJTO cockatrice file with error ${err}`);
                    resolve(err.response);
                });
            });
            return xml;
        });
    }
    cardForName(name) {
        if (name.includes('(MTG)')) {
            return null;
        }
        // check whether the card name is in our list, or if the card name + (PKTO) is in the list for cards like Gloom
        var array = this.cards.filter((card) => {
            return (card.name.toLowerCase() === name.toLowerCase() ||
                card.name.toLowerCase() === `${name.toLowerCase()} (pkto)`);
        });
        if (array.length >= 1) {
            return array;
        }
        return null; // no matches
    }
    responseForCardName(name) {
        var _a, _b;
        var card = this.cardForName(name)[0];
        console.log(JSON.stringify(card));
        return {
            title: `${card.name} ${this.transformManaCost((_a = card.prop.manacost) !== null && _a !== void 0 ? _a : '')}`,
            description: `${card.prop.type}\n${card.text}\n${(_b = card.prop.pt) !== null && _b !== void 0 ? _b : ''}`,
            url: card.set.picURL,
            thumbnail: {
                url: card.set.picURL,
            },
        };
        /*
            <card>
        <name>Squirtle</name>
        <set picURL="https://brooks42.github.io/pkto/cards/Squirtle.png" rarity="common">PKTO</set>
        <tablerow>2</tablerow>
        <related attach="transform">Wartortle (DFC)</related>
        <text>{U}: Squirtle gets +0/+1 until end of turn.
{1}{U}: Evolve</text>
        <prop>
        <type>Pokémon - Water</type>
        <maintype>Pokémon</maintype>
        <cmc>1</cmc>
        <side>front</side>
        <colors>U</colors>
        <manacost>U</manacost>
        <pt>1/2</pt>
        </prop>
    </card>
        */
    }
    transformManaCost(cost) {
        var components = [];
        if (typeof cost === 'string') {
            components = cost.split('');
        }
        var transformed = '';
        var parsingHybrid = false;
        var parsingNumber = false;
        var currentSymbol = '';
        var lastElement = '';
        for (var letter of components) {
            var symbolFinished = false;
            console.log(`letter = ${letter}`);
            if (letter === '{') {
                parsingHybrid = true;
                currentSymbol += letter;
            }
            else if (letter === '}') {
                parsingHybrid = false;
                currentSymbol += letter;
                symbolFinished = true;
            }
            else {
                // TODO: check for 10+ mana cost example
                // if (!parsingHybrid) {
                //     if (letter in [1234567890]) {
                //         if (parsingNumber) {
                //             currentSymbol += `${letter}`
                //         } else {
                //             parsingNumber = true
                //         }
                //     } else {
                //         if (parsingNumber) {
                //             parsingNumber = false
                //             symbolFinished = true
                //         }
                //     }
                // } else {
                currentSymbol += letter;
                if (!parsingHybrid) {
                    symbolFinished = true;
                }
                // }
            }
            lastElement = letter;
            if (symbolFinished) {
                console.log(`tranformed to ${currentSymbol}`);
                var element = `${currentSymbol.startsWith('{') ? '' : '{'}${currentSymbol}${currentSymbol.endsWith('}') ? '' : '}'}`;
                transformed += element;
                currentSymbol = '';
            }
        }
        console.log(`mana cost is ${transformed}`);
        return transformed;
    }
}
exports.default = PktoUtils;
//# sourceMappingURL=pokecube_cards.js.map