/**
 * Inserts a payment row (INITIATED)
 */
export async function createPayment(connection, {
  orderId,
  provider,
  amount,
  currency
}) {
  const query = `
    INSERT INTO payments (order_id, provider, amount, currency, status)
    VALUES (?, ?, ?, ?, 'INITIATED')
  `;

  await connection.execute(query, [
    orderId,
    provider,
    amount,
    currency
  ]);
}

/**
 * Updates payment result
 */
export async function updatePaymentStatus(connection, {
  orderId,
  provider,
  status,
  providerPaymentId
}) {
  const query = `
    UPDATE payments
    SET status = ?, provider_payment_id = ?
    WHERE order_id = ? AND provider = ?
  `;

  await connection.execute(query, [
    status,
    providerPaymentId ?? null,
    orderId,
    provider
  ]);
}
