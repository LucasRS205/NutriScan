// Serviço responsável por enviar a imagem capturada
// para o OCR.space e retornar o texto reconhecido.

import { File } from "expo-file-system";

import {
  OCR_SPACE_API_KEY,
  OCR_SPACE_ENDPOINT,
} from "../config/ocr";

/**
 * Envia uma foto para o OCR.space e retorna
 * o texto bruto extraído da imagem.
 *
 * @param {string} imageUri - URI local da foto capturada
 * @returns {Promise<string>} texto bruto extraído
 */
export async function extractTextFromImage(imageUri) {
  if (!OCR_SPACE_API_KEY) {
    throw new Error(
      "Chave do OCR.space não configurada. Verifique o arquivo .env."
    );
  }

  // Lê a imagem capturada e converte para Base64
  const file = new File(imageUri);
  const base64Image = await file.base64();

  // O OCR.space espera o prefixo indicando o tipo da imagem.
  const base64Data = `data:image/jpeg;base64,${base64Image}`;

  const formData = new FormData();

  formData.append("base64Image", base64Data);
  formData.append("language", "por");
  formData.append("OCREngine", "2");
  formData.append("isTable", "true");
  formData.append("isOverlayRequired", "false");

  const response = await fetch(OCR_SPACE_ENDPOINT, {
    method: "POST",
    headers: {
      apikey: OCR_SPACE_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Erro na API do OCR.space (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  // Verifica erros reportados pela própria API
  if (data.IsErroredOnProcessing) {
    const mensagem =
      Array.isArray(data.ErrorMessage)
        ? data.ErrorMessage.join(" ")
        : data.ErrorMessage || "Erro desconhecido no processamento.";

    throw new Error(`OCR.space: ${mensagem}`);
  }

  // Junta o texto de todos os resultados retornados
  const texto = (data.ParsedResults || [])
    .map((resultado) => resultado.ParsedText || "")
    .join("\n");

  return texto.trim();
}