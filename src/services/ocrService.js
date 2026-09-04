// Serviço responsável pela ETAPA 1 (Aquisição) já feita pela câmera,
// e pela ETAPA 3 (Segmentação) do pipeline de Visão Computacional:
// envia a imagem para a API do Google Cloud Vision e recebe de volta
// o texto detectado na imagem (OCR).

import { File } from "expo-file-system";
import { GOOGLE_CLOUD_VISION_API_KEY, GOOGLE_CLOUD_VISION_ENDPOINT } from "../config/ocr";

/**
 * Envia uma foto (URI local do dispositivo) para a API do Google Cloud Vision
 * e retorna o texto bruto extraído da imagem.
 *
 * @param {string} imageUri - URI local da foto capturada pela câmera (ex: file://...)
 * @returns {Promise<string>} texto bruto extraído da imagem
 */
export async function extractTextFromImage(imageUri) {
  if (!GOOGLE_CLOUD_VISION_API_KEY) {
    throw new Error(
      "Chave de API do Google Cloud Vision não configurada. Verifique o arquivo .env."
    );
  }

  const file = new File(imageUri);
  const base64Image = await file.base64();

  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
        imageContext: { languageHints: ["pt"] },
      },
    ],
  };

  const response = await fetch(
    `${GOOGLE_CLOUD_VISION_ENDPOINT}?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API de OCR (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const annotation = data.responses?.[0]?.fullTextAnnotation;

  if (!annotation || !annotation.text) {
    // A API respondeu, mas não encontrou texto na imagem.
    return "";
  }

  return annotation.text;
}
