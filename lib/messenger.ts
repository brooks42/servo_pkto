import { Client, Embed, EmbedBuilder, Message } from 'discord.js'
import PktoUtils from './pokecube_cards'
import { TextResponse, ImageResponse, PokemonResponse } from './response-types'

export class Messenger {
    pattern = /\[\[([^\]]+)\]\]/g

    promises: Promise<unknown>[]
    client: Client
    msg: Message<boolean>
    pktoList: PktoUtils

    constructor(client: Client, msg: Message<boolean>, pktoList: PktoUtils) {
        console.log("messenger init'd")
        this.promises = []
        this.client = client
        this.msg = msg
        this.pktoList = pktoList

        const matches = msg.content.match(this.pattern)
        if (matches) {
            matches.forEach((match) => {
                const { cardName, responseType, isPokemon, pokemonInfo } =
                    this.negotiateMatch(match)

                if (isPokemon) {
                    console.log("\nwho's that pokemon?")

                    let cardInfo = this.pktoList.responseForCardName(cardName)

                    const promise = this.makePromise(
                        cardName,
                        responseType,
                        cardInfo
                    )
                    this.promises.push(promise)
                } else {
                    const promise = this.makePromise(
                        cardName,
                        responseType,
                        pokemonInfo
                    )
                    this.promises.push(promise)
                }
            })
        }
        Promise.all(this.promises)
            .then((embeds: EmbedBuilder[]) => {
                embeds.forEach((embed) => {
                    this.msg.channel.send({ embeds: [embed] })
                })
            })
            .catch((err) => console.log(err))
    }

    negotiateMatch(match) {
        console.log(`negotiating match for ${match}`)

        let cardName = match.substring(0, match.length - 2).substring(2)

        // if the match is one of the names of a Pokemon card in our cube, return that object
        // else continue to hit scryfall as appropriate

        // for cards in both, like Gloom, we'll prefer our cards over MTG cards unless the user appends (MTG)
        if (!cardName.includes('(MTG)')) {
            if (this.pktoList.cardForName(cardName) != null) {
                console.log(
                    `it's a wild ${JSON.stringify(
                        this.pktoList.cardForName(cardName)
                    )}`
                )
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
        }

        cardName = cardName.replace('MTG', '')

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

    defaultResponseType = TextResponse

    specialResponseTypes = {
        '!': ImageResponse,
    }

    pokemonResponseType = PokemonResponse // TODO: this might be able to just be a special response type?
}
