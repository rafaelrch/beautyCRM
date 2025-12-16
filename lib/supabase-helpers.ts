import { supabase } from "./supabase";
import type { Database } from "@/types/database";

// Tipos derivados do Database
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProfessionalRow = Database["public"]["Tables"]["professionals"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type StockMovementRow = Database["public"]["Tables"]["stock_movements"]["Row"];

// Helper para obter o user_id do usuário autenticado
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

// ============================================================================
// CLIENTES
// ============================================================================

export async function getClients(): Promise<ClientRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("clients") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ClientRow[]) || [];
}

export async function createClient(client: Omit<Database["public"]["Tables"]["clients"]["Insert"], "user_id">) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("clients") as any)
    .insert({ ...client, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(
  id: string,
  updates: Database["public"]["Tables"]["clients"]["Update"]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("clients") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { error } = await (supabase
    .from("clients") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// PROFISSIONAIS
// ============================================================================

export async function getProfessionals(): Promise<ProfessionalRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("professionals") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProfessionalRow[]) || [];
}

export async function createProfessional(
  professional: Omit<Database["public"]["Tables"]["professionals"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("professionals") as any)
    .insert({ ...professional, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfessional(
  id: string,
  updates: Database["public"]["Tables"]["professionals"]["Update"]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("professionals") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfessional(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { error } = await (supabase
    .from("professionals") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// SERVIÇOS
// ============================================================================

export async function getServices(): Promise<ServiceRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("services") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ServiceRow[]) || [];
}

export async function createService(
  service: Omit<Database["public"]["Tables"]["services"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("services") as any)
    .insert({ ...service, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(
  id: string,
  updates: Database["public"]["Tables"]["services"]["Update"]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("services") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { error } = await (supabase
    .from("services") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// PRODUTOS (ESTOQUE)
// ============================================================================

export async function getProducts(): Promise<ProductRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("products") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProductRow[]) || [];
}

export async function createProduct(
  product: Omit<Database["public"]["Tables"]["products"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("products") as any)
    .insert({ ...product, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Database["public"]["Tables"]["products"]["Update"]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("products") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { error } = await (supabase
    .from("products") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// AGENDAMENTOS
// ============================================================================

export async function getAppointments(): Promise<AppointmentRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("appointments") as any)
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data as AppointmentRow[]) || [];
}

export async function createAppointment(
  appointment: Omit<Database["public"]["Tables"]["appointments"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("appointments") as any)
    .insert({ ...appointment, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointment(
  id: string,
  updates: Database["public"]["Tables"]["appointments"]["Update"]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("appointments") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAppointment(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { error } = await (supabase
    .from("appointments") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// TRANSAÇÕES (FINANCEIRO)
// ============================================================================

export async function getTransactions(): Promise<TransactionRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("transactions") as any)
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as TransactionRow[]) || [];
}

export async function createTransaction(
  transaction: Omit<Database["public"]["Tables"]["transactions"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("transactions") as any)
    .insert({ ...transaction, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(
  id: string,
  updates: Database["public"]["Tables"]["transactions"]["Update"]
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("transactions") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { error } = await (supabase
    .from("transactions") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// MOVIMENTAÇÕES DE ESTOQUE
// ============================================================================

export async function getStockMovements(): Promise<StockMovementRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("stock_movements") as any)
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as StockMovementRow[]) || [];
}

export async function createStockMovement(
  movement: Omit<Database["public"]["Tables"]["stock_movements"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await (supabase
    .from("stock_movements") as any)
    .insert({ ...movement, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}
