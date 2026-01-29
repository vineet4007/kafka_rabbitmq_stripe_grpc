CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  -- references orders.order_id (business key)
  order_id VARCHAR(64) NOT NULL,

  provider ENUM(
    'STRIPE',
    'RAZORPAY'
  ) NOT NULL,

  provider_payment_id VARCHAR(128),

  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,

  status ENUM(
    'INITIATED',
    'SUCCESS',
    'FAILED'
  ) NOT NULL DEFAULT 'INITIATED',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- prevents double charge per providerfeat: add mysql schema for orders and payments

  UNIQUE KEY uniq_order_provider (order_id, provider),

  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
);
