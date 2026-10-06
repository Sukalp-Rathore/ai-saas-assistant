import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../modules/auth/auth.model.js";
import { createDefaultOrganization } from "../modules/organizations/organizations.service.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { env } from "./env.js";

export function configurePassport() {
  if (!env.googleClientId || !env.googleClientSecret) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("Google account has no email"));
          }

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName || email,
              email,
              passwordHash: "oauth",
              role: "owner",
              googleId: profile.id,
            });
            await createDefaultOrganization(user._id, `${user.name} Organization`);
          }

          const tokenPayload = { sub: user._id.toString(), role: user.role };
          const accessToken = signAccessToken(tokenPayload);
          const refreshToken = signRefreshToken(tokenPayload);

          return done(null, {
            user,
            accessToken,
            refreshToken,
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}
