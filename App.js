import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase } from "./src/database/db";
import {
  sincronizarPendentes,
  iniciarListenerDeSincronizacaoAutomatica,
} from "./src/services/syncService";

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erroInicializacao, setErroInicializacao] = useState(null);

  useEffect(() => {
    let unsubscribeSync = () => {};

    async function iniciar() {
      try {
        // 1. Garante que o banco local (SQLite) esteja pronto antes de
        //    qualquer tela tentar usá-lo.
        await initDatabase();

        // 2. Tenta sincronizar pendências assim que o app abre (caso
        //    existam análises feitas offline em uma sessão anterior).
        sincronizarPendentes().catch(() => {});

        // 3. Registra o listener que sincroniza automaticamente sempre
        //    que a conexão com a internet for restabelecida.
        unsubscribeSync = iniciarListenerDeSincronizacaoAutomatica();

        setPronto(true);
      } catch (err) {
        console.error("[App] Erro na inicialização:", err);
        setErroInicializacao(err.message);
      }
    }

    iniciar();

    return () => unsubscribeSync();
  }, []);

  if (erroInicializacao) {
    return (
      <View style={styles.center}>
        <Text style={styles.erroTexto}>
          Erro ao iniciar o aplicativo: {erroInicializacao}
        </Text>
      </View>
    );
  }

  if (!pronto) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1F3864" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  erroTexto: { color: "#C62828", textAlign: "center", fontSize: 15 },
});
