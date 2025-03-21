import { app, server } from "../src/server/server";
import request from "supertest";

// Close the server after all tests are done
afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe("Server Root Endpoint", () => {
  it("should serve the index.html file with a 200 status code", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toEqual(200);
    expect(response.text).toMatch(/<!doctype html>/i);
  });
});
