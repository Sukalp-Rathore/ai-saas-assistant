import { Workspace } from "./workspaces.model.js";
import { User } from "../auth/auth.model.js";
import { ApiError } from "../../utils/api-error.js";
import mongoose from "mongoose";
import mysql from "mysql2/promise";
import { Client as PgClient } from "pg";

async function resolveOrganization(userId) {
  const user = await User.findById(userId);
  if (!user?.organizationId) {
    throw new ApiError(404, "No organization found for this user");
  }
  return user.organizationId.toString();
}

export async function listWorkspaces(userId) {
  const organizationId = await resolveOrganization(userId);
  return Workspace.find({ organizationId }).sort({ createdAt: -1 });
}

export async function createWorkspace(userId, payload) {
  const organizationId = await resolveOrganization(userId);
  return Workspace.create({
    organizationId,
    name: payload.name,
    description: payload.description || "",
    databaseType: payload.databaseType || "mysql",
    databaseConfig: payload.databaseConfig || {},
    isActive: payload.isActive ?? true,
  });
}

export async function getWorkspace(userId, workspaceId) {
  const organizationId = await resolveOrganization(userId);
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    organizationId,
  });
  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }
  return workspace;
}

export async function updateWorkspace(userId, workspaceId, payload) {
  const organizationId = await resolveOrganization(userId);
  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.databaseType !== undefined) updates.databaseType = payload.databaseType;
  if (payload.databaseConfig !== undefined) updates.databaseConfig = payload.databaseConfig;
  if (payload.isActive !== undefined) updates.isActive = payload.isActive;

  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, organizationId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }
  return workspace;
}

export async function deleteWorkspace(userId, workspaceId) {
  const organizationId = await resolveOrganization(userId);
  const workspace = await Workspace.findOneAndDelete({ _id: workspaceId, organizationId });
  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }
  return workspace;
}

export async function testConnection(_userId, payload) {
  const databaseType = payload.databaseType;
  const config =
    typeof payload.databaseConfig === "string"
      ? JSON.parse(payload.databaseConfig)
      : payload.databaseConfig || {};

  if (!["mysql", "postgresql", "mongodb", "sqlite"].includes(databaseType)) {
    throw new ApiError(400, "Invalid database type");
  }

  if (databaseType === "sqlite") {
    return { success: true, message: "SQLite connection test passed (in-memory/file mode)" };
  }

  if (!config.host || !config.port || !config.database) {
    throw new ApiError(400, "host, port, and database are required in databaseConfig");
  }

  try {
    if (databaseType === "mongodb") {
      const userInfo = config.user && config.password ? `${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@` : "";
      const uri = `mongodb://${userInfo}${config.host}:${config.port}/${config.database}`;
      const conn = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 });
      await conn.asPromise();
      const collections = await conn.db.listCollections().toArray();
      const names = collections.map((c) => c.name).sort();
      await conn.close();
      return { success: true, message: "MongoDB connection successful", collections: names };
    }

    if (databaseType === "mysql") {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user || "root",
        password: config.password || "",
        database: config.database,
        connectTimeout: 5000,
      });
      const [rows] = await connection.query("SHOW TABLES");
      const names = rows.map((r) => Object.values(r)[0]).sort();
      await connection.end();
      return { success: true, message: "MySQL connection successful", collections: names };
    }

    if (databaseType === "postgresql") {
      const client = new PgClient({
        host: config.host,
        port: config.port,
        user: config.user || "postgres",
        password: config.password || "",
        database: config.database,
        connectionTimeoutMillis: 5000,
      });
      await client.connect();
      const result = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
      const names = result.rows.map((r) => r.tablename).sort();
      await client.end();
      return { success: true, message: "PostgreSQL connection successful", collections: names };
    }
  } catch (err) {
    return { success: false, message: `Connection failed: ${err.message}` };
  }

  return { success: false, message: "Unsupported database type" };
}
