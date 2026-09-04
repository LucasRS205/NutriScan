# NutriScan

Aplicativo mobile que fotografa a tabela nutricional de um produto, extrai os
valores via OCR e classifica o produto como **Saudável**, **Moderado** ou
**Evitar**, com histórico offline-first sincronizado no Supabase.

Projeto acadêmico — disciplina de Visão Computacional.

---

## 1. Pré-requisitos

- Node.js 18 ou superior instalado
- Conta gratuita no [Expo](https://expo.dev) (opcional, mas recomendado)
- App **Expo Go** instalado no celular (Android/iOS) para testar sem precisar
  compilar nativamente
- Conta no [Google Cloud](https://console.cloud.google.com) com a **Cloud
  Vision API** ativada
- Conta no [Supabase](https://supabase.com)

---

## 2. Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de variáveis de ambiente e preencha com suas chaves
cp .env.example .env
```

Abra o arquivo `.env` e preencha:

```
GOOGLE_CLOUD_VISION_API_KEY=sua_chave_aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### Como obter a chave do Google Cloud Vision

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto (ou use um existente)
3. Vá em **APIs e Serviços > Biblioteca**, procure por "Cloud Vision API" e
   clique em **Ativar**
4. Vá em **APIs e Serviços > Credenciais > Criar credenciais > Chave de API**
5. Copie a chave gerada para o `.env`

> ⚠️ O tier gratuito do Google Cloud Vision cobre 1.000 unidades de OCR por
> mês. Verifique o consumo em **APIs e Serviços > Painel** durante os testes
> para não ser pego de surpresa perto da apresentação.

### Como obter as credenciais do Supabase

1. Acesse https://supabase.com e crie um novo projeto
2. Vá em **Project Settings > API**
3. Copie a **Project URL** (`SUPABASE_URL`) e a chave **anon public**
   (`SUPABASE_ANON_KEY`)
4. Vá em **SQL Editor**, abra uma nova query, cole o conteúdo do arquivo
   `supabase/schema.sql` deste projeto e clique em **Run**

---

## 3. Executando o projeto

```bash
npx expo start
```

Escaneie o QR code exibido no terminal com o app **Expo Go** (Android) ou
com a câmera do iPhone (iOS). O app deve abrir direto na tela de câmera.

---

## 4. Estrutura do projeto

```
nutriscan/
├── App.js                        # Ponto de entrada: inicializa banco e sync
├── app.config.js                 # Configuração do Expo + variáveis de ambiente
├── .env.example                  # Modelo do arquivo de variáveis de ambiente
├── src/
│   ├── config/
│   │   ├── supabase.js           # Cliente do Supabase
│   │   └── ocr.js                # Configuração da API do Google Cloud Vision
│   ├── database/
│   │   └── db.js                 # Camada de acesso ao Expo SQLite
│   ├── services/
│   │   ├── ocrService.js         # Envia imagem para a API de OCR
│   │   ├── parserService.js      # Extrai valores nutricionais do texto bruto
│   │   ├── classificationService.js  # Regras de classificação do produto
│   │   └── syncService.js        # Sincronização offline-first com Supabase
│   ├── screens/
│   │   ├── CameraScreen.js       # Tela de captura da foto
│   │   ├── ResultScreen.js       # Tela de resultado da análise
│   │   └── HistoryScreen.js      # Tela de histórico
│   ├── navigation/
│   │   └── AppNavigator.js       # Configuração de rotas
│   └── utils/
│       └── uuid.js               # Geração de IDs únicos
└── supabase/
    └── schema.sql                # Script de criação das tabelas no Supabase
```

---

## 5. Pipeline de Visão Computacional (onde está cada etapa no código)

| Etapa                          | Arquivo                                    |
|---------------------------------|---------------------------------------------|
| 1. Aquisição de Imagem          | `src/screens/CameraScreen.js`               |
| 2. Pré-processamento            | feito pela própria API de OCR               |
| 3. Segmentação                  | `src/services/ocrService.js`                |
| 4. Extração de Características  | `src/services/parserService.js`             |
| 5. Reconhecimento de Padrões    | `src/services/classificationService.js`     |

---

## 6. Ajustando o parser (importante!)

O texto que volta da API de OCR não vem estruturado em campos — vem como um
bloco de texto corrido, e o layout varia entre marcas de produtos. O arquivo
`src/services/parserService.js` usa busca por palavras-chave (ex: "sodio",
"acucares totais") seguida da captura do número mais próximo.

**Antes da apresentação, testem com pelo menos 10-15 produtos reais** e
ajustem a lista de `keywords` em `parseNutritionalInfo()` conforme os padrões
de texto que aparecerem nos testes de vocês. É normal precisar adicionar
variações (ex: "sodio total", "sodio (na)") conforme os produtos testados.

---

## 7. Ajustando as regras de classificação

Os limites de classificação (o que é "saudável", "moderado" ou "evitar")
estão em `src/services/classificationService.js`, no objeto `LIMITES`. Eles
são baseados em referências simplificadas de perfil nutricional
(OMS/ANVISA) — documentem a fonte bibliográfica escolhida no relatório do
projeto, e ajustem os valores se o grupo optar por outra referência.

---

## 8. Checklist antes da apresentação

- [ ] Testar o app com pelo menos 15 produtos reais diferentes
- [ ] Confirmar que a cota gratuita da API do Google Cloud Vision não vai
      estourar durante a demo
- [ ] Testar a conexão via dados móveis (não só wi-fi), já que a API de OCR
      e o Supabase exigem internet
- [ ] Levar 3-4 produtos físicos variados no dia (um claramente saudável, um
      claramente "evitar", um limítrofe) para demonstrar ao vivo
- [ ] Verificar que o histórico mostra corretamente itens sincronizados e
      não sincronizados (para demonstrar a arquitetura offline-first)
