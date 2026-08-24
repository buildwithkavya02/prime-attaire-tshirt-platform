import { fail } from "../utils/response.js";

export function notFoundHandler(req, res) {
  return fail(res, "Route not found.", 404);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[error]", err);

  if (err.name === "ValidationError") {
    return fail(res, Object.values(err.errors)[0]?.message || "Invalid input.", 400);
  }
  if (err.code === 11000) {
    return fail(res, "A record with that value already exists.", 409);
  }
  if (err.name === "CastError") {
    return fail(res, "Invalid identifier.", 400);
  }

  return fail(res, "Something went wrong. Please try again.", 500);
}
