import request from "supertest";
import { app } from "../src/server/blockchainServer";
import Block from "../src/lib/block";

jest.mock("../src/lib/blockchain");
jest.mock("../src/lib/block");

describe("BlockchainServer tests", () => {
  test("GET /status", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(200);
    expect(response.body.isValid.success).toBe(true);
  });

  test("GET /blocks/:index (should get Genesis block)", async () => {
    const response = await request(app).get("/blocks/0");
    expect(response.status).toBe(200);
    expect(response.body.index).toBe(0);
  });

  test("GET /blocks/:hash (should get a block)", async () => {
    const response = await request(app).get("/blocks/abc");
    expect(response.status).toBe(200);
    expect(response.body.hash).toBe("abc");
  });

  test("GET /blocks/:index (should NOT get a block)", async () => {
    const response = await request(app).get("/blocks/-1");
    expect(response.status).toBe(404);
  });

  test("POST /blocks (should add a block)", async () => {
    const block = new Block({ index: 1 } as Block);
    const response = await request(app).post("/blocks").send(block);
    expect(response.status).toBe(201);
    expect(response.body.index).toBe(1);
  });

  test("POST /blocks (should NOT add a block (empty))", async () => {
    const response = await request(app).post("/blocks").send({});
    expect(response.status).toBe(422);
  });

  test("POST /blocks (should NOT add a block (invalid))", async () => {
    const block = new Block({ index: -1 } as Block);
    const response = await request(app).post("/blocks").send(block);
    expect(response.status).toBe(400);
  });
});