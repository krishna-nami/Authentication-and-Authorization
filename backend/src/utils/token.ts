import jwt from "jsonwebtoken";
import strict from "node:assert/strict";
//genetrate token for login
export const createAccessToken = (
  userId: string,
  role: "user" | "admin",
  tokenVersion: number,
) => {
  const payload = { sub: userId, role, tokenVersion };
  const token = process.env.JWT_ACCESS_SECRET;
  if (!token) {
    throw new Error("Jwt is not defined");
  }
  return jwt.sign(payload, token, {
    expiresIn: "15m",
  });
};

//genetrate refresh token
export const createRefreshToken = (userID: string, tokenVersion: number) => {
  const payload = { sub: userID, tokenVersion };
  const token = process.env.JWT_REFRESH_SECRET;
  if (!token) {
    throw new Error("Jwt is not defined");
  }
  return jwt.sign(payload, token, {
    expiresIn: "7d",
  });
};

//verify Refresh Token
export const verifyRefreshRoken = (token: string) => {
  const refreshKey = process.env.JWT_REFRESH_SECRET;
  if (!refreshKey || typeof refreshKey !== "string") {
    throw new Error("JWT Refresh token is invalid or not present");
  }

  return jwt.verify(token, refreshKey) as {
    sub: string;
    tokenVersion: number;
  };
};

//verify Access Token

export const verifyAccessToken = (token: string) => {
  const accessKey = process.env.JWT_ACCESS_SECRET;
  if (!accessKey || typeof accessKey !== "string") {
    throw new Error("JWT Token token is invalid or not present");
  }

  return jwt.verify(token, accessKey) as {
    sub: string;
    role: "user" | "admin";
    tokenVersion: number;
  };
};
