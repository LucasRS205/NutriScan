// Camada de acesso ao Expo SQLite — armazenamento local para
// funcionamento offline-first.
//
// Usa a API assíncrona do expo-sqlite (SDK 51+), que é a recomendada
// atualmente pela documentação oficial.

import * as SQLite from "expo-sqlite";

let dbInstance = null;

/**
 * Abre (ou cria) o banco local e garante que a tabela exista.
 * Deve ser chamado uma vez na inicialização do app.
 */
export async function initDatabase() {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabaseAsync("nutriscan.db");

  await dbInstance.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS analises_nutricionais (
      id TEXT PRIMARY KEY NOT NULL,
      nome_produto TEXT,
      calorias REAL,
      acucares REAL,
      sodio REAL,
      gorduras_saturadas REAL,
      status TEXT NOT NULL,
      texto_bruto_ocr TEXT,
      imagem_uri TEXT,
      criado_em TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );
  `);

  return dbInstance;
}

function getDb() {
  if (!dbInstance) {
    throw new Error(
      "Banco de dados não inicializado. Chame initDatabase() antes de usar."
    );
  }
  return dbInstance;
}

/**
 * Insere uma nova análise no banco local.
 * @param {object} analise - objeto com os campos da análise (ver schema acima)
 */
export async function inserirAnalise(analise) {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO analises_nutricionais
      (id, nome_produto, calorias, acucares, sodio, gorduras_saturadas, status, texto_bruto_ocr, imagem_uri, criado_em, sincronizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      analise.id,
      analise.nomeProduto,
      analise.calorias,
      analise.acucares,
      analise.sodio,
      analise.gordurasSaturadas,
      analise.status,
      analise.textoBrutoOcr,
      analise.imagemUri,
      analise.criadoEm,
    ]
  );
}

/**
 * Retorna todas as análises salvas localmente, mais recentes primeiro.
 */
export async function listarAnalises() {
  const db = getDb();
  return db.getAllAsync(
    `SELECT * FROM analises_nutricionais ORDER BY criado_em DESC`
  );
}

/**
 * Retorna apenas as análises que ainda não foram sincronizadas com o Supabase.
 */
export async function listarAnalisesPendentes() {
  const db = getDb();
  return db.getAllAsync(
    `SELECT * FROM analises_nutricionais WHERE sincronizado = 0`
  );
}

/**
 * Marca uma análise como sincronizada após o envio bem-sucedido ao Supabase.
 */
export async function marcarComoSincronizado(id) {
  const db = getDb();
  await db.runAsync(
    `UPDATE analises_nutricionais SET sincronizado = 1 WHERE id = ?`,
    [id]
  );
}

/**
 * Remove uma análise do histórico local.
 */
export async function excluirAnalise(id) {
  const db = getDb();
  await db.runAsync(`DELETE FROM analises_nutricionais WHERE id = ?`, [id]);
}
