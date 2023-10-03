import { registerUser } from "../controllers/User.Controller.js";

const userRoutes = (app) => {
  app.route("/api/auth/register").post(registerUser);
};

export default userRoutes;
