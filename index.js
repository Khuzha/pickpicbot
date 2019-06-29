const telegraf = require('telegraf')
const mongo = require('mongodb').MongoClient
const axios = require('axios')
const data = require('./data')

const bot = new telegraf(data.token)
const db = {}

mongo.connect(data.url, {useNewUrlParser: true}).then((cli) => {
	db.base = cli.db('pickpicbot')

	bot.start(start)

	bot.hears('Get Random Picture', (ctx) => return random(ctx))
	bot.hears('More Bots', (ctx) => return more(ctx))
	bot.hears('Statistics', (ctx) => return stat(ctx))

	bot.on('inline_query', (ctx) => return inline(ctx))

	bot.on('text', text)

	bot.catch((err) => {
		console.log(err)
	})
	console.log('Connected')

	return bot.launch({})
})

async function text(ctx) {
	await ctx.replyWithChatAction('typing')
	let check = ctx.message.text.split('*')
	if (check.length === 2 || check.length === 1) {
		let x = parseInt(check[0])
		let y = parseInt(check[1])
		if (isNaN(x)) {
			return ctx.reply('Invalid query. Try again')
		} else if(Math.abs(x-y) > 190 && (x < 30 || y < 30)) {
			return ctx.reply('Invalid size. Please change resolution')
		} else {
			if (isNaN(y)) {
				y = x
			}
			await ctx.reply('Searching...')
			await ctx.replyWithChatAction('upload_photo')
			let url = await get(x, y)
			if (url === null) {
				return ctx.reply('Picture not found. Try again')
			}
			let keys = {inline_keyboard: [[{text: '⤴️Share', switch_inline_query: url}]]}
			return ctx.replyWithPhoto('https://picsum.photos/id/' + url, {reply_markup: keys})
		}
	} else {
		return ctx.reply('Invalid query. Try again')
	}
}

async function inline(ctx) {
	let data = ctx.update.inline_query.query
	let checkPic = data.split('/')
	if(checkPic.length === 3) {
		return await bot.telegram.answerInlineQuery(ctx.update.inline_query.id, [{type: 'photo', id: checkPic[0], photo_url: 'https://picsum.photos/id/' + data, thumb_url: 'https://picsum.photos/id/' + data}])
	}
	return await bot.telegram.answerInlineQuery(ctx.update.inline_query.id, [])
}

async function random(ctx) {
	await ctx.replyWithChatAction('typing')
	await ctx.reply('Searching...')
	let x = Math.floor(Math.random() * 4096) + 1
	let y = Math.floor(Math.random() * 4096) + 1
	await ctx.replyWithChatAction('upload_photo')
	let url = await get(x, y, true)
	let keys = {inline_keyboard: [[{text: '⤴️Share', switch_inline_query: url}]]}
	return await ctx.replyWithPhoto('https://picsum.photos/id/' + url, {reply_markup: keys})
}

async function get(x, y, force = false) {
	let data = ''
	let url = 'https://picsum.photos/' + x + '/' + y
	try {
		data = await axios(url)
		url = data.request.res.responseUrl.split('id/')[1]
	} catch (e) {
		if(force) {
			url = await get(x, y, true)
		} else {
			url = null
		}
	}
	return url
}
async function more(ctx) {
	return await ctx.reply('@tashpjak')

}

async function stat(ctx) {
	return await ctx.reply('Coming Soon')
}

async function start(ctx) {
	let keys = {keyboard: [['Get Random Picture'],['More Bots', 'Statistics']], resize_keyboard: true}
	return await ctx.reply('Hello\n\nJust send me size of picture\n\nExample:\n```200*300\n1000*400\n1920*1080\n100\n200\n20000```', {parse_mode: 'markdown', reply_markup: keys})
}
