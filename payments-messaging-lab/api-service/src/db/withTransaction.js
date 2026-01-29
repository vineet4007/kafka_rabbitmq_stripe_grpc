import { pool } from "../config/mysql.js";

export async function withTransaction(fn) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
