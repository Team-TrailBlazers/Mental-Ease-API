import sql from "mssql";
import config from "../db/config.js";
import bcrypt from "bcrypt";

import { appointmentValidator } from "./../Validators/Appointment.Validator.js";

import {
  handleValidationErrors,
  handleMissingParamsError,
  handleServerError,
  handleUserExists,
  handleUserNotFound,
  tryCatchWrapper,
} from "./../factory/Factory.js";

// createAppointment || POST REQUEST
export const makeAppointment = async (req, res) => {
  const handler = async (req, res) => {
    const { error } = appointmentValidator(req.body);
    if (error) {
      handleValidationErrors(error, res);
      return;
    }
    // const { UserID } = req.user;
    const {
      UserID,
      TherapistID,
      AppointmentDate,
      AppointmentTime,
      Duration,
      Price,
      MessageText,
      Location,
      AppointmentStatus,
    } = req.body;

    let pool = await sql.connect(config.sql);
    let result = await pool
      .request()
      .input("UserID", sql.Int, UserID)
      .input("TherapistID", sql.Int, TherapistID)
      .input("AppointmentDate", sql.Date, AppointmentDate)
      .input("AppointmentTime", sql.VarChar, AppointmentTime)
      .input("Duration", sql.Int, Duration)
      .input("Price", sql.Decimal, Price)
      .input("MessageText", sql.VarChar, MessageText)
      .input("Location", sql.VarChar, Location)
      .input("AppointmentStatus", sql.VarChar, AppointmentStatus)
      .query(
        `INSERT INTO Appointments
         (UserID, TherapistID, AppointmentDate,AppointmentTime, Duration, Price, MessageText, Location, AppointmentStatus) 
         VALUES
          (@UserID, @TherapistID, @AppointmentDate, @AppointmentTime, @Duration, @Price, @MessageText, @Location, @AppointmentStatus)`
      );
    res.status(201).json({
      message: "Appointment created successfully",
    });
  };
  tryCatchWrapper(handler, req, res);
};
