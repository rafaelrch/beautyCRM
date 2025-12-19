// Helper para enviar logs para o terminal do servidor
export const serverLog = async (level: "info" | "warn" | "error" | "success", message: string, data?: any) => {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ level, message, data }),
    });
  } catch (error) {
    // Se falhar, pelo menos logar no console
    console.log(`[${level.toUpperCase()}] ${message}`, data || "");
  }
  
  // Também logar no console do navegador para debug
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : level === "info" ? "🔵" : "✅";
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};












