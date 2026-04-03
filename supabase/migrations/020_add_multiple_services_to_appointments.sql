-- Add support for multiple services per appointment

-- Create junction table for appointment-services relationship
CREATE TABLE IF NOT EXISTS appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_price_id UUID NOT NULL REFERENCES service_prices(id),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id, service_price_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_services_service_price ON appointment_services(service_price_id);

-- Add total_price column to appointments (will be calculated from services)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

-- Migrate existing data from service_price_id to appointment_services
INSERT INTO appointment_services (appointment_id, service_price_id, price)
SELECT id, service_price_id, price
FROM appointments
WHERE service_price_id IS NOT NULL
ON CONFLICT (appointment_id, service_price_id) DO NOTHING;

-- Update total_price from existing price
UPDATE appointments
SET total_price = price
WHERE total_price IS NULL;

-- Now we can keep service_price_id for backward compatibility or drop it
-- For now, let's keep it as nullable for reference
ALTER TABLE appointments ALTER COLUMN service_price_id DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN service_price_id DROP DEFAULT;

-- Enable RLS
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointment_services
CREATE POLICY "Users can view appointment services"
ON appointment_services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = appointment_services.appointment_id
    AND appointments.company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can insert appointment services"
ON appointment_services FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = appointment_services.appointment_id
    AND appointments.company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can delete appointment services"
ON appointment_services FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = appointment_services.appointment_id
    AND appointments.company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  )
);
