const telegraf = require('telegraf')
const mongo = require('mongodb').MongoClient
const data = require('./data')

const bot = new telegraf(data.token)
const db = {}
mongo.connect(data.url, {useNewUrlParser: true}).then((cli) => {
	db.base = cli.db('pickpicbot')

	bot.start(start)

	console.log('Connected')
	return bot.launch({})
})

async function start(ctx) {
	console.log(ctx.updateType)
}