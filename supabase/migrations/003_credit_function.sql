CREATE OR REPLACE FUNCTION deduct_credit(
  p_client_id UUID,
  p_plan_id UUID
) RETURNS TABLE (
  success BOOLEAN,
  client_plan_id UUID,
  credits_remaining INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  v_client_plan_id UUID;
  v_credits_remaining INTEGER;
BEGIN
  -- Atomic update with lock to prevent race conditions
  UPDATE client_plans
  SET credits_remaining = credits_remaining - 1
  WHERE id = (
    SELECT id FROM client_plans
    WHERE client_id = p_client_id
      AND plan_id = p_plan_id
      AND active = true
      AND credits_remaining > 0
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, credits_remaining INTO v_client_plan_id, v_credits_remaining;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_client_plan_id, v_credits_remaining;
  ELSE
    RAISE EXCEPTION 'Sem créditos suficientes ou plano não encontrado';
  END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION deduct_credit TO authenticated;
