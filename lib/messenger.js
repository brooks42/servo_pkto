const ResponseTypes = require('./response-types')

class Messenger {
    constructor(client, msg, pktoList) {
        this.promises = []
        this.client = client
        this.msg = msg
        this.pattern = /\[\[([^\]]+)\]\]/g
        this.pktoList = pktoList

        const matches = msg.content.match(this.pattern)
        if (matches) {
            matches.forEach((match) => {
                const { cardName, responseType, isPokemon, pokemonCardInfo } =
                    this.negotiateMatch(match)

                if (isPokemon) {
                    console.log("who's that pokemon")

                    let cardInfo = this.pktoList.responseForCardName(cardName)

                    const promise = this.makePromise(
                        cardName,
                        responseType,
                        cardInfo
                    )
                    this.promises.push(promise)
                } else {
                    const promise = this.makePromise(cardName, responseType)
                    this.promises.push(promise)
                }
            })
        }
        Promise.all(this.promises)
            .then((embeds) => {
                embeds.forEach((embed) => {
                    this.msg.channel.sendEmbed(embed)
                })
            })
            .catch((err) => console.log(err))
    }

    negotiateMatch(match) {
        console.log(`negotiating match for ${match}`)

        let cardName = match.substring(0, match.length - 2).substring(2)

        // if the match is one of the names of a Pokemon card in our cube, return that object
        // else continue to hit scryfall as appropriate
        if (this.pktoList.cardForName(cardName) != null) {
            console.log(`it's a wild ${this.pktoList.cardForName(cardName)}`)
            var result = this.pktoList.responseForCardName(cardName)
            return {
                cardName,
                responseType: this.pokemonResponseType,
                isPokemon: true,
                pokemonInfo: result,
            }
        } else {
            console.log(`failed to match ${match}`)
        }

        let responseType = this.defaultResponseType
        const token = cardName.slice(0, 1)
        if (token in this.specialResponseTypes) {
            cardName = cardName.slice(1)
            responseType = this.specialResponseTypes[token]
        }
        console.log(
            `match returning ${JSON.stringify({ cardName, responseType })}`
        )
        return { cardName, responseType, isPokemon: false }
    }

    makePromise(cardName, responseType, pokemonCardInfo) {
        return new Promise((resolve, reject) => {
            try {
                new responseType(this.client, cardName, pokemonCardInfo)
                    .embed()
                    .then((embed) => {
                        resolve(embed)
                    })
            } catch (err) {
                reject(err)
            }
        })
    }
}

Messenger.prototype.defaultResponseType = ResponseTypes.TextResponse
Messenger.prototype.specialResponseTypes = {
    '!': ResponseTypes.ImageResponse,
}
Messenger.prototype.pokemonResponseType = ResponseTypes.PokemonResponse // TODO: this might be able to just be a special response type?

module.exports = Messenger
