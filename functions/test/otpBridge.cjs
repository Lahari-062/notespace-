const assert = require("node:assert/strict");
const { afterEach, beforeEach, test } = require("node:test");

const { otpBridge } = require("../index");

const originalFetch = global.fetch;
const originalServiceUrl = process.env.OTP_SERVICE_URL;

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function invoke(method, body, headers = {}) {
  const response = createResponse();
  await otpBridge({ method, body, headers }, response);
  return response;
}

beforeEach(() => {
  process.env.OTP_SERVICE_URL = "https://otp-service.invalid";
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalServiceUrl === undefined) {
    delete process.env.OTP_SERVICE_URL;
  } else {
    process.env.OTP_SERVICE_URL = originalServiceUrl;
  }
});

test("preserves the successful OTP response format and HTTP status", async () => {
  const expected = { success: true, message: "Verification code sent." };
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => expected,
  });

  const response = await invoke("POST", {
    action: "send",
    idToken: "non-secret-test-fixture",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, expected);
});

test("returns a safe 503 when the upstream service returns HTTP 503", async () => {
  global.fetch = async () => ({
    ok: false,
    status: 503,
    json: async () => ({
      success: false,
      message: "upstream details must not be exposed",
    }),
  });

  const response = await invoke("POST", {
    action: "verify",
    idToken: "non-secret-test-fixture",
    code: "123456",
  });

  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, {
    success: false,
    message: "The OTP service could not complete the request.",
  });
});

test("returns a safe 502 when the upstream service returns another error status", async () => {
  global.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ success: false, message: "internal upstream error" }),
  });

  const response = await invoke("POST", {
    action: "send",
    idToken: "non-secret-test-fixture",
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.body, {
    success: false,
    message: "The OTP service could not complete the request.",
  });
});

test("preserves an expected OTP rejection returned as a successful HTTP response", async () => {
  const expected = { success: false, message: "Incorrect verification code." };
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => expected,
  });

  const response = await invoke("POST", {
    action: "verify",
    idToken: "non-secret-test-fixture",
    code: "123456",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, expected);
});

test("returns a safe 502 when the upstream network request fails", async () => {
  global.fetch = async () => {
    throw new Error("network failure with sensitive upstream details");
  };

  const response = await invoke("POST", {
    action: "send",
    idToken: "non-secret-test-fixture",
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.body, {
    success: false,
    message: "The OTP service could not complete the request.",
  });
});

test("returns a safe 502 when the upstream response is not valid JSON", async () => {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError("invalid upstream JSON");
    },
  });

  const response = await invoke("POST", {
    action: "send",
    idToken: "non-secret-test-fixture",
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.body, {
    success: false,
    message: "The OTP service could not complete the request.",
  });
});

test("returns a safe 502 when the upstream JSON does not match the OTP response shape", async () => {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ message: "missing success flag" }),
  });

  const response = await invoke("POST", {
    action: "send",
    idToken: "non-secret-test-fixture",
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.body, {
    success: false,
    message: "The OTP service could not complete the request.",
  });
});

test("keeps the existing method and request validation responses", async () => {
  const wrongMethod = await invoke("GET");
  const invalidRequest = await invoke("POST", { action: "send" });

  assert.equal(wrongMethod.statusCode, 405);
  assert.deepEqual(wrongMethod.body, {
    success: false,
    message: "Method not allowed.",
  });
  assert.equal(invalidRequest.statusCode, 400);
  assert.deepEqual(invalidRequest.body, {
    success: false,
    message: "Invalid OTP request.",
  });
});
