-- Migration: create_payment_slips_bucket
-- Creates the private `payment-slips` bucket for storing payment slip images/PDFs.
-- The bucket is private (public=false). Access is controlled via RLS and service-role
-- operations in the Edge Function (uploadSlip / getPaymentSlip).
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', false)
ON CONFLICT (id) DO NOTHING;