-- Adicionar colunas de geolocalização para profissionais
ALTER TABLE public.profissionais 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS raio_atuacao INTEGER DEFAULT 50;

-- Adicionar colunas de geolocalização para estabelecimentos
ALTER TABLE public.estabelecimentos
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Adicionar coluna de raio de notificação para vagas (slots)
ALTER TABLE public.slots
ADD COLUMN IF NOT EXISTS raio_notificacao INTEGER DEFAULT 50;

-- Garantir que as permissões estejam corretas (embora já existam para as tabelas)
GRANT SELECT, UPDATE ON public.profissionais TO authenticated;
GRANT SELECT, UPDATE ON public.estabelecimentos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.slots TO authenticated;

-- Função auxiliar para calcular distância em KM (Fórmula de Haversine)
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    dist float = 0;
    rad_lat1 float;
    rad_lat2 float;
    theta float;
    rad_theta float;
BEGIN
    IF lat1 = lat2 AND lon1 = lon2 THEN
        RETURN 0;
    END IF;

    rad_lat1 = pi() * lat1 / 180;
    rad_lat2 = pi() * lat2 / 180;
    theta = lon1 - lon2;
    rad_theta = pi() * theta / 180;
    
    dist = sin(rad_lat1) * sin(rad_lat2) + cos(rad_lat1) * cos(rad_lat2) * cos(rad_theta);
    
    IF dist > 1 THEN dist = 1; END IF;
    
    dist = acos(dist);
    dist = dist * 180 / pi();
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344; -- Converter para KM
    
    RETURN dist;
END;
$$ LANGUAGE plpgsql IMMUTABLE;