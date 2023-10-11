import { makeAppointment } from "../controllers/Appointments.Controller.js";

const appointmentRoutes = (app) => {
  app.route("/api/appointment").post(makeAppointment);
};

export default appointmentRoutes;
