import express from "express"
import { Telegraf, Markup, session } from "telegraf"
import {getCategorias, getSubCategoria, getCursos} from './cache.js'
const {BOT_TOKEN, CHANNEL_ID, WEBHOOK_DOMAIN, PORT} = process.env

const bot = new Telegraf(BOT_TOKEN)
bot.use(session())
const app = express();

// Set the bot API endpoint
app.use(await bot.createWebhook({ domain: WEBHOOK_DOMAIN }))

const catObj = (id, categoria, subs) => ({
  id: id,
  categoria: categoria,
  subs: subs
})

bot.command('start', async (ctx,) => {
  ctx.session = {
    categorias: [],
    sub: [],
    cursos: [],
    current_cat: 0,
    current_sub: 0,
  }

  ctx.session.categorias = await getCategorias()

  return ctx.reply('<b>Boas Vindas!</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.url('🤑 Fazer doação', 'www.google.com'),
      Markup.button.callback('▶️ Categorias', 'categorias')
    ])
  })
})

bot.action('categorias', async (ctx) => {
  const categorias = await getCategorias()
  ctx.session.categorias = categorias
  ctx.session.sub = [] 
  ctx.session.categorias.forEach(async item => {
       let sub = await getSubCategoria(item.categoria_id)
       const result = catObj(item.categoria_id, item.categoria, sub)
       ctx.session.sub = [...ctx.session.sub, result]
  })

  return ctx.reply('<b>Escolha uma categoria:\n</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      ctx.session.categorias.map(item => {
        return Markup.button.callback(item.categoria, `sub ${item.categoria_id}`)}
    ), {columns: 2})
  })
   }
)

bot.action(/sub (.+)/, async (ctx) => {
  const teste = ctx.session
  if(ctx.session) ctx.session.current_cat = ctx.match[1]
  return ctx.session.sub.map(x => {
    if (x.id == ctx.match[1]) {
      ctx.reply(`<b>${x.categoria}:</b>`, {
        parse_mode: 'HTML',
    ...Markup.inlineKeyboard(x.subs.map(item => {
      return Markup.button.callback(item.subcategoria, `cursos ${item.subcategoria} ${item.sub_id}`)}
    ), {columns: 2})})
  }})
})

bot.action(/cursos (.+)/, async (ctx) => {
  let sub_info = ""
  let option = ""
  const infos = ctx.match[0].split(" ")

  if (infos.length == 3) {
    option = infos[2]
    sub_info = infos[1]
  } else {
    option = infos[infos.length -1]
    for(let i = 1; i < infos.length - 1; i++) {
      sub_info = sub_info + " " + infos[i]
    }
  }

  ctx.session.current_sub = option
  ctx.session.cursos = await getCursos(ctx.session.current_cat, ctx.session.current_sub)

  ctx.reply(`<b>Cursos ${sub_info}:</b>`, {
    parse_mode: 'HTML',
  ...Markup.inlineKeyboard(
    ctx.session.cursos.map(item => {
      return Markup.button.callback(item.nome, `encaminha ${item.message_id}`)}
    ), {columns: 1})}
    )
})

bot.action(/encaminha (.+)/, (ctx) => {
  const mid = ctx.match[1]
  ctx.telegram.forwardMessage(ctx.chat.id, CHANNEL_ID, mid)
})



app.listen(PORT, () => console.log("Listening on port", PORT))