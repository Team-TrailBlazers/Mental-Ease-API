import {
  getAllAppointments,
  makeAppointment,
} from "../controllers/Appointments.Controller.js";

const appointmentRoutes = (app) => {
  app.route("/api/appointment").post(makeAppointment);
  // get all appoinments
  app.route("/api/appointments").get(getAllAppointments);
};

export default appointmentRoutes;
