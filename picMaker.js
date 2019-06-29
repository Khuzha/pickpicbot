async function value (ctx) {
	await ctx.replyWithChatAction('typing')
	const check = ctx.message.text.split('*')
	if ([1, 2].includes(check.length)) {
		let x = Math.round(check[0])
		let y = Math.round(check[1])
		if(Math.abs(x-y) > 190 && (x < 30 || y < 30)) {
			return ctx.reply('Invalid size. Please change resolution')
		} else {
			const url = await get(x, y)
			const keys = {inline_keyboard: [[{ text: '⤴️Share', switch_inline_query: url }]]}
			
			await ctx.reply('Searching...')
			await ctx.replyWithChatAction('upload_photo')
			
			if (!y) y = x

			if (!url) {
				return ctx.reply('Picture not found. Try again')
			}
			
			return ctx.replyWithPhoto('https://picsum.photos/id/' + url, { reply_markup: keys })
		}
	} else {
		return ctx.reply('Invalid query. Try again')
	}
}


async function inline (ctx) {
	const query = ctx.update.inline_query.query
	const checkPic = query.split('/')
	if(checkPic.length === 3) {
		return await bot.telegram.answerInlineQuery(ctx.update.inline_query.id, [{type: 'photo', id: checkPic[0], photo_url: 'https://picsum.photos/id/' + query, thumb_url: 'https://picsum.photos/id/' + query}])
	}
	return await bot.telegram.answerInlineQuery(ctx.update.inline_query.id, [])
}

async function random (ctx) {
	const x = Math.floor(Math.random() * 4096) + 1
	const y = Math.floor(Math.random() * 4096) + 1
	const url = await get(x, y, true)
	const keys = {inline_keyboard: [[{ text: '⤴️Share', switch_inline_query: url }]]}
	
	await ctx.replyWithChatAction('typing')
	await ctx.reply('Searching...')
	await ctx.replyWithChatAction('upload_photo')
	
	return ctx.replyWithPhoto('https://picsum.photos/id/' + url, { reply_markup: keys })
}

async function get (x, y, force = false) {
	let res = ''
	let url = 'https://picsum.photos/' + x + '/' + y
	try {
		res = await axios(url)
		url = res.request.res.responseUrl.split('id/')[1]
	} catch (e) {
		if(force) {
			url = await get(x, y, true)
		} else {
			sendError()
		}
	}
	return url
}

async function start (ctx) {
	const keys = { keyboard: [['Get Random Picture'], ['More Bots', 'Statistics']], resize_keyboard: true }
	return ctx.reply(
		'Hello\n\nJust send me size of picture\n\nExample:\n```200*300\n1000*400\n1920*1080\n100\n200\n20000```',
		{ parse_mode: 'markdown', reply_markup: keys }
	)
}

module.exports = {
  value: value,
  inline: inline,
  random: random,
  get: get,
  start: start
}
