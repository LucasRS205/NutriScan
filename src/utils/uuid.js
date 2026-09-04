// Geração simples de UUID v4, usado como chave primária compartilhada
// entre o SQLite local e o Supabase (evita duplicação na sincronização).
// Requer "react-native-get-random-values" importado antes deste módulo
// (já é importado em src/config/supabase.js, que é carregado cedo no app).

export function gerarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
