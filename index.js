const Telegraf = require('telegraf')
const mongo = require('mongodb').MongoClient
const axios = require('axios')
const data = require('./data')
const { value, inline, random, get, start } = require('./picMaker.js')

const bot = new Telegraf(data.token)
const db = {}

mongo.connect(data.url, { useNewUrlParser: true }), (error, client) => {
	if (err) {
    		sendError(err)
  	}
	
	db.base = cli.db('pickpicbot')

	bot.start(start)

	bot.hears('Get Random Picture', (ctx) => return random(ctx))
	bot.hears('More Bots', (ctx) => return ctx.reply('@tashpjak'))
	bot.hears('Statistics', (ctx) => return ctx.reply('Coming Soon'))

	bot.on('inline_query', (ctx) => return inline(ctx))
	bot.hears([/^[0-9]{2, 10}*[0-9]{2, 10}$/, /^[0-9]{2, 10}$/], (ctx) => return value(ctx))

	bot.catch((err) => {
		sendError(err)
	})
	
	console.log('Connected')

	bot.launch({})
})


function sendError (err, ctx) {
  if (!ctx) {
    return bot.telegram.sendMessage(data.devId, err)
  }

  bot.telegram.sendMessage(
    data.devId,
    `Error: \nUser: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \nError's text: ${err}`
  )
}
