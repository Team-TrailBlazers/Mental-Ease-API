import {
    deleteAppointment,
  getAllAppointments,
  getSingleAppointment,
  makeAppointment,
  updateAppointment,
} from "../controllers/Appointments.Controller.js";

const appointmentRoutes = (app) => {
  app.route("/api/appointment").post(makeAppointment);
  app.route("/api/appointment/:id").get(getSingleAppointment);
  app.route("/api/appointments").get(getAllAppointments);
    app.route("/api/appointment/:id").patch(updateAppointment);
    // delete appointment || DELETE REQUEST
    app.route("/api/appointment/:id").delete(deleteAppointment);
};

export default appointmentRoutes;
