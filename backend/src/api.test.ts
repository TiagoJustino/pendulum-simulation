import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import request from "supertest";
import { EventEmitter } from "node:events";

vi.mock("child_process", () => ({
  fork: vi.fn(() => {
    const child = new EventEmitter();
    (child as any).send = vi.fn();
    return child;
  }),
}));

const { createApp } = await import("./createApp.js");

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp();
});

afterEach(async () => {
  await request(app).delete("/pendulum");
});

const validPayload = { angle: 45, length: 100, pivotPosition: { x: 200, y: 50 } };

describe("POST /add-pendulum", () => {
  it("returns an id on valid input", async () => {
    const res = await request(app).post("/add-pendulum").send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(typeof res.body.id).toBe("string");
    expect(res.body.id.length).toBeGreaterThan(0);
  });

  it("returns unique ids for multiple pendulums", async () => {
    const res1 = await request(app).post("/add-pendulum").send(validPayload);
    const res2 = await request(app).post("/add-pendulum").send(validPayload);

    expect(res1.body.id).not.toBe(res2.body.id);
  });

  it("returns 400 when angle is missing", async () => {
    const res = await request(app)
      .post("/add-pendulum")
      .send({ length: 100, pivotPosition: { x: 200, y: 50 } });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when length is missing", async () => {
    const res = await request(app)
      .post("/add-pendulum")
      .send({ angle: 45, pivotPosition: { x: 200, y: 50 } });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when pivotPosition is missing", async () => {
    const res = await request(app)
      .post("/add-pendulum")
      .send({ angle: 45, length: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when length is negative", async () => {
    const res = await request(app)
      .post("/add-pendulum")
      .send({ angle: 45, length: -10, pivotPosition: { x: 200, y: 50 } });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when angle is not a number", async () => {
    const res = await request(app)
      .post("/add-pendulum")
      .send({ angle: "foo", length: 100, pivotPosition: { x: 200, y: 50 } });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 on empty body", async () => {
    const res = await request(app)
      .post("/add-pendulum")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("DELETE /pendulum/:id", () => {
  it("returns success after creating a pendulum", async () => {
    const createRes = await request(app).post("/add-pendulum").send(validPayload);

    const res = await request(app).delete(`/pendulum/${createRes.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("returns success for non-existent id", async () => {
    const res = await request(app).delete("/pendulum/non-existent-id");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe("DELETE /pendulum", () => {
  it("shuts down all pendulums", async () => {
    await request(app).post("/add-pendulum").send(validPayload);
    await request(app).post("/add-pendulum").send(validPayload);

    const res = await request(app).delete("/pendulum");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("succeeds with no running pendulums", async () => {
    const res = await request(app).delete("/pendulum");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("allows creating new pendulums after bulk delete", async () => {
    await request(app).post("/add-pendulum").send(validPayload);
    await request(app).delete("/pendulum");

    const res = await request(app).post("/add-pendulum").send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
  });
});

describe("PUT /pendulum/:id", () => {
  it("returns success when updating an existing pendulum", async () => {
    const createRes = await request(app).post("/add-pendulum").send(validPayload);

    const res = await request(app)
      .put(`/pendulum/${createRes.body.id}`)
      .send({ angle: 90, length: 200, pivotPosition: { x: 300, y: 100 } });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("returns success for non-existent id", async () => {
    const res = await request(app)
      .put("/pendulum/non-existent-id")
      .send({ angle: 90, length: 200, pivotPosition: { x: 300, y: 100 } });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("returns 400 on invalid body", async () => {
    const createRes = await request(app).post("/add-pendulum").send(validPayload);

    const res = await request(app)
      .put(`/pendulum/${createRes.body.id}`)
      .send({ angle: "bad" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /position/:id", () => {
  it("returns error for non-existent pendulum", async () => {
    const res = await request(app).get("/position/non-existent-id");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Pendulum not initialized" });
  });
});
