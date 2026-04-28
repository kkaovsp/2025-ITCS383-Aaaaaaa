-- Repeatable demo data for cloud testing and frontend review.
-- Passwords:
--   boothManager / boothManager123
--   demoMerchant / merchant123
--   demoUser / user123

insert into users (id, username, password, name, contact_info, role, created_at) values
  (
    '11111111-1111-1111-1111-111111111111',
    'boothManager',
    'edge-pbkdf2-sha256$100000$Ym9vdGgtb3JnYW5pemVyLWRlbW8tbWFuYWdlcg$aUBIZgGqOP_lN6c1IRYj1mVfkjK6TluHKoPFAMQjia4',
    'Booth Manager',
    'manager@example.com',
    'BOOTH_MANAGER',
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'demoMerchant',
    'edge-pbkdf2-sha256$100000$Ym9vdGgtb3JnYW5pemVyLWRlbW8tbWVyY2hhbnQ$qN8ogON9qZ0WSQt9m9uCUOHi4pAjG86FZvocVFNCa0Q',
    'Demo Merchant',
    'merchant@example.com',
    'MERCHANT',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'demoUser',
    'edge-pbkdf2-sha256$100000$Ym9vdGgtb3JnYW5pemVyLWRlbW8tdXNlcg$22Qf6qlHhxYWuNH85LiXIcV49pPu2U6Y_6AhhE5lty4',
    'Demo User',
    'user@example.com',
    'GENERAL_USER',
    now()
  )
on conflict (username) do update set
  password = excluded.password,
  name = excluded.name,
  contact_info = excluded.contact_info,
  role = excluded.role;

insert into merchants (
  merchant_id,
  user_id,
  citizen_id,
  seller_information,
  product_description,
  approval_status,
  approved_by,
  approved_at,
  citizen_valid
) values (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  '1234567890123',
  'Demo snack and drink seller',
  'Packaged snacks, coffee, and soft drinks',
  'APPROVED',
  '11111111-1111-1111-1111-111111111111',
  now(),
  1
)
on conflict (merchant_id) do update set
  user_id = excluded.user_id,
  citizen_id = excluded.citizen_id,
  seller_information = excluded.seller_information,
  product_description = excluded.product_description,
  approval_status = excluded.approval_status,
  approved_by = excluded.approved_by,
  approved_at = excluded.approved_at,
  citizen_valid = excluded.citizen_valid;

insert into events (event_id, name, description, location, start_date, end_date, created_by, created_at) values
  (
    '55555555-5555-5555-5555-555555555555',
    'Campus Food Fair 2026',
    'Demo event for booth browsing, reservation, payment, and reporting tests.',
    'Mahidol University Main Hall',
    '2026-05-05',
    '2026-05-07',
    '11111111-1111-1111-1111-111111111111',
    now()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Startup Expo 2026',
    'Demo event with available booths for frontend and Android testing.',
    'Innovation Building',
    '2026-06-10',
    '2026-06-12',
    '11111111-1111-1111-1111-111111111111',
    now()
  )
on conflict (event_id) do update set
  name = excluded.name,
  description = excluded.description,
  location = excluded.location,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  created_by = excluded.created_by;

insert into booths (
  booth_id,
  event_id,
  booth_number,
  size,
  price,
  location,
  type,
  classification,
  duration_type,
  electricity,
  water_supply,
  outlets,
  status
) values
  (
    '77777777-7777-7777-7777-777777777777',
    '55555555-5555-5555-5555-555555555555',
    'A1',
    '3x3 m',
    1200.00,
    'Hall A - Front Row',
    'INDOOR',
    'TEMPORARY',
    'SHORT_TERM',
    true,
    false,
    2,
    'OCCUPIED'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    '55555555-5555-5555-5555-555555555555',
    'A2',
    '3x3 m',
    1000.00,
    'Hall A - Middle Row',
    'INDOOR',
    'TEMPORARY',
    'SHORT_TERM',
    true,
    false,
    1,
    'AVAILABLE'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '66666666-6666-6666-6666-666666666666',
    'B1',
    '4x4 m',
    1800.00,
    'Outdoor Zone B',
    'OUTDOOR',
    'TEMPORARY',
    'SHORT_TERM',
    true,
    true,
    2,
    'AVAILABLE'
  )
on conflict (booth_id) do update set
  event_id = excluded.event_id,
  booth_number = excluded.booth_number,
  size = excluded.size,
  price = excluded.price,
  location = excluded.location,
  type = excluded.type,
  classification = excluded.classification,
  duration_type = excluded.duration_type,
  electricity = excluded.electricity,
  water_supply = excluded.water_supply,
  outlets = excluded.outlets,
  status = excluded.status;

insert into reservations (reservation_id, booth_id, merchant_id, reservation_type, status, created_at) values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',
  'SHORT_TERM',
  'CONFIRMED',
  now()
)
on conflict (reservation_id) do update set
  booth_id = excluded.booth_id,
  merchant_id = excluded.merchant_id,
  reservation_type = excluded.reservation_type,
  status = excluded.status;

insert into payments (payment_id, reservation_id, amount, method, payment_status, slip_url, created_at) values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  1200.00,
  'BANK_TRANSFER',
  'APPROVED',
  'seed-demo-slip',
  now()
)
on conflict (payment_id) do update set
  reservation_id = excluded.reservation_id,
  amount = excluded.amount,
  method = excluded.method,
  payment_status = excluded.payment_status,
  slip_url = excluded.slip_url;

insert into notifications (notification_id, user_id, title, message, type, reference_id, is_read, created_at) values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'Payment approved',
  'Your demo booth payment has been approved.',
  'PAYMENT',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  false,
  now()
)
on conflict (notification_id) do update set
  user_id = excluded.user_id,
  title = excluded.title,
  message = excluded.message,
  type = excluded.type,
  reference_id = excluded.reference_id,
  is_read = excluded.is_read;
