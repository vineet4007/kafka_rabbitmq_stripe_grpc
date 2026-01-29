CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  -- business identifier (used across services)
  order_id VARCHAR(64) NOT NULL,

  user_id VARCHAR(64) NOT NULL,

  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,

  status ENUM(
    'CREATED',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED'
  ) NOT NULL DEFAULT 'CREATED',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
