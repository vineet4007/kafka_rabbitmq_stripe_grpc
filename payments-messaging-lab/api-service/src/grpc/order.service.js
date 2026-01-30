import grpc from "@grpc/grpc-js";
import { withTransaction } from "../db/withTransaction.js";
import { createOrder as dbCreateOrder } from "../db/order.repository.js";
import { createPayment } from "../db/payment.repository.js";

// ---------- Unary ----------
export async function createOrder(call, callback) {
  const { order, idempotency_key } = call.request;

  try {
    // NOTE: Real payment + Kafka will come later.
    await withTransaction(async (conn) => {
      await dbCreateOrder(conn, {
        orderId: order.order_id,
        userId: order.user_id,
        amount: order.amount,
        currency: order.currency
      });

      await createPayment(conn, {
        orderId: order.order_id,
        provider: order.payment_provider,
        amount: order.amount,
        currency: order.currency
      });
    });

    callback(null, {
      status: "PAYMENT_INITIATED",
      order_id: order.order_id,
      note: "Order stored and payment initiated"
    });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

// ---------- Server streaming ----------
export function streamPaymentStatus(call) {
  const { order_id, heartbeat_seconds } = call.request;

  let counter = 0;
  const intervalMs = (heartbeat_seconds || 2) * 1000;

  const interval = setInterval(() => {
    counter++;

    call.write({
      order_id,
      provider: "SIMULATED",
      status: "PENDING",
      message: `heartbeat ${counter}`,
      occurred_at: { seconds: Math.floor(Date.now() / 1000) }
    });

    // simulate completion
    if (counter === 5) {
      call.write({
        order_id,
        provider: "SIMULATED",
        status: "SUCCESS",
        message: "payment completed",
        occurred_at: { seconds: Math.floor(Date.now() / 1000) }
      });
      clearInterval(interval);
      call.end();
    }
  }, intervalMs);

  call.on("cancelled", () => {
    clearInterval(interval);
  });
}

// ---------- Client streaming ----------
export function batchCreateOrders(call, callback) {
  const results = [];

  call.on("data", async (chunk) => {
    try {
      const { order } = chunk;

      await withTransaction(async (conn) => {
        await dbCreateOrder(conn, {
          orderId: order.order_id,
          userId: order.user_id,
          amount: order.amount,
          currency: order.currency
        });
      });

      results.push({
        order_id: order.order_id,
        status: "CREATED"
      });
    } catch (err) {
      results.push({
        order_id: chunk.order?.order_id,
        status: "FAILED",
        error: err.message
      });
    }
  });

  call.on("end", () => {
    callback(null, { results });
  });
}

// ---------- Bi-directional ----------
export function orderChat(call) {
  call.on("data", (msg) => {
    // echo with server stamp
    call.write({
      order_id: msg.order_id,
      from: "server",
      text: `ack: ${msg.text}`,
      ts: { seconds: Math.floor(Date.now() / 1000) }
    });
  });

  call.on("end", () => {
    call.end();
  });
}
