import Constants from "expo-constants";

export const OCR_SPACE_API_KEY =
  Constants.expoConfig.extra.ocrSpaceApiKey;

export const OCR_SPACE_ENDPOINT =
  "https://api.ocr.space/parse/image";

if (!OCR_SPACE_API_KEY) {
  console.warn(
    "[OCR] OCR_SPACE_API_KEY não configurada. " +
      "Verifique o arquivo .env na raiz do projeto."
  );
}