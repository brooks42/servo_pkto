const ResponseTypes = require('./response-types')
const xml2json = require('xml2json')
const request = require('request-promise-native')

class PktoUtils {
    constructor() {
        this.downloadPokecubeCardlist()
    }

    async downloadPokecubeCardlist() {
        console.log('downloading pokemon cards')

        // the PJTO card XML contains all of the cards across both PKTO and PJTO
        let xml = await this.downloadPJTOPokecubeCardXml()

        this.pokecubeFile = xml2json.toJson(xml, { object: true })

        this.cards = this.pokecubeFile.cockatrice_carddatabase.cards.card
    }

    async downloadPokecubeCardXml() {
        var xml = null

        await new Promise((resolve, reject) => {
            request({
                method: 'GET',
                resolveWithFullResponse: true,
                uri: 'https://brooks42.github.io/pkto/pkto_cockatrice.xml',
            })
                .then((response) => {
                    console.log(`got cockatrice file`)
                    xml = response.body
                    resolve(response)
                })
                .catch((err) => {
                    console.log(
                        `failed to load cockatrice file with error ${err}`
                    )
                    resolve(err.response)
                })
        })

        return xml
    }

    async downloadPJTOPokecubeCardXml() {
        var xml = null

        await new Promise((resolve, reject) => {
            request({
                method: 'GET',
                resolveWithFullResponse: true,
                uri: 'https://brooks42.github.io/pjto/pjto_cockatrice.xml',
            })
                .then((response) => {
                    console.log(`got PJTO cockatrice file`)
                    xml = response.body
                    resolve(response)
                })
                .catch((err) => {
                    console.log(
                        `failed to load PJTO cockatrice file with error ${err}`
                    )
                    resolve(err.response)
                })
        })

        return xml
    }

    cardForName(name) {

        if (name.includes("(MTG)")) {
            return null
        }

        // check whether the card name is in our list, or if the card name + (PKTO) is in the list for cards like Gloom
        var array = this.cards.filter((card) => {
            return card.name.toLowerCase() === name.toLowerCase() || card.name.toLowerCase() === `${name.toLowerCase()} (pkto)`
        })

        if (array.length >= 1) {
            return array
        }

        return null // no matches
    }

    responseForCardName(name) {
        var card = this.cardForName(name)[0]

        console.log(JSON.stringify(card))

        return {
            title: `${name} ${this.transformManaCost(card.manacost ?? "")}`,
            description: `${card.type}\n${card.text}\n${card.pt ?? ''}`,
            url: card.set.picURL,
            thumbnail: {
                url: card.set.picURL,
            },
        }

        /*		<card>
            <name>Squirtle</name>
            <set picURL="https://brooks42.github.io/pkto/cards/Squirtle.png" rarity="common">PKTO</set>
            <color>U</color>
            <manacost>U</manacost>
            <type>Pokémon - Water</type>
            <pt>1/2</pt>
            <tablerow>2</tablerow>
            <side>front</side>
            <related attach="attach">Wartortle (DFC)</related>
            <text>{U}: Squirtle gets +0/+1 until end of turn.
{1}{U}: Evolve</text>
        </card>*/
    }

    transformManaCost(cost) {

        var components = []
        if (typeof cost === 'string') {
            components = cost.split('')
        }

        var transformed = ''

        var parsingHybrid = false
        var parsingNumber = false
        var currentSymbol = ''
        var lastElement = ''

        for (var letter of components) {
            var symbolFinished = false
            console.log(`letter = ${letter}`)

            if (letter === '{') {
                parsingHybrid = true
                currentSymbol += letter
            } else if (letter === '}') {
                parsingHybrid = false
                currentSymbol += letter
                symbolFinished = true
            } else {
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
                currentSymbol += letter
                if (!parsingHybrid) {
                    symbolFinished = true
                }
                // }
            }

            lastElement = letter

            if (symbolFinished) {
                console.log(`tranformed to ${currentSymbol}`)
                var element = `${currentSymbol.startsWith('{') ? '' : '{'
                    }${currentSymbol}${currentSymbol.endsWith('}') ? '' : '}'}`
                transformed += element
                currentSymbol = ''
            }
        }

        console.log(`mana cost is ${transformed}`)

        return transformed
    }
}

module.exports = PktoUtils
