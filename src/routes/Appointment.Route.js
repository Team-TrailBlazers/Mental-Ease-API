import {
  getAllAppointments,
  getSingleAppointment,
  makeAppointment,
} from "../controllers/Appointments.Controller.js";

const appointmentRoutes = (app) => {
  app.route("/api/appointment").post(makeAppointment);
  app.route("/api/appointment/:id").get(getSingleAppointment);
  app.route("/api/appointments").get(getAllAppointments);
};

export default appointmentRoutes;
