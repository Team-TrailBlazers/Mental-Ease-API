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

// Get all Appointments || GET REQUEST
export const getAllAppointments = async (req, res) => {
  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);
    let result = await pool.request().query("SELECT * FROM Appointments");
    result.recordset.length > 0
      ? res.json(result.recordset)
      : res.json({ message: "No appointments found" });
  };
  tryCatchWrapper(handler, req, res);
};

// Get Single Appointment || GET REQUEST
export const getSingleAppointment = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    handleMissingParamsError(res);
    return;
  }
  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);
    let result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Appointments WHERE AppointmentID = @id");
    result.recordset.length > 0
      ? res.json(result.recordset)
      : res.json({ message: "appointment not found" });
  };
  tryCatchWrapper(handler, req, res);
};

//update appointment || PUT REQUEST
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    handleMissingParamsError(res);
    return;
  }
  const handler = async (req, res) => {
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

    // check if appointment exists
    const appointmentExist = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT TOP 1 1 FROM Appointments WHERE AppointmentID = @id");

    if (appointmentExist.recordset.length === 0) {
      res.status(404).json({
        message: "Appointment not found",
      });
      return;
    }

    if (
      !UserID &&
      !TherapistID &&
      !AppointmentDate &&
      !AppointmentTime &&
      !Duration &&
      !Price &&
      !MessageText &&
      !Location &&
      !AppointmentStatus
    ) {
      handleValidationErrors(
        { details: [{ message: "At least one property must be updated" }] },
        res
      );
      return;
    }

    // update appointment
    const updateFields = [];
    const params = {};
    if (UserID) {
      updateFields.push(`UserID = @UserID`);
      params.UserID = sql.Int;
    }
    if (TherapistID) {
      updateFields.push(`TherapistID = @TherapistID`);
      params.TherapistID = sql.Int;
    }
    if (AppointmentDate) {
      updateFields.push(`AppointmentDate = @AppointmentDate`);
      params.AppointmentDate = sql.Date;
    }
    // if (AppointmentTime) {
    //   updateFields.push(`AppointmentTime = @AppointmentTime`);
    //   params.AppointmentTime = sql.TimeTime;
    // }
    if (AppointmentTime) {
      updateFields.push(`AppointmentTime = @AppointmentTime`);
      params.AppointmentTime = sql.VarChar;
    }

    if (Duration) {
      updateFields.push(`Duration = @Duration`);
      params.Duration = sql.Int;
    }
    if (Price) {
      updateFields.push(`Price = @Price`);
      params.Price = sql.Decimal;
    }
    if (MessageText) {
      updateFields.push(`MessageText = @MessageText`);
      params.MessageText = sql.VarChar;
    }
    if (Location) {
      updateFields.push(`Location = @Location`);
      params.Location = sql.VarChar;
    }
    if (AppointmentStatus) {
      updateFields.push(`AppointmentStatus = @AppointmentStatus`);
      params.AppointmentStatus = sql.VarChar;
    }
    const updateQuery = `UPDATE Appointments SET ${updateFields.join(
      ", "
    )} WHERE AppointmentID = @id`;

    const request = pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value, req.body[key]);
    }
    request.input("id", sql.Int, id);

    const updatedResult = await request.query(updateQuery);

    if (updatedResult.rowsAffected[0] === 1) {
      res.status(200).json({
        message: "Appointment updated successfully",
      });
    } else {
      handleServerError(error, res);
    }
  };
  tryCatchWrapper(handler, req, res);
};


//delete appointment || DELETE REQUEST
export const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    handleMissingParamsError(res);
    return;
  }
  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);

    // check if appointment exists
    const appointmentExist = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT TOP 1 1 FROM Appointments WHERE AppointmentID = @id");

    if (appointmentExist.recordset.length === 0) {
      res.status(404).json({
        message: "Appointment not found",
      });
      return;
    }

    // delete appointment
    const deleteResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Appointments WHERE AppointmentID = @id");

    if (deleteResult.rowsAffected[0] === 1) {
      res.status(200).json({
        message: "Appointment deleted successfully",
      });
    } else {
      handleServerError(error, res);
    }
  };
  tryCatchWrapper(handler, req, res);
};