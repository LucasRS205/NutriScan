import Constants from "expo-constants";

export const GOOGLE_CLOUD_VISION_API_KEY =
  Constants.expoConfig.extra.googleCloudVisionApiKey;

export const GOOGLE_CLOUD_VISION_ENDPOINT =
  "https://vision.googleapis.com/v1/images:annotate";

if (!GOOGLE_CLOUD_VISION_API_KEY) {
  console.warn(
    "[OCR] GOOGLE_CLOUD_VISION_API_KEY não configurada. " +
      "Verifique o arquivo .env na raiz do projeto."
  );
}
