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

const userRoutes = (app) => {
  app.route("/api/auth/register").post(registerUser);
  app.route("/api/users").get(getAllUsers);
  app.route("/api/user/:id").get(getSingleUser);
  app.route("/api/users/:id").patch(updateUser);
  app.route("/api/users/:id").delete(deleteUser);

  // LOGIN USER || POST REQUEST
  app.route("/api/auth/login").post(loginUser);

  // LOGIN ADMIN || POST REQUEST
  app.route("/api/admin/login").post(loginAdmin);

  // LOGIN THERAPIST || POST REQUEST
  app.route("/api/therapist/login").post(loginTherapist);
};

export default userRoutes;
