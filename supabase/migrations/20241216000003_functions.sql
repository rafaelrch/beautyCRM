-- =====================================================
-- Funções do Banco de Dados
-- =====================================================

-- =====================================================
-- Função: Criar perfil de usuário após signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Função: Atualizar estatísticas do cliente
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_client_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_client_id UUID;
    v_total_spent DECIMAL(10, 2);
    v_total_visits INTEGER;
    v_last_visit DATE;
BEGIN
    -- Determina qual client_id usar
    IF TG_OP = 'DELETE' THEN
        v_client_id := OLD.client_id;
    ELSE
        v_client_id := NEW.client_id;
    END IF;

    -- Se não há client_id, retorna
    IF v_client_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calcula estatísticas
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END), 0),
        COUNT(CASE WHEN type = 'income' AND status = 'completed' THEN 1 END),
        MAX(CASE WHEN type = 'income' AND status = 'completed' THEN date END)
    INTO v_total_spent, v_total_visits, v_last_visit
    FROM public.transactions
    WHERE client_id = v_client_id;

    -- Atualiza o cliente
    UPDATE public.clients
    SET 
        total_spent = v_total_spent,
        total_visits = v_total_visits,
        last_visit = v_last_visit
    WHERE id = v_client_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estatísticas do cliente
DROP TRIGGER IF EXISTS update_client_stats_trigger ON public.transactions;
CREATE TRIGGER update_client_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_client_stats();

-- =====================================================
-- Função: Atualizar estoque após movimentação
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'in' THEN
            UPDATE public.products
            SET quantity = quantity + NEW.quantity
            WHERE id = NEW.product_id;
        ELSE
            UPDATE public.products
            SET quantity = quantity - NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'in' THEN
            UPDATE public.products
            SET quantity = quantity - OLD.quantity
            WHERE id = OLD.product_id;
        ELSE
            UPDATE public.products
            SET quantity = quantity + OLD.quantity
            WHERE id = OLD.product_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverte a operação antiga
        IF OLD.type = 'in' THEN
            UPDATE public.products
            SET quantity = quantity - OLD.quantity
            WHERE id = OLD.product_id;
        ELSE
            UPDATE public.products
            SET quantity = quantity + OLD.quantity
            WHERE id = OLD.product_id;
        END IF;
        -- Aplica a nova operação
        IF NEW.type = 'in' THEN
            UPDATE public.products
            SET quantity = quantity + NEW.quantity
            WHERE id = NEW.product_id;
        ELSE
            UPDATE public.products
            SET quantity = quantity - NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estoque
DROP TRIGGER IF EXISTS update_product_stock_trigger ON public.stock_movements;
CREATE TRIGGER update_product_stock_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- =====================================================
-- Função: Criar configuração padrão do salão
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_default_salon_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.salon_config (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.salon_name, 'Meu Salão'))
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar configuração padrão
DROP TRIGGER IF EXISTS create_default_salon_config_trigger ON public.users;
CREATE TRIGGER create_default_salon_config_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_salon_config();

