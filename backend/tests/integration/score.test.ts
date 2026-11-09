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

async function loginAs(
  app: ReturnType<typeof createTestApp>,
  role: "admin" | "user",
) {
  const response = await request(app)
    .post("/login")
    .send({
      username: role,
      password: role === "admin" ? "admin123" : "user123",
    });

  return response.body.token as string;
}

describe("GET /score/:rut", () => {
  it.each([undefined, "Bearer invalid-token"])(
    "rejects a missing or invalid access token",
    async (authorization) => {
      const app = createTestApp();
      const requestBuilder = request(app).get("/score/12345678-5");

      if (authorization) {
        requestBuilder.set("Authorization", authorization);
      }

      const response = await requestBuilder;

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    },
  );

  it("rejects an expired access token", async () => {
    const app = createTestApp();
    const expiredToken = jwt.sign(
      { role: "user", rut: "12345678-5" },
      testJwtSecret,
      { subject: "user-1", expiresIn: -1 },
    );

    const response = await request(app)
      .get("/score/12345678-5")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid or expired token",
    });
  });

  it.each([
    { role: "manager" },
    { role: "user" },
  ])("rejects a signed token with invalid claims", async (claims) => {
    const app = createTestApp();
    const token = jwt.sign(claims, testJwtSecret, {
      subject: "user-1",
      expiresIn: 3600,
    });

    const response = await request(app)
      .get("/score/12345678-5")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid or expired token",
    });
  });

  it("allows a user to query their own RUT", async () => {
    const app = createTestApp();
    const token = await loginAs(app, "user");

    const firstResponse = await request(app)
      .get("/score/12.345.678-5")
      .set("Authorization", `Bearer ${token}`);
    const secondResponse = await request(app)
      .get("/score/12345678-5")
      .set("Authorization", `Bearer ${token}`);

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body).toEqual({
      rut: "12.345.678-5",
      score: expect.any(Number),
      fecha: expect.any(String),
    });
    expect(firstResponse.body.score).toBe(secondResponse.body.score);
    expect(Number.isNaN(Date.parse(firstResponse.body.fecha))).toBe(false);
  });

  it("forbids a user from querying a different RUT", async () => {
    const app = createTestApp();
    const token = await loginAs(app, "user");

    const response = await request(app)
      .get("/score/98765432-1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: "You are not allowed to query this RUT",
    });
  });

  it("allows an admin to query any valid RUT", async () => {
    const app = createTestApp();
    const token = await loginAs(app, "admin");

    const response = await request(app)
      .get("/score/98.765.432-1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      rut: "98.765.432-1",
      score: expect.any(Number),
      fecha: expect.any(String),
    });
  });

  it("rejects an invalid RUT", async () => {
    const app = createTestApp();
    const token = await loginAs(app, "admin");

    const response = await request(app)
      .get("/score/not-a-rut")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid RUT",
    });
  });

  it("logs the route template without exposing the queried RUT", async () => {
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
    const token = jwt.sign({ role: "admin" }, testJwtSecret, {
      subject: "admin-1",
      expiresIn: 3600,
    });

    await request(app)
      .get("/score/98.765.432-1")
      .set("Authorization", `Bearer ${token}`);

    expect(logs).toEqual([
      {
        event: "http.request.completed",
        context: {
          method: "GET",
          route: "/score/:rut",
          statusCode: 200,
          durationMs: expect.any(Number),
        },
      },
    ]);
    expect(JSON.stringify(logs)).not.toContain("98.765.432-1");
  });
});
