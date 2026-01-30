import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

import {
  createOrder,
  streamPaymentStatus,
  batchCreateOrders,
  orderChat
} from "./order.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../../../proto/order.proto");

export function startGrpcServer() {
  const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const proto = grpc.loadPackageDefinition(packageDef).paymentslab.v1;

  const server = new grpc.Server();

  server.addService(proto.OrderService.service, {
    CreateOrder: createOrder,                 // Unary
    StreamPaymentStatus: streamPaymentStatus, // Server streaming
    BatchCreateOrders: batchCreateOrders,     // Client streaming
    OrderChat: orderChat                      // Bi-directional
  });

  const addr = "0.0.0.0:50051";
  server.bindAsync(
    addr,
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start();
      console.log(`gRPC server listening on ${addr}`);
    }
  );
}
