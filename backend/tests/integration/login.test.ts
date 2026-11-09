import { describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";

import { createApp } from "../../src/app.js";
import type {
  LogContext,
  Logger,
} from "../../src/shared/logging/logger.js";

const testJwtSecret = "a-long-secret-used-only-by-the-test-suite";
const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

function createTestApp() {
  return createApp({
    jwtSecret: testJwtSecret,
    scoringAlgorithmSelection: "sha256",
    logger: silentLogger,
  });
}

describe("POST /login", () => {
  it("returns a signed JWT for valid user credentials", async () => {
    const app = createTestApp();

    const response = await request(app).post("/login").send({
      username: "user",
      password: "user123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      token: expect.any(String),
      expiresIn: 3600,
    });

    const payload = jwt.verify(response.body.token, testJwtSecret);

    if (
      typeof payload === "string" ||
      payload.iat === undefined ||
      payload.exp === undefined
    ) {
      throw new Error("Expected a JWT payload with iat and exp claims");
    }

    expect(payload).toMatchObject({
      sub: "user-1",
      role: "user",
      rut: "12345678-5",
    });
    expect(payload.exp - payload.iat).toBe(3600);
  });

  it("returns an admin JWT without a RUT claim", async () => {
    const app = createTestApp();

    const response = await request(app).post("/login").send({
      username: "admin",
      password: "admin123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      token: expect.any(String),
      expiresIn: 3600,
    });

    const payload = jwt.verify(response.body.token, testJwtSecret);

    expect(payload).toMatchObject({
      sub: "admin-1",
      role: "admin",
    });
    expect(payload).not.toHaveProperty("rut");
  });

  it.each([
    { username: "unknown", password: "user123" },
    { username: "user", password: "wrong-password" },
  ])("rejects invalid credentials", async (credentials) => {
    const app = createTestApp();

    const response = await request(app).post("/login").send(credentials);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
    expect(response.body).not.toHaveProperty("token");
  });

  it.each([
    {},
    { username: "user" },
    { password: "user123" },
    { username: 123, password: "user123" },
    { username: "", password: "user123" },
    { username: "user", password: " " },
  ])("rejects malformed credentials", async (body) => {
    const app = createTestApp();

    const response = await request(app).post("/login").send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Username and password are required",
    });
  });

  it("logs request metadata without sensitive login data", async () => {
    const logs: Array<{ event: string; context: LogContext }> = [];
    const logger: Logger = {
      info: (event, context = {}) => logs.push({ event, context }),
      warn: () => {},
      error: () => {},
    };
    const app = createApp({
      jwtSecret: testJwtSecret,
      scoringAlgorithmSelection: "sha256",
      logger,
    });

    const response = await request(app).post("/login").send({
      username: "user",
      password: "user123",
    });

    expect(logs).toEqual([
      {
        event: "http.request.completed",
        context: {
          method: "POST",
          route: "/login",
          statusCode: 200,
          durationMs: expect.any(Number),
        },
      },
    ]);

    const serializedLogs = JSON.stringify(logs);
    expect(serializedLogs).not.toContain("user123");
    expect(serializedLogs).not.toContain(response.body.token);
    expect(serializedLogs).not.toContain("12345678-5");
  });
});
