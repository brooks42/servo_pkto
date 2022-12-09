const ResponseTypes = require('./response-types')
const xml2json = require('xml2json')
const request = require('request-promise-native')

class PktoUtils {
    constructor() {
        this.downloadPokecubeCardlist()
    }

    async downloadPokecubeCardlist() {
        console.log('downloading pokemon cards')

        let xml = await this.downloadPokecubeCardXml()

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

    cardForName(name) {
        var array = this.cards.filter((card) => {
            return card.name.toLowerCase() === name.toLowerCase()
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
            title: `${name} ${this.transformManaCost(card.manacost)}`,
            description: `${card.type}\n${card.text}`,
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
        return cost
    }
}

module.exports = PktoUtils