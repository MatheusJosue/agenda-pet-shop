-- Allow appointments to consume either client plan credits or pet package credits.
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_used_credit_check;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_used_credit_check_new;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_check;

ALTER TABLE appointments ADD CONSTRAINT appointments_used_credit_check
CHECK (
  used_credit = FALSE
  OR client_plan_id IS NOT NULL
  OR pet_package_id IS NOT NULL
);
