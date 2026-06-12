import type { Request, Response } from "express";
import {
  forgetPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import { User } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/passwordHash.js";
import { sendEmail } from "../lib/email.js";
import jwt from "jsonwebtoken";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshRoken,
} from "../utils/token.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { platform } from "os";
import { sendError, sendSuccess } from "../utils/errorsHandler.js";
import { generateSecret, generateURI } from "otplib";

const getUrl = () => {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
};
const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error("Google Client or secret is missing");
  }
  if (!redirectUri) {
    throw new Error("Redirect Uri is missing");
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });
};

export const userRegister = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: result.error.issues,
      });
    }

    const { name, email, password } = result.data;

    const normalizeEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizeEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User is already Registred!!, Please try another email",
      });
    }
    const hashPass = await hashPassword(password);

    const newUser = await User.create({
      email: normalizeEmail,
      passwordHash: hashPass,
      name,
      role: "user",
      isEmailVerified: false,
      twoFactorEnabled: false,
    });

    //Email verification part.

    const verifyToken = jwt.sign(
      {
        sub: newUser.id,
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1d" },
    );

    const urlLink = `${getUrl()}/auth/verify-email?token=${verifyToken}`;
    const reciepentEmail =
      process.env.NODE_ENV === "production"
        ? newUser.email
        : "fullbrightmoonis.me@gmail.com";
    console.log(reciepentEmail);

    await sendEmail(
      reciepentEmail,
      "Please Verify your email",
      `<p>Please verify your email by clicking the link Below:</p>
      <p> <a href="${urlLink}"> ${urlLink}</a></p>
      `,
    );

    return res.status(201).json({
      message: "User Registraton Successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isEmailVErified: newUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  const token = req.query.token;

  try {
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Token is missing!",
        success: false,
      });
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      return res.status(500).json({
        message: "Internal serve error",
        success: false,
      });
    }

    const payload = jwt.verify(token, secret) as { sub: string };

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.json({ message: "User is Already Verified" });
    }
    user.isEmailVerified = true;
    await user.save();

    return res.json({ message: "email is now verified!!, Now you can login" });
  } catch (error) {
    console.log("Problem with the link, please try ti again!!", error);
    res.status(400).json({
      message: "Internal Server Errror",
    });
  }
};

export const loginHander = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Please enter the fields correctly or Invalid data",
        error: result.error.issues,
      });
    }

    const { email, password } = result.data;

    const normalizeEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizeEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The email or Password is incorrect",
      });
    }

    const userCheck = await comparePassword(password, user.passwordHash);

    if (!userCheck) {
      return res.status(401).json({
        success: false,
        message: "The email or Password is incorrect",
      });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please Verify your email before login",
      });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Please Verify your email before login",
      });
    }

    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User Login Successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVErified: user.isEmailVerified,
        twoFacorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User is not authorized",
      });
    }

    const payload = verifyRefreshRoken(token);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res
        .status(401)
        .json({ message: "Refresh Token is already invalidated" });
    }

    const newAccessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );
    const newRefreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Token Refreshed",
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.log("Error Encountred:", error);
    res.status(400).json({
      message: "Internal Server Errror",
    });
  }
};
export const logoutHandler = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", { path: "/" });
  return res.status(200).json({
    success: true,
    message: "User has Successfully logged out",
  });
};

export const forgetPasswordHandler = async (req: Request, res: Response) => {
  const result = forgetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ success: false, message: "Email is requied!!" });
  }
  const { email } = result.data;
  const normalizeEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizeEmail });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHashed = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = tokenHashed;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl = `${getUrl()}/auth/reset-password?token=${rawToken}`;

    await sendEmail(
      user.email,
      "Link to reset the Password",
      `<p>Please click the link below to reset the password<p/>
       <p> <a href="${resetUrl}">${resetUrl}</a></p>
      `,
    );

    return res.json({
      message:
        "If an account exist, we will send you an email with the reset link",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const result = resetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: result.error.issues[0]?.message ?? "Invalid Input" });
  }

  const { password, token } = result.data;

  try {
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid user or token" });
    }

    const newPassword = await hashPassword(password);

    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tokenVersion = user.tokenVersion + 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error Encountred:", error);
    res.status(500).json({
      message: "Internal Server Errror",
    });
  }
};

export const googleAuthHandler = async (req: Request, res: Response) => {
  try {
    const client = getGoogleClient();

    const url = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
    });
    return res.redirect(url);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const googleCallbackHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) {
    return res.status(400).json({
      message: "Missing code in callback",
    });
  }

  try {
    const client = getGoogleClient();

    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return res.status(400).json({
        message: "No google Id token is present.",
      });
    }
    //verify ID token and read the user info from it.
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        message: "Please use the valid email to verified",
      });
    }

    const email = payload.email;
    const emailVerified = payload.email_verified;

    if (!email || !emailVerified) {
      return sendError(res, 400, "Google email not exist or is not verified");
    }

    const normalizeEmail = email?.toLowerCase().trim();

    let user = await User.findOne({ email: normalizeEmail });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");

      const passwordHash = await hashPassword(randomPassword);

      user = await User.create({
        email: normalizeEmail,
        passwordHash,
        role: "user",
        name: payload.name ?? null,
        isEmailVerified: true,
        twoFactorEnabled: false,
      });
    } else {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }
    }
    const accessToken = createAccessToken(
      user.id,
      user.role as "user" | "admin",
      user.tokenVersion,
    );

    const refreshToken = createRefreshToken(user.id, user.tokenVersion);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(
      res,
      200,
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      "Login Successful with the Email",
      accessToken,
    );
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Internal Server Error");
  }
};

export const twofacorSetupHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 401, "User is not authenticated");
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const secret = generateSecret();
    const issuer = "NodeAuthApplication";
    const optAuthURl = generateURI({ label: user.email, issuer, secret });

    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false;

    await user.save();

    return res.json({
      message: "2FA authenticatin setup is done",
      optAuthURl,
      secret,
    });
  } catch (error) {
    console.log(error);

    return sendError(res, 500, "Internal server Error");
  }
};
