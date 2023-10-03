import jwt from "jsonwebtoken";
import config from "../db/config.js";

export const authMiddleware = (app) => {
  app.use((req, res, next) => {
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "JWT"
    ) {
      jwt.verify(
        req.headers.authorization.split(" ")[1],
        config.jwt_secret,
        (err, decode) => {
          if (err) req.user = undefined;
          req.user = decode;
          next();
        }
      );
    } else {
      req.user = undefined;
      next();
    }
  });
};

// Levels of user access
export const userRoleLoginRequired = (Role) => (req, res, next) => {
  if (req.user) {
    // if user is logged in
    if (req.user.Role === Role) {
      next();
    } else if (Role === "admin") {
      // if user is admin
      next();
    } else if (Role === "therapist") {
      // if user is therapist
      next();
    } else if (
      Role === "all" &&
      (req.user.Role === "admin" ||
        req.user.Role === "therapist" ||
        req.user.Role === "user")
    ) {
      next();
    } else {
      // if user is not admin or therapist or user
      res.status(401).json({
        message: "Unauthorized User!",
      });
    }
  } else {
    // if user is not logged in
    return res
      .status(401)
      .json({ message: "Unauthorized user, invalid or missing token!" });
  }
};

export const userLoginRequired = userRoleLoginRequired("user");
export const therapistLoginRequired = userRoleLoginRequired("therapist");
export const adminLoginRequired = userRoleLoginRequired("admin");
export const allLoginRequired = userRoleLoginRequired("all");
