import { supabase } from "./supabase";
import type { Database } from "@/types/database";

// Helper para obter o user_id do usuário autenticado
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

// Helper para obter dados do usuário autenticado
export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, salon_name, cnpj, phone, email, address")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// CLIENTES
// ============================================================================

export async function getClients() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createClient(client: Omit<Database["public"]["Tables"]["clients"]["Insert"], "user_id">) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("clients")
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

  const { data, error } = await supabase
    .from("clients")
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

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// PROFISSIONAIS
// ============================================================================

export async function getProfessionals() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProfessional(
  professional: Omit<Database["public"]["Tables"]["professionals"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("professionals")
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

  const { data, error } = await supabase
    .from("professionals")
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

  const { error } = await supabase
    .from("professionals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// SERVIÇOS
// ============================================================================

export async function getServices() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createService(
  service: Omit<Database["public"]["Tables"]["services"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("services")
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

  const { data, error } = await supabase
    .from("services")
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

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// PRODUTOS (ESTOQUE)
// ============================================================================

export async function getProducts() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(
  product: Omit<Database["public"]["Tables"]["products"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("products")
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

  const { data, error } = await supabase
    .from("products")
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

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// AGENDAMENTOS
// ============================================================================

export async function getAppointments() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createAppointment(
  appointment: Omit<Database["public"]["Tables"]["appointments"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("appointments")
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

  const { data, error } = await supabase
    .from("appointments")
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

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// TRANSAÇÕES (FINANCEIRO)
// ============================================================================

export async function getTransactions() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTransaction(
  transaction: Omit<Database["public"]["Tables"]["transactions"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  // Garantir que description seja sempre uma string (não null ou undefined)
  const transactionData = {
    ...transaction,
    description: transaction.description || "",
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionData)
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

  // Garantir que description seja sempre uma string se estiver presente
  const updateData = {
    ...updates,
    ...(updates.description !== undefined && { description: updates.description || "" }),
  };

  const { data, error } = await supabase
    .from("transactions")
    .update(updateData)
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

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

// ============================================================================
// MOVIMENTAÇÕES DE ESTOQUE
// ============================================================================

export async function getStockMovements() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createStockMovement(
  movement: Omit<Database["public"]["Tables"]["stock_movements"]["Insert"], "user_id">
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("stock_movements")
    .insert({ ...movement, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}





