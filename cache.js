import Redis from 'ioredis';
const redis = new Redis()
import {selectCategorias, selectSubCategoria, selectCursos} from './db.js';




export const getCategorias = async ()  => {
  let categorias = []

  const chave_categorias = 'categorias'
  
  const categorias_cache = await redis.get(chave_categorias)

  if(!categorias_cache) {
    const categorias_db = await selectCategorias()
    console.log(categorias_db)
    redis.set(chave_categorias, JSON.stringify(categorias_db))
    categorias = categorias_db
  } else {
    categorias = JSON.parse(categorias_cache)
  }

  return categorias
}

export const getSubCategoria = async (cat)  => {
  let sub_categoria = []

  const chave_sub_categoria = `sub_categoria_${cat}`
  
  const sub_categoria_cache = await redis.get(chave_sub_categoria)

  if(!sub_categoria_cache) {
    const sub_categoria_db = await selectSubCategoria(cat)
    redis.set(chave_sub_categoria, JSON.stringify(sub_categoria_db), "EX", 60*5)
    sub_categoria = sub_categoria_db
  } else {
    sub_categoria = JSON.parse(sub_categoria_cache)
  }

  return sub_categoria
}

export const getCursos = async (cat, sub)  => {
  let cursos = []

  const chave_cursos = `cursos_${cat}_${sub}`
  
  const cursos_cache = await redis.get(chave_cursos)

  if(!cursos_cache) {
    const cursos_db = await selectCursos(cat, sub)
    redis.set(chave_cursos, JSON.stringify(cursos_db), "EX", 60*5)
    cursos = cursos_db
  } else {
    cursos = JSON.parse(cursos_cache)
  }

  return cursos
}