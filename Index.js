let transactions = require("./transactions"); // говнокод
const util = require("./util");
const request = require('request');
const fs = require("fs");
const stata = require('./stata.json')
const mongo = require("mongoose");
mongo.connect("");
const QIWI = require("node-qiwi-api").Qiwi;
const wallet = new QIWI("");
const admins = [''];
const User			=		mongo.model("CreatorUser", new mongo.Schema({
	id: Number,
	balance: Number,
	pbalance: Number,
	refbalance: Number,
	bot: Number,
	tb: String,
	cb: String,
	ab: String,
	sb: String,
	pb: Number,
	verif: Number,
	ref: Number,
	menu: String,
	kick: Number,
	adminmenu: String,
	prfUser: String,
	regDate: String,
}));
const Ticket		=		mongo.model("CreatorTicket", new mongo.Schema({
	owner: Number,
	wallet: String,
	pay: String,
	amount: Number
}));
const Bot		=		mongo.model("CreatorBot", new mongo.Schema({
	owner: Number,
	bot: String
}));
const Telegram		=		require("node-telegram-bot-api");
const bot			=		new Telegram(
	"1826189540:AAFZx2HX4S0jOw1RhYKkhTTp8dQ0ihubPr0", // Токен BotFather
	{ polling: true }
);
setInterval(async () => {
wallet.getOperationHistory({
rows: 3,
operation: "IN"
}, async (err, res) => {
res.data.map(async (operation) => {
if(transactions.indexOf(operation.txnId) !== -1) return;
if(!operation.comment) return;
if(!Number(operation.comment)) return;
let user = await User.findOne({ id: operation.comment });
if(!user) return;
bot.sendMessage(user.id, `
✅ Вы успешно пополнили счёт на ${operation.sum.amount}RUB.`);
bot.sendMessage('le govnokod', `
📒 Пополнение на сумму: ${operation.sum.amount}₽ от <a href="tg://user?id=${user.id}">игрока</a>
ПС: Qiwi`, {
				parse_mode: "HTML"
			});
			await User.findOneAndUpdate({ id: user.id }, { $inc: { balance: operation.sum.amount } })
transactions.push(operation.txnId);
require("fs").writeFileSync("./transactions.json", JSON.stringify(transactions, null, "\t"));
let ref = await User.findOne({ id: Number(user.ref) });
			if(!ref) return;
await User.findOneAndUpdate({ id: user.ref }, { $inc: { refbalance: operation.sum.amount*0.15,refz: operation.sum.amount*0.15 } })
bot.sendMessage(user.ref, `
📒 Ваш <a href="tg://user?id=${user.id}">реферал</a> пополнил <b>${operation.sum.amount}</b>, вы получили <b>15%</b>.`, {
				parse_mode: "HTML"
			});
});
});
}, 10000);
const keyboards		=		{
	main: [
		["💼 Заказать бота","🤖 Мои боты"],
		["📲 Мой кабинет","👥 Партнёры"],
		["📒 Информация"],
	],
	cancel: [
		["⛔️ Отмена"]
	],
	admin: [
		["🕹 Рассылка","Накопления"],
		["💸 Баланс", "💳 Инвестиции"],
		["⛔️ Бан","✅ Доступ"],
		["📮 Заявки на вывод","🔊 Статистика"],
		["🔙 Начало","🆔 Информация"]
	]
}
bot.on("message", async (message) => {
		message.send = (text, params) => bot.sendMessage(message.chat.id, text, params);
	User.findOne({ id: message.from.id }).then(async ($user) => {
		if($user) return;

				let schema = {
			id: message.from.id,
			balance: 0,
			pbalance: 0,
			refbalance: 0,
			ref: 0,
			verif: 0,
			tb: "",
			ab: "",
			sb: "",
			cb: "",
			pb: 0,
			bot: 0,
			refz: 0,
			kick: 0,
			menu: "",
			adminmenu: "",
			prfUser: "",
			regDate: `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}`,
		}
							if(Number(message.text.split("/start ")[1])) {
			schema.ref		=		Number(message.text.split("/start ")[1]);
									let user = new User(schema);
			await user.save();
				await message.send(`🤖 Приветствуем Вас в сервисе @MCreator_bot - это бот в телеграм, который представляет вам возможность создать своего коммерческого бота, в несколько кликов.

📊 Максимально понятный интерфейс и быстрая поддержка. Регулярные обновления системы, только для вашего удобства.

Если ты давно хотел открыть своего бота в телеграм и не знал как? То думаю мы - это твой выход.

Чтобы создать бот перейдите в раздел 💼 Заказать бота`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
					let ref = await User.findOne({ id: Number(message.text.split("/start ")[1]) });
					await User.findOneAndUpdate({ id: message.from.id }, { $set: { ref: ref.id } })
			bot.sendMessage(Number(message.text.split("/start ")[1]), `👤 У Вас новый <a href="tg://user?id=${message.from.id}">реферал</a> на 1 уровне!`, {
				parse_mode: "HTML"
			})
			return
			}
		let user = new User(schema);
		await user.save();
	});
	message.user = await User.findOne({ id: message.from.id });
		if(message.text === "⛔️ Отмена" || message.text === "🔙 Начало") {
	
		await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
		await User.findOneAndUpdate({ id: message.user.id }, { $set: { adminmenu: "" } })

		return message.send(`🖥`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	}

if(message.text === "/start") {
		await message.send(`🖥`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	}
	
										if(message.user.menu.startsWith("enterAmount")) {
			message.text = Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите сумму на вывод. Вы можете вывести <b>${message.user.refbalance.toFixed(2)}₽</b>`,{ parse_mode: "HTML" });

			let wallet = (message.user.menu.split("_")[1]);
            let platc = (message.user.menu.split("_")[2]);
			if(message.text > message.user.refbalance) return message.send(`Введите сумму на вывод. Вы можете вывести <b>${message.user.refbalance.toFixed(2)}₽</b>`,{ parse_mode: "HTML" });
			if(message.text < 5) return message.send(`Введите сумму на вывод. Вы можете вывести <b>${message.user.refbalance.toFixed(2)}₽</b>`,{ parse_mode: "HTML" });
			
			else if(message.text <= message.user.refbalance) {
				let ticket = new Ticket({
					owner: message.from.id,
					pay: platc,
					wallet: wallet,
					amount: message.text
				});
	await User.findOneAndUpdate({ id: message.user.id }, { $inc: { refbalance: -message.text } })
				await ticket.save();
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
admins.map((x) => bot.sendMessage(x, `
💵 Новая заявка от <a href="tg://user?id=${ticket.owner}">игрока</a>
📔 Сумма: <code>${ticket.amount}</code> ₽
📤 Платежка: <b>${platc}</b>
💰 Кошелёк: <code>${ticket.wallet}</code>
`, {
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
							[{ text: "✅", callback_data: `awithdraw_${ticket.owner}_${platc}` },{ text: "🚫", callback_data: `declineback${ticket.owner}` }],
					]
				}
			}));
					
				return message.send(`✅ Заявка на выплату создана.`, {
					reply_markup: {
						keyboard: keyboards.main,
						resize_keyboard: true
					}
				});
			}
		}

if(message.user.menu === "inve") {
			message.text = Math.floor(Number(message.text));
			if(!Number(message.text) || message.text < 5) {
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
				return message.send(`⁠⁠🚫 Минимальная сумма обмена 5₽, введите корректную сумму!`) }
				if(message.text > message.user.refbalance) {
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
				return message.send(`⁠⁠🚫 Недостаточно средств!`, {
	parse_mode: "HTML",
	reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
				}) }
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
await User.findOneAndUpdate({ id: message.user.id }, { $inc: { balance: message.text } })
await User.findOneAndUpdate({ id: message.user.id }, { $inc: { refbalance: -message.text } })
			return message.send(`✅ Вы успешно обменяли: <b>${message.user.refbalance}₽</b>`, {
	parse_mode: "HTML",
	reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
				});
			}

		if(message.user.menu.startsWith("qiwi")) {
			
			message.text = message.text;
			let plat = (message.user.menu.split("qiwi")[1]);
			console.log(plat)
			await message.user.set("menu", "enterAmount_" + message.text + plat);
			return message.send(`Введите сумму на вывод. Вы можете вывести <b>${message.user.refbalance.toFixed(2)}₽</b>`,{ parse_mode: "HTML" });
		}
	
				if(message.user.menu === "token") {
					bot.deleteMessage(message.chat.id, message.message_id)
 await User.findOneAndUpdate({ id: message.user.id }, { $set: { tb: message.text } })
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
			await message.send(`✅ Токен обновлен`,{reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}});
			}
			
							if(message.user.menu === "chenel") {
bot.deleteMessage(message.chat.id, message.message_id)
								await User.findOneAndUpdate({ id: message.user.id }, { $set: { cb: message.text } })
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
			await message.send(`✅ Чат обновлен`,{reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}});
			}
										if(message.user.menu === "proc") {
											bot.deleteMessage(message.chat.id, message.message_id)
											let proc = message.text
if(proc > 7 || proc != Number(proc) || proc === 0 || proc < 1) { await message.send(`Введите число от 1 до 7`,{reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}}); 
return User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })}
 await User.findOneAndUpdate({ id: message.user.id }, { $set: { pb: proc } })
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
			await message.send(`✅ Процент обновлен`,{reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}});
			}
			
							if(message.user.menu === "admin") {
								bot.deleteMessage(message.chat.id, message.message_id)
 await User.findOneAndUpdate({ id: message.user.id }, { $set: { ab: message.text } })
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "" } })
			await message.send(`✅ Администратор обновлен`,{reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}});
			}
	
	if(message.text === "📲 Мой кабинет") {
		return message.send(`
		📲 Мой кабинет:
		
🆔 Ваш ID: <code>${message.chat.id}</code>
🤖 Ваших ботов: <b>${message.user.bot}</b>
👤 Заработано с рефералов: <b>${message.user.refz.toFixed(2)}₽</b>

💰 Партнёрский баланс: <b>${message.user.refbalance.toFixed(2)}₽</b>
💳 Основной баланс: <b>${message.user.balance.toFixed(2)}₽</b>`, {
			reply_markup: {
				inline_keyboard: [
						[
							{ text: "💳 Пополнить", callback_data: `popol` },
						    { text: "💳 Вывести", callback_data: `rviv` }
						],
												[
							{ text: "🔄 Конвертировать", callback_data: `rein` },
						],
						]
			},
			parse_mode: "HTML"
		});
	}
		if(message.text === "💼 Заказать бота") {
		return message.send(`
		🤖<b>Выберите интересующий вас бот:</b>

❗<em>️ После заказа бота, вы можете сами через панель управления, производить настройку бота, управлять им и многое другое</em>

<b>Не каких дополнительных знаний не требуется, каждый шаг подробно описан.</b>`, {
			reply_markup: {
				inline_keyboard: [
						[
							{ text: "Ⓜ ML Robot", callback_data: `ml` },
						],
						]
			},
			parse_mode: "HTML"
		});
	}
	if(message.text === "👥 Партнёры") {
		let lvl1		=		await User.find({ ref: message.from.id });	
		return message.send(`👥 <em>Партнёрская программа
Даёт возможность хорошо заработать, с каждого потенциального клиента который купил себе бот вы получаете от 15% от заказа. Все чисто и прозрачно. Вы можете сами просчитывать свой заработок.</em>

👤 Ваши приглашённые:

1 уровень - ${lvl1.length} партнёров - ${message.user.refz.toFixed(2)}₽ заработано

🔗 Ваша партнёрская ссылка: https://t.me/TgBotsCreator_bot?start=${message.user.id}

🎁 Приглашайте партнёров и получайте:
15% от заказа!

💰 Чем больше людей вы приглашаете - тем больше зарабатываете! Удачи! `, {
			parse_mode: "HTML"
		});
		}
				if(message.text === "📒 Информация") {
		return message.send(`
		📒 Информация:`, {
			reply_markup: {
				inline_keyboard: [
						[
							{ text: "📊 Статистика проекта", callback_data: `stata` },
						],
						[
							{ text: "🔊 Новости", url: `t.me/marussia_r` },
							{ text: "👁 Отзывы", url: `t.me/marussia_c` },
						],
						[
						{ text: "🗣 Чат Админов 🛡", callback_data: `chat` },
							{ text: "👩🏼‍💻 Техническая поддержка", callback_data: `tex` },
						],						
						]
			},
			parse_mode: "HTML"
		});
	}
	if(message.text === "🤖 Мои боты") {
		if(message.user.bot === 0) { return message.send(`🤖 <b>У вас ботов: 0</b>

⚠ У вас нет ботов, перейдите в раздел
💼 <b>Заказать бота</b>

<em>После покупки будет доступа панель управления ботами.</em> `,{parse_mode: "HTML"}) }

			var bbtn = [{ text: `⏺ Запуск бота`, callback_data: `zapusk` }]
		if (message.user.tb === "") { return message.send(`<b>⚙ Главные настройки вашего бота:</b>
<b>Бот:</b> не установлен токен
<b>Владелец:</b> ${message.from.first_name.replace(/(\<|\>)/g, '')}

<b>Чат:</b> ${c}
<b>Администратор:</b> ${a}
<b>Токен:</b> ${t}
<b>Процент:</b> ${p}

<em>Здесь вы можете получить информацию о настройках бота и настроить их.</em>  `,{reply_markup: {
				inline_keyboard: [
						[
							{ text: "📰 Чат", callback_data: `chenel` },
							{ text: "🧑🏼‍💻 Администратор", callback_data: `admin` },
						],
						[
						{ text: "💎 Процент", callback_data: `proc` },
							{ text: "🔒 Изменить токен", callback_data: `token` },
						],	
bbtn						
						]
			},
			parse_mode: "HTML"})  }
	else {
		const first			=		new Telegram(
	`${message.user.tb}`, // Токен BotFather
	{ polling: true }
) 
let rt = ``
first.getMe().then(r =>
message.send(`<b>⚙ Главные настройки вашего бота:</b>
<b>Бот:</b> @${r.username}
<b>Владелец:</b> ${message.from.first_name.replace(/(\<|\>)/g, '')}

<b>Чат:</b> ${c}
<b>Администрат
<b>Процент:</b> ${p}

<em>Здесь вы можете получить информацию о настройках бота и настроить их.</em>  `,{reply_markup: {
				inline_keyboard: [
						[
							{ text: "📰 Чат", callback_data: `chenel` },
							{ text: "🧑🏼‍💻 Администратор", callback_data: `admin` },
						],
						[
						{ text: "💎 Процент", callback_data: `proc` },
							{ text: "🔒 Изменить токен", callback_data: `token` },
						],	
bbtn						
						]
			},
			parse_mode: "HTML"}))  }
		
			return
	}
})
	bot.on("callback_query", async (query) => {
	
	const { message } = query;
	message.user = await User.findOne({ id: message.chat.id });
	if(query.data.startsWith("popol")) {
							
					bot.deleteMessage(message.chat.id, message.message_id)

				return bot.sendMessage(message.chat.id,`
		💳 Выберите способ пополнения:

💵 <em>Для пополнения другим способом, обратитесь в техническую поддержку: @codershark</em>
`, {
		reply_markup: {
						inline_keyboard: [
							[{ text: "QIWI", callback_data: `qiwi` }],
						]
					},
parse_mode: "HTML"
});
		}
				if(query.data.startsWith("stata")) {
			bot.deleteMessage(message.chat.id, message.message_id)
				let _twoUser = stata.filter(x => x.id === 'le govnokod')[0]
				return bot.sendMessage(message.chat.id,`
📊 Статистика проекта:

🕜 Работаем дней: ${_twoUser.days}

👥 Всего пользователей: ${_twoUser.polz}
👨🏼‍✈ У нас заработали: ${_twoUser.zarabot}
🚀 Ботов заказано: ${_twoUser.bots}

<em>Общая статистика проектов</em>`, {
parse_mode: "HTML"
});
		}
		if(query.data.startsWith("pmlp")) {
			if (message.user.balance < 1000) return bot.answerCallbackQuery(query.id, `❗ Для покупки не хватает ${1000-message.user.balance}₽
			
			Пополните Ваш баланс любым удобным способом`, true);
			if (message.user.kick === 9) { await bot.unbanChatMember(-'le govnokod', message.user.id) }
			let suser = stata.filter(x => x.id === 'le govnokod')[0]

suser.bots += 1
			await User.findOneAndUpdate({ id: message.user.id }, { $set: { bot: 1 } })
 bot.sendMessage(message.chat.id,`✅ Поздравляем, вы приобрели ML Robot.

Теперь вам нужно его настроить.

Перейдите в раздел 🤖 Мои боты

Вам доступен чат для администраторов ботов.`, {
	reply_markup: {
						inline_keyboard: [
							[{ text: "🗣 Чат Админов 🛡", url: `https://t.YKFje2TRi` }],
						]
					},
parse_mode: "HTML"
});
			}
					if(query.data.startsWith("rviv")) {
			if (message.user.balance < 10) return bot.answerCallbackQuery(query.id, `❗ Минимальная сумма вывода 10₽`, true);
			}
			if(query.data.startsWith("rein")) {
		let user		=		await User.findOne({ id: message.chat.id });
if (message.user.refbalance < 5) return bot.answerCallbackQuery(query.id, '❗ Минимальная сумма обмена 5₽', true);
	 bot.sendMessage(message.chat.id,`♻ Возможен обмен партнерского баланса на основной!

💰 Партнёрский баланс: ${message.user.refbalance.toFixed(2)}₽
💳 Основной баланс: ${message.user.balance.toFixed(2)}₽

Введите сумму обмена:`, {
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});
await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "inve" } })
}
		if(query.data.startsWith("tex")) {
			bot.deleteMessage(message.chat.id, message.message_id)
				return bot.sendMessage(message.chat.id,`
⚠ Обращаться в техническую поддержку в случае:

1. Если обнаружен баг (ошибка).
2. У вас есть деловое предложение.
3. Возник вопрос.

⚠ При обращение пишите свой ID: <code>${message.user.id}</code> и четко формулируйте то, что хотите сказать. В противном случае, можно получить бан.`, {
		reply_markup: {
						inline_keyboard: [
							[{ text: "👩🏼‍💻 Написать", url: `t.me/лохark` }],
						]
					},
parse_mode: "HTML"
});
		}
		
			
		
		if(query.data.startsWith("ver")) {
			bot.deleteMessage(message.chat.id, message.message_id)
fs.unlink(`${message.user.id}@${message.user.bot}.js`, function(err){
if (err) {
console.log(err);
} else {
console.log("Файл удалён");
}
});
let text		=		`let transactions = require("./transactions");
let radmin = ${message.user.id};
const stata = require('./stata.json')
let procbot = ${message.user.pb};
let adminbot = "${message.user.ab}";
let chatbot = "${message.user.cb}";
const { VK, Keyboard } = require('vk-io')
const util = require("./util");
const request = require('request');
const fs = require("fs");
const mongo = require("mongoose");
mongo.connect("mongodb+srcoin0.yfcsz.mongodb.net/vcoin");
const QIWI = require("node-qiwi-api").Qiwi;
const wallet = new QIWI("7da274a7f82886eb23");
const admins = [radmin];
const User			=		mongo.model("${message.user.id}@${message.user.bot}User", new mongo.Schema({
	id: Number,
	balance: Number,
	ref: Number,
	idref: Number,
	epr: Number,
	eps: Number,
	invests: Number,
	epv: Number,
	menu: String,
	adminmenu: String,
	prfUser: String,
	prp: Object,
	akk: Number,
	pakk: Number,
	inv: Number,
	sinv: Number,
	sviv: Number,
	qiwi: Number,
	day: Number,
    oq: String,
	ow: String,
	oe: String,
	or: String,
	ot: String,
	bonusTimer: Number,
	viv: Number,
	regDate: String,
	verify: Boolean
}));

const Invests			=		mongo.model("${message.user.id}@${message.user.bot}Invest", new mongo.Schema({
	id: Number,
	balance: Number,
	zarabotok: Number,
}));

const Ticket		=		mongo.model("${message.user.id}@${message.user.bot}Ticket", new mongo.Schema({
	owner: Number,
	wallet: String,
	pay: String,
	amount: Number
}));

const Ban			=		mongo.model("${message.user.id}@${message.user.bot}Ban", new mongo.Schema({
	id: Number
}));

const Telegram		=		require("node-telegram-bot-api");
const bot			=		new Telegram(
	"${message.user.tb}", // Токен BotFather
	{ polling: true }
);`
await User.findOneAndUpdate({ id: message.user.id }, { $set: { verif: 3 } })
fs.readFile('1.txt', 'utf8', (err, data) => {
if(err) throw err;
text += data
fs.appendFileSync(`${message.user.id}@${message.user.bot}.js`, text);
});
await bot.sendMessage(message.chat.id,`ℹ Бот перезагрузится в течении 10 минут.`, {
parse_mode: "HTML"
});
return bot.sendMessage(message.chat.id,`✅ Перезагрузка <a href="tg://user?id=${message.user.id}">бота</a>.
Название бота на хостинге: <code>${message.user.id}@${message.user.bot}.js</code>

Процент: <code>${message.user.pb}</code>
Админ: <code>${message.user.ab}</code>
Чат: <code>${message.user.cb}</code>
Токен: <code>${message.user.tb}</code>

Команда для перезагрузки: <code>pm2 restart ${message.user.id}@${message.user.bot}.js</code>`, {
	reply_markup: {
						inline_keyboard: [
							[{ text: "⏸", callback_data: `rdont_${message.user.id}` },{ text: "🆗", callback_data: `ryes_${message.user.id}` }],
						]
					},
parse_mode: "HTML"
});
		}
		
		
		if(query.data.startsWith("zapusk")) {
			bot.deleteMessage(message.chat.id, message.message_id)
			if(message.user.verif === 1) return 
			if(message.user.ab === "" || message.user.cb === "" || message.user.tb === "" || message.user.pb === 0) { bot.sendMessage(message.chat.id,`🚫 Не установлены все данные`, {
parse_mode: "HTML"
}); }
let text		=		`let transactions = require("./transactions");
let radmin = ${message.user.id};
const stata = require('./stata.json')
let procbot = ${message.user.pb};
let adminbot = "${message.user.ab}";
let chatbot = "${message.user.cb}";
const { VK, Keyboard } = require('vk-io')
const util = require("./util");
const request = require('request');
const fs = require("fs");
const mongo = require("mongoose");
mongo.connect("mongodb+sr0.yfcsz.mongodb.net/vcoin");
const QIWI = require("node-qiwi-api").Qiwi;
const wallet = new QIWI("7da274e29799a7f82886eb23");
const admins = [radmin];
const User			=		mongo.model("${message.user.id}@${message.user.bot}User", new mongo.Schema({
	id: Number,
	balance: Number,
	ref: Number,
	idref: Number,
	epr: Number,
	eps: Number,
	invests: Number,
	epv: Number,
	menu: String,
	adminmenu: String,
	prfUser: String,
	prp: Object,
	akk: Number,
	pakk: Number,
	inv: Number,
	sinv: Number,
	sviv: Number,
	day: Numbe,
	or: String,
	ot: String,
	bonusTimer: Number,
	viv: Number,
	regDate: String,
	verify: Boolean
}));

const Invests			=		mongo.model("${message.user.id}@${message.user.bot}Invest", new mongo.Schema({
	id: Number,
	balance: Number,
	zarabotok: Number,
}));

const Ticket		=		mongo.model("${message.user.id}@${message.user.bot}Ticket", new mongo.Schema({
	owner: Number,
	wallet: String,
	pay: String,
	amount: Number
}));

const Ban			=		mongo.model("${message.user.id}@${message.user.bot}Ban", new mongo.Schema({
	id: Number
}));

const Telegram		=		require("node-telegram-bot-api");
const bot			=		new Telegram(
	"${message.user.tb}", // Токен BotFather
	{ polling: true }
);`
await User.findOneAndUpdate({ id: message.user.id }, { $set: { verif: 4 } })
fs.readFile('1.txt', 'utf8', (err, data) => {
if(err) throw err;
text += data
fs.appendFileSync(`${message.user.id}@${message.user.bot}.js`, text);
});
await bot.sendMessage(message.chat.id,`ℹ Бот запустится в течении 10 минут.`, {
parse_mode: "HTML"
});
return bot.sendMessage(message.chat.id,`✅ Создан новый <a href="tg://user?id=${message.user.id}">бот</a>.
Название бота на хостинге: <code>${message.user.id}@${message.user.bot}.js</code>

Процент: <code>${message.user.pb}</code>
Админ: <code>${message.user.ab}</code>
Чат: <code>${message.user.cb}</code>
Токен: <code>${message.user.tb}</code>

Команда для запуска: <code>pm2 start ${message.user.id}@${message.user.bot}.js</code>`, {
	reply_markup: {
						inline_keyboard: [
							[{ text: "⏸", callback_data: `dont_${message.user.id}` },{ text: "🆗", callback_data: `yes_${message.user.id}` }],
						]
					},
parse_mode: "HTML"
});
		}
				if(query.data.startsWith("ml")) {
			bot.deleteMessage(message.chat.id, message.message_id)
			return bot.sendMessage(message.chat.id,`Ⓜ Вы выбрали ML Robot

Ⓜ ML Robot - это бот который позволяет:
🗣 Администраторам - создать оборот денег и заработать, выплачивая инвесторам с последующих инвестиций инвесторов.

🚸 Пользователям - даёт возможность заработать, на инвестиция, своих рефералах и другое.

🤖 Пример бота: @MARUSSIA_ROBOT
💳 Цена: <s>2500₽</s>➡<b>1000₽</b>

При правильном подходе, создает хороший оборот денег`, {
	reply_markup: {
						inline_keyboard: [
							[{ text: "✅ Заказать", callback_data: `pmlp` }],
						]
					},
parse_mode: "HTML"
});
			}
			if(query.data.startsWith("chat")) {
				bot.deleteMessage(message.chat.id, message.message_id)
			return bot.sendMessage(message.chat.id,`⚠ <b>Внимание!</b>

Чат создан только Для создателей бот. Там вы можете поделиться опытом, помочь друг другу или высказать свои пожелания по улучшению бота.

Если вы не владелец бота, не пытайтесь вступать, вы можете быть автоматически заблокированы!`, {
	reply_markup: {
						inline_keyboard: [
							[{ text: "🗣 Чат Админов 🛡", url: `https://t.me/join4YKFje2xiNTRi` }],
						]
					},
parse_mode: "HTML"
});
}
if(query.data.startsWith("token")) {
			 bot.sendMessage(message.chat.id,`⚙ Установка Token бота.
⃣ Перейдите в @BotFather, напишите /newbot и введите имя бота
⃣ Введите Username бота, которое должно оканчиваться на Bot

Если Username принят, то вам придет сообщение с Token'ом и Username
Введите Token бота который вам прислали, пример:
<em>1234567890:AAAAABBBBBCCCCCDDDDDFFFFF</em>
🚫 Вводите сразу верно! После изменить будет сложно.`, {
	parse_mode: "HTML",
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});
		await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "token" } })
}

		await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "admin" } })
}
if(query.data.startsWith("proc")) {
			 bot.sendMessage(message.chat.id,`⚙ Установка Процента бота.
⃣ Введите процент прибыли для пользователей, пример:
<em>3.5</em>
🚫 Вводите сразу верно! После изменить будет сложно.`, {
	parse_mode: "HTML",
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});
		await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "proc" } })
}
if(query.data.startsWith("chenel")) {
			 bot.sendMessage(message.chat.id,`⚙ Установка Чата бота.
⃣ Введите ссылки на чат, пример:
<em>t.me/ABCDF</em>
🚫 Вводите сразу верно! После изменить будет сложно.`, {
	parse_mode: "HTML",
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});
		await User.findOneAndUpdate({ id: message.user.id }, { $set: { menu: "chenel" } })
}

if(query.data.startsWith("viv")) {
	let plat		= (query.data.split("_")[1])
	let sbor = ``;
	let p = ``;
 if(plat == `qiwi`) { sbor = `Qiwi Кошелёк`, p = `Вводить номер нужно БЕЗ +` }
            else if (plat == `payeer`) { sbor = `Payeer Кошелёк`, p = `` }
			else if (plat == `kart`) { sbor = `Банковская карта` , p = ``}
			else if (plat == `money`) { sbor = `ЮMoney Кошелёк` , p = ``}
	bot.deleteMessage(message.chat.id, message.message_id)
if(message.user.refbalance < 5) return bot.sendMessage(message.chat.id,`Минимальная сумма вывода: 5₽`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	 bot.sendMessage(message.chat.id,`Введите номер кошелька:
	 Вводить номер нужно без знака +`, {
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});
        await message.user.set("menu", "qiwi_" + sbor);
		console.log(message.user.menu)
}

				if(query.data.startsWith("rviv")) {
							
					bot.deleteMessage(message.chat.id, message.message_id)

				return bot.sendMessage(message.chat.id,`
		Ваш партнерский баланс: <b>${message.user.refbalance}₽</b>
Минимальная сумма для вывода: <b>5₽</b>

Выберете способ вывода:
`, {
		reply_markup: {
						inline_keyboard: [
							[{ text: "🥝 QIWI", callback_data: `viv_qiwi` }],
						]
					},
parse_mode: "HTML"
});
		}

if(query.data.startsWith("yes")) {
			let id			= Number(query.data.split("_")[1])
			await bot.sendMessage(id, "🆗 Бот был включен.");
			await User.findOneAndUpdate({ id: id }, { $set: { verif: 1 } })
			await bot.answerCallbackQuery(query.id, "🆗 Отправил сообщение");
		}
		if(query.data.startsWith("ryes")) {
			let id			= Number(query.data.split("_")[1])
			await bot.sendMessage(id, "🆗 Бот был перезагружаен.");
			await User.findOneAndUpdate({ id: id }, { $set: { verif: 1 } })
			await bot.answerCallbackQuery(query.id, "🆗 Отправил сообщение");
		}
		if(query.data.startsWith("rdont")) {
			let id			= Number(query.data.split("_")[1])
			await User.findOneAndUpdate({ id: id }, { $set: { verif: 1 } })
			await bot.sendMessage(id, "🆗 Бот не прошел модерацию, вам напишет администратор в течении 5 минут");
			await bot.answerCallbackQuery(query.id, "🆗 Отправил сообщение");
		}
		if(query.data.startsWith("stop")) {
			let id			= Number(query.data.split("_")[1])
			await User.findOneAndUpdate({ id: id }, { $set: { verif: 0 } })
			await bot.sendMessage(id, "🆗 Бот был выключен.");
			await bot.answerCallbackQuery(query.id, "🆗 Отправил сообщение");
		}
				if(query.data.startsWith("in")) {
					return bot.answerCallbackQuery(query.id, `ℹ Это информационная кнопка.`, true);
		}

		if(query.data.startsWith("qiwi")) {
			bot.deleteMessage(message.chat.id, message.message_id)
				return bot.sendMessage(message.chat.id,`
🐥Для пополнения Вашего баланса переведите нужную сумму на кошелек Qiwi: <code>+79957847661</code>
В комментарии платежа ОБЯЗАТЕЛЬНО напишите число: <code>${message.user.id}</code>

Если Вы не напишете это число - мы не сможем пополнить Ваш баланс!
После платежа баланс пополнится в течение 1 минуты. Вам придет сообщение.

Или нажмите на кнопку ниже и переведите нужную сумму.`, {
	reply_markup: {
						inline_keyboard: [
							[{ text: "💳 Произвести оплату", url: `https://qiwi.com/payment/form/99?currency=643&extra[%27comment%27]=${message.user.id}&extra[%27account%27]=+7000000001&amountInteger=100&amountFraction=0&blocked[0]=account&blocked[1]=comment` }],
							[{ text: "◀ Назад", callback_data: `popol` }],
						]
					},
parse_mode: "HTML"
});
		}
	})
	async function chat() {
  let userList = await User.find();
await userList.map(async (x) => {
	 if (x.kick === 9 ) return
	 if (x.bot != 0) return
  if ((await bot.getChatMember(-'le govnokod', x.id)).status == "left" ) {
	  return
  }
	else if(x.bot === 0) {
		await User.findOneAndUpdate({ id: x.id }, { $set: { kick: 9 } })
	await bot.kickChatMember(-'le govnokod', x.id)
  return bot.sendMessage(x.id,`<b>⚠ Чат доступен только клиентам!</b>`,{parse_mode: "HTML"})
  }
  
 })
}

setInterval(async() => {
fs.writeFileSync("./stata.json", JSON.stringify(stata, null, "\t"))
}, 60000);

setInterval(async() => {
  chat(); 
}, 5000); 