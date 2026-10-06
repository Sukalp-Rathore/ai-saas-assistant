import passport from "passport";
import { env } from "../../config/env.js";
import { deleteUser, loginUser, refreshSession, registerUser, updateUserProfile } from "./auth.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/api/v1/auth"
};

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    res.status(200).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const cookieToken = req.cookies?.refreshToken;
    const bodyToken = req.body?.refreshToken;
    const result = await refreshSession(cookieToken || bodyToken);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    res.status(200).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  res.status(200).json({ success: true, message: "Logged out" });
}

export async function updateProfile(req, res, next) {
  try {
    const user = await updateUserProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProfile(req, res, next) {
  try {
    await deleteUser(req.user.id);
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err) {
    next(err);
  }
}

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

export function googleCallback(req, res, next) {
  passport.authenticate("google", { session: false, failureRedirect: `${env.corsOrigin}/login?error=oauth` }, (err, tokens) => {
    if (err || !tokens) {
      return res.redirect(`${env.corsOrigin}/login?error=oauth`);
    }

    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    const redirectUrl = `${env.corsOrigin}/oauth-callback?access_token=${encodeURIComponent(tokens.accessToken)}&refresh_token=${encodeURIComponent(tokens.refreshToken)}`;
    return res.redirect(redirectUrl);
  })(req, res, next);
}
