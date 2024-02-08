import express from "express";
import {
  registerUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/User.Controller.js";
import { loginUser } from "../controllers/UserLogin.Controller.js";
import { loginAdmin } from "../controllers/AdminLogin.Controller.js";
import { loginTherapist } from "../controllers/TherapistLogin.Controller.js";

const router = express.Router();

router
  .route("/auth/register")
  .post(registerUser)

router
  .route("/users")
  .get(getAllUsers)

router
  .route("/user/:id")
  .get(getSingleUser)

router
  .route("/users/:id")
  .patch(updateUser)
  .delete(deleteUser)

router
  .route("/auth/login")
  .post(loginUser)

router
  .route("/admin/login")
  .post(loginAdmin)

router
  .route("/therapist/login")
  .post(loginTherapist)

export default router;

