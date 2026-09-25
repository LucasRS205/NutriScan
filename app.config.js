// app.config.js substitui o app.json quando precisamos de lógica em JS,
// como carregar variáveis de ambiente do arquivo .env para dentro do app.
// Requer o pacote "dotenv" (já incluso como dependência indireta do Expo).

require("dotenv").config();

module.exports = {
  expo: {
    name: "NutriScan",
    slug: "nutriscan",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.unifacef.nutriscan",
      infoPlist: {
        NSCameraUsageDescription:
          "O NutriScan usa a câmera para fotografar tabelas nutricionais e identificar os valores dos produtos.",
      },
    },
        android: {
      package: "com.unifacef.nutriscan",
      permissions: ["CAMERA"],
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "O NutriScan usa a câmera para fotografar tabelas nutricionais.",
        },
      ],
    ],
    extra: {
      ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
