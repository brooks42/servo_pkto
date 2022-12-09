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

        // TODO: write a promise that downloads the XML file and then loads it into JSON
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
        return this.cards.filter((card) => {
            return card.name.toLowerCase() === name.toLowerCase()
        })
    }
}

module.exports = PktoUtils
