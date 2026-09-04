// Serviço responsável pela ETAPA 4 (Extração de Características) do pipeline:
// recebe o texto bruto do OCR (que vem como um bloco de texto corrido, sem
// estrutura de campos) e tenta localizar os valores de calorias, açúcares,
// sódio e gorduras saturadas.
//
// IMPORTANTE: tabelas nutricionais variam MUITO entre marcas (ordem das
// linhas, abreviações, unidades). Os regex abaixo cobrem os padrões mais
// comuns encontrados em rótulos brasileiros, mas quase certamente vão
// precisar de ajustes conforme vocês testarem com produtos reais.
// Ver README.md > "Ajustando o parser" para instruções.

/**
 * Normaliza o texto: remove acentos, deixa em minúsculas, unifica espaços.
 * Isso torna os regex mais robustos a variações de OCR (ex: "Açúcares"
 * pode vir como "Acucares", "AÇÚCARES", "Açucares" etc.)
 */
function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Extrai o primeiro número (com vírgula ou ponto decimal) encontrado
 * logo após uma palavra-chave, dentro de uma janela de caracteres.
 */
function extractNumberNear(text, keywords, windowSize = 40) {
  for (const keyword of keywords) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex === -1) continue;

    const windowText = text.slice(
      keywordIndex,
      keywordIndex + keyword.length + windowSize
    );

    // Captura números tipo "12", "12,5", "12.5", ignorando o que vem depois
    // (mg, g, kcal, %, etc. são descartados aqui e tratados por contexto).
    const match = windowText.match(/(\d+[.,]?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(",", "."));
    }
  }
  return null;
}

/**
 * Recebe o texto bruto do OCR e retorna um objeto estruturado com os
 * valores nutricionais encontrados (ou null quando não encontrado).
 *
 * @param {string} rawText - texto retornado pela API de OCR
 * @returns {{
 *   calorias: number|null,
 *   acucares: number|null,
 *   sodio: number|null,
 *   gordurasSaturadas: number|null
 * }}
 */
export function parseNutritionalInfo(rawText) {
  if (!rawText) {
    return { calorias: null, acucares: null, sodio: null, gordurasSaturadas: null };
  }

  const text = normalize(rawText);

  const calorias = extractNumberNear(text, [
    "valor energetico",
    "calorias",
    "energia",
  ]);

  const acucares = extractNumberNear(text, [
    "acucares totais",
    "acucares adicionados",
    "acucares",
    "carboidratos totais", // fallback quando "acucares" não aparece separado
  ]);

  const sodio = extractNumberNear(text, ["sodio"]);

  const gordurasSaturadas = extractNumberNear(text, [
    "gorduras saturadas",
    "gordura saturada",
    "gord. saturadas",
    "gord saturadas",
  ]);

  return { calorias, acucares, sodio, gordurasSaturadas };
}

/**
 * Tenta extrair um possível nome de produto a partir da primeira linha
 * "significativa" do texto (heurística simples: primeira linha com mais
 * de 3 caracteres que não seja puramente numérica).
 * Isso é apenas cosmético para exibição — não afeta a classificação.
 */
export function guessProductName(rawText) {
  if (!rawText) return "Produto não identificado";

  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && !/^\d+([.,]\d+)?\s*$/.test(l));

  return lines[0] || "Produto não identificado";
}
