import mysql from 'mysql2/promise';
const {HOST,PASSWORD, DATABASE} = process.env;

async function connect() {
  const connection = await mysql.createConnection({
    host: HOST,
    user: 'ubuntu',
    password: PASSWORD,
    database: DATABASE
  });
  global.connection = connection
  return connection
}

connect()

export const selectCategorias = async () => {
  const conn = await connect()
  const [rows] = await conn.query('SELECT * FROM categorias;')
  return rows
}

export const selectSubCategoria = async (cat) => {
  const conn = await connect()
  const [rows] = await conn.query(`SELECT * FROM subcategoria WHERE subcategoria.id_categoria = ${cat}`)
  return rows
}

export const selectCursos = async (cat, sub) => {
  const conn = await connect()
  const [rows] = await conn.query(`SELECT * FROM cursos WHERE cursos.id_categoria = ${cat} AND cursos.id_subcategoria = ${sub}`)
  return rows
}





