import { pool } from "../config/mysql.js";

/**
 * Inserts a new order in CREATED state
 */
export async function createOrder(connection, {
  orderId,
  userId,
  amount,
  currency
}) {
  const query = `
    INSERT INTO orders (order_id, user_id, amount, currency, status)
    VALUES (?, ?, ?, ?, 'CREATED')
  `;

  await connection.execute(query, [
    orderId,
    userId,
    amount,
    currency
  ]);
}

/**
 * Updates order status
 */
export async function updateOrderStatus(connection, orderId, status) {
  const query = `
    UPDATE orders
    SET status = ?
    WHERE order_id = ?
  `;

  await connection.execute(query, [status, orderId]);
}
