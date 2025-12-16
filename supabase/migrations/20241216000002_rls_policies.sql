-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Políticas para USERS
-- =====================================================

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Permitir inserção durante o signup (via trigger ou function)
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- Políticas para CLIENTS
-- =====================================================

CREATE POLICY "Users can view own clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
    ON public.clients FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para PROFESSIONALS
-- =====================================================

CREATE POLICY "Users can view own professionals"
    ON public.professionals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own professionals"
    ON public.professionals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own professionals"
    ON public.professionals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own professionals"
    ON public.professionals FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para SERVICES
-- =====================================================

CREATE POLICY "Users can view own services"
    ON public.services FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services"
    ON public.services FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services"
    ON public.services FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services"
    ON public.services FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para PRODUCTS
-- =====================================================

CREATE POLICY "Users can view own products"
    ON public.products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
    ON public.products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
    ON public.products FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
    ON public.products FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para APPOINTMENTS
-- =====================================================

CREATE POLICY "Users can view own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
    ON public.appointments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para TRANSACTIONS
-- =====================================================

CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para STOCK_MOVEMENTS
-- =====================================================

CREATE POLICY "Users can view own stock movements"
    ON public.stock_movements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock movements"
    ON public.stock_movements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stock movements"
    ON public.stock_movements FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stock movements"
    ON public.stock_movements FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para SALON_CONFIG
-- =====================================================

CREATE POLICY "Users can view own salon config"
    ON public.salon_config FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own salon config"
    ON public.salon_config FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own salon config"
    ON public.salon_config FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own salon config"
    ON public.salon_config FOR DELETE
    USING (auth.uid() = user_id);

