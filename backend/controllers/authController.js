import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { createRandomToken, hashToken } from "../utils/tokenUtils.js";
import { sendMail } from "../utils/mailer.js";
import { buildResetPasswordEmail, buildVerifyEmailEmail } from "../utils/emailTemplates.js";

function getFrontendBaseUrl(req) {
  const envBase = process.env.FRONTEND_BASE_URL;
  const origin = req?.headers?.origin;
  if (origin && origin.startsWith("http")) return origin;
  return envBase || "http://localhost:5173";
}

function pickUserPublic(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneE164: user.phoneE164,
    isPhoneVerified: user.isPhoneVerified,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// REGISTER USER
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phoneE164, marketingOptIn } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || "customer",
      phoneE164: phoneE164 ? String(phoneE164).trim() : undefined,
      marketingOptIn: !!marketingOptIn,
      // emailVerified remains false by default for new accounts
    });

    // Create and email verification token
    const { token, tokenHash } = createRandomToken();
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const base = getFrontendBaseUrl(req);
    const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(token)}`;
    const mail = buildVerifyEmailEmail({ verifyUrl });
    let mailResult = null;
    try {
      mailResult = await sendMail({ to: user.email, ...mail });
    } catch (e) {
      mailResult = { delivered: false, failed: true, error: e?.message || String(e) };
    }

    const resp = {
      message: "Account created. Please verify your email to sign in.",
      needsEmailVerification: true,
      user: pickUserPublic(user),
    };
    // Only expose debug URLs in non-production or when MAIL_MODE=debug.
    const mailMode = String(process.env.MAIL_MODE || "").toLowerCase();
    const allowDebug = process.env.NODE_ENV !== "production" || mailMode === "debug";
    if (allowDebug) {
      if (
        (!process.env.SMTP_HOST && !process.env.SMTP_SERVICE) ||
        mailMode === "silent" ||
        (mailResult && mailResult.delivered === false)
      ) {
        resp.debugVerifyUrl = verifyUrl;
      } else if (mailResult && mailResult.debugUrl) {
        resp.debugVerifyUrl = mailResult.debugUrl;
      }
    }

    if (mailResult && mailResult.delivered === false) {
      resp.emailDelivery = mailResult.failed ? "failed" : "pending";
      if (process.env.NODE_ENV !== "production" && mailResult.error) {
        resp.emailError = mailResult.error;
      }
    } else {
      resp.emailDelivery = "sent";
    }

    res.status(201).json(resp);
  } catch (error) {
    next(error); // passes error to global handler
  }
};

// LOGIN USER
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Backward compatibility: if field missing (older users), allow login.
    if (user.emailVerified === false) {
      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before signing in.",
      });
    }

    const accessToken = generateToken(user._id, { expiresIn: rememberMe ? "7d" : "20m" });

    res.status(200).json({
      accessToken,
      user: pickUserPublic(user),
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const rawToken = req.query?.token;
    if (!rawToken) {
      return res.status(400).json({ message: "token is required" });
    }

    const tokenHash = hashToken(rawToken);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully.", user: pickUserPublic(user) });
  } catch (error) {
    next(error);
  }
};

// RESEND VERIFICATION
export const resendVerification = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond 200 to avoid leaking whether a user exists.
    if (!user || user.emailVerified !== false) {
      return res.status(200).json({ message: "If this account exists, a verification email has been sent." });
    }

    const { token, tokenHash } = createRandomToken();
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const base = getFrontendBaseUrl(req);
    const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(token)}`;
    const mail = buildVerifyEmailEmail({ verifyUrl });
    let mailResult = null;
    try {
      mailResult = await sendMail({ to: user.email, ...mail });
    } catch (e) {
      mailResult = { delivered: false, failed: true, error: e?.message || String(e) };
    }

    const resp = { message: "If this account exists, a verification email has been sent." };
    const mailMode = String(process.env.MAIL_MODE || "").toLowerCase();
    const allowDebug = process.env.NODE_ENV !== "production" || mailMode === "debug";
    if (allowDebug) {
      if (
        (!process.env.SMTP_HOST && !process.env.SMTP_SERVICE) ||
        mailMode === "silent" ||
        (mailResult && mailResult.delivered === false)
      ) {
        resp.debugVerifyUrl = verifyUrl;
      } else if (mailResult && mailResult.debugUrl) {
        resp.debugVerifyUrl = mailResult.debugUrl;
      }
    }

    if (mailResult && mailResult.delivered === false) {
      resp.emailDelivery = mailResult.failed ? "failed" : "pending";
      if (process.env.NODE_ENV !== "production" && mailResult.error) {
        resp.emailError = mailResult.error;
      }
    } else {
      resp.emailDelivery = "sent";
    }

    return res.status(200).json(resp);
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond 200 to avoid leaking whether a user exists.
    if (!user) {
      return res.status(200).json({ message: "If this account exists, a reset link has been sent." });
    }

    const { token, tokenHash } = createRandomToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const base = getFrontendBaseUrl(req);
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;
    const mail = buildResetPasswordEmail({ resetUrl });
    let mailResult = null;
    try {
      mailResult = await sendMail({ to: user.email, ...mail });
    } catch (e) {
      mailResult = { delivered: false, failed: true, error: e?.message || String(e) };
    }

    const resp = { message: "If this account exists, a reset link has been sent." };
    if (
      (!process.env.SMTP_HOST && !process.env.SMTP_SERVICE) ||
      String(process.env.MAIL_MODE || "").toLowerCase() === "silent" ||
      (mailResult && mailResult.delivered === false)
    ) {
      resp.debugResetUrl = resetUrl;
    } else if (mailResult && mailResult.debugUrl) {
      resp.debugResetUrl = mailResult.debugUrl;
    }

    if (mailResult && mailResult.delivered === false) {
      resp.emailDelivery = mailResult.failed ? "failed" : "pending";
      if (process.env.NODE_ENV !== "production" && mailResult.error) {
        resp.emailError = mailResult.error;
      }
    } else {
      resp.emailDelivery = "sent";
    }

    return res.status(200).json(resp);
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const rawToken = String(req.body?.token || "");
    const password = String(req.body?.password || "");
    if (!rawToken) return res.status(400).json({ message: "token is required" });
    if (!password) return res.status(400).json({ message: "password is required" });
    if (password.length < 12) return res.status(400).json({ message: "Use at least 12 characters" });

    const tokenHash = hashToken(rawToken);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    user.password = password; // will hash via pre-save
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    return res.status(200).json({ message: "Password updated successfully. Please sign in." });
  } catch (error) {
    next(error);
  }
};

// GET logged-in user's profile
export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

// Update logged-in user's profile
export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password } = req.body;
    if (name) user.name = name;

    if (email) {
      const normalized = String(email).trim().toLowerCase();
      if (normalized && normalized !== user.email) {
        user.email = normalized;
        user.emailVerified = false;

        const { token, tokenHash } = createRandomToken();
        user.emailVerificationTokenHash = tokenHash;
        user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const base = getFrontendBaseUrl(req);
        const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(token)}`;
        const mail = buildVerifyEmailEmail({ verifyUrl });
        await sendMail({ to: user.email, ...mail });
      }
    }

    if (password) user.password = password; // pre-save middleware will hash

    const updated = await user.save();
    res.status(200).json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
  } catch (error) {
    next(error);
  }
};
