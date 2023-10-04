import {
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/User.Controller.js";

const userRoutes = (app) => {
  app.route("/api/auth/register").post(registerUser);
  app.route("/api/users").get(getAllUsers);
  app.route("/api/users/:id").patch(updateUser);
  app.route("/api/users/:id").delete(deleteUser);
};

export default userRoutes;
