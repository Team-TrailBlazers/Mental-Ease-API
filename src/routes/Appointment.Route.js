import express from "express";
import {
    deleteAppointment,
    getAllAppointments,
    getSingleAppointment,
    makeAppointment,
    updateAppointment,
} from "../controllers/Appointments.Controller.js";

const router = express.Router();

router
    .route("/")
    .post(makeAppointment)
    .get(getAllAppointments);

router
    .route("/:id")
    .get(getSingleAppointment)
    .patch(updateAppointment)
    .delete(deleteAppointment);


export default router;
