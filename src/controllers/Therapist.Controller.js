import sql from "mssql";
import config from "../db/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  UserRegisterValidator,
  userLoginValidator,
} from "../Validators/User.Validator.js";

import {
  handleValidationErrors,
  handleMissingParamsError,
  handleServerError,
  handleUserExists,
  handleUserNotFound,
  tryCatchWrapper,
  handleWrongCredentials,
  handleInvalidUser,
} from "./../factory/Factory.js";

// therapist registration || POST REQUEST
export const registerTherapist = async (req, res) => {
  const handler = async (req, res) => {
    const { error } = UserRegisterValidator(req.body);
    if (error) {
      handleValidationErrors(error, res);
      return;
    }
    const { FirstName, LastName, EmailAddress, Password } = req.body;

    let pool = await sql.connect(config.sql);
    let result = await pool
      .request()
      .input("EmailAddress", sql.VarChar, EmailAddress)
      .query("SELECT * FROM Therapists WHERE EmailAddress = @EmailAddress");

    const therapist = result.recordset[0];
    if (therapist) {
      handleUserExists(res);
      return;
    } else {
      const hashedPassword = bcrypt.hashSync(Password, 10);
      let pool = await sql.connect(config.sql);
      let result = await pool
        .request()
        .input("FirstName", sql.VarChar, FirstName)
        .input("LastName", sql.VarChar, LastName)
        .input("RegistrationDate", sql.DateTime, new Date())
        .input("EmailAddress", sql.VarChar, EmailAddress)
        .input("Password", sql.VarChar, hashedPassword)
        .query(
          "INSERT INTO Therapists (FirstName, LastName, EmailAddress,RegistrationDate, HashedPassword) VALUES (@FirstName, @LastName, @EmailAddress,@RegistrationDate, @Password)"
        );
      res.status(201).json({
        message: "Therapist created successfully",
      });
    }
  };
  tryCatchWrapper(handler, req, res);
};

//GET ALL THERAPISTS || GET REQUEST
export const getAllTherapists = async (req, res) => {
  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);
    let result = await pool
      .request()
      .query(
        "SELECT TherapistID, FirstName, LastName, EmailAddress, LicenseNumber, ProfilePicture, Location, Specialization, TreatmentApproach FROM Therapists"
      );
    result.recordset.length > 0
      ? res.status(200).json(result.recordset)
      : res.status(404).json({ message: "No therapists found" });
    // res.json(result.recordset);
  };
  tryCatchWrapper(handler, req, res);
};

// Get Single Therapist || GET REQUEST
export const getSingleTherapist = async (req, res) => {
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
      .query(
        "SELECT TherapistID, FirstName, LastName, EmailAddress, RegistrationDate, ProfilePicture, Role FROM Therapists WHERE TherapistID = @id"
      );
    result.recordset.length > 0
      ? res.status(200).json(result.recordset[0])
      : handleUserNotFound(res);
  };
  tryCatchWrapper(handler, req, res);
};

// UPDATE THERAPIST || POST REQUEST
export const updateTherapist = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    handleMissingParamsError(res);
    return;
  }
  const handler = async (req, res) => {
    const {
      FirstName,
      LastName,
      EmailAddress,
      Password,
      ProfilePicture,
      Role,
    } = req.body;

    let pool = await sql.connect(config.sql);
    // Check if the therapist exists before attempting to update
    const therapistExists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT TOP 1 1 FROM Therapists WHERE TherapistID = @id");

    if (therapistExists.recordset.length === 0) {
      handleUserNotFound(res);
      return;
    }

    // Check if all fields are empty
    if (
      !FirstName &&
      !LastName &&
      !EmailAddress &&
      !Password &&
      !ProfilePicture &&
      Role === undefined // Check if Role is provided in the request
    ) {
      handleValidationErrors(
        { details: [{ message: "At least one property must be updated" }] },
        res
      );
      return;
    } else if (EmailAddress) {
      const emailExistsQuery = `
      DECLARE @innerId INT = @id;
      SELECT TOP 1 1 FROM Therapists WHERE EmailAddress = @EmailAddress AND TherapistID != @innerId
    `;

      const emailExistsResult = await pool
        .request()
        .input("EmailAddress", sql.VarChar, EmailAddress)
        .input("id", sql.Int, id)
        .query(emailExistsQuery);

      if (emailExistsResult.recordset.length > 0) {
        // Email address is already in use by another therapist
        handleValidationErrors(
          { details: [{ message: "Email address is already in use" }] },
          res
        );
        return;
      }
    }

    // Therapist exists, proceed with update
    const hashedPassword = bcrypt.hashSync(Password, 10); // Hash the updated password
    const updateFields = [];
    if (FirstName) updateFields.push("FirstName = @FirstName");
    if (LastName) updateFields.push("LastName = @LastName");
    if (EmailAddress) updateFields.push("EmailAddress = @EmailAddress");
    if (Password) updateFields.push("HashedPassword = @HashedPassword");
    if (ProfilePicture) updateFields.push("ProfilePicture = @ProfilePicture");
    if (Role !== undefined) updateFields.push("Role = @Role");

    const updateQuery = `
      UPDATE Therapists SET
        ${updateFields.join(", ")} 
      WHERE TherapistID = @id
    `;

    const updateResult = await pool
      .request()
      .input("id", sql.Int, id)
      .input("FirstName", sql.VarChar, FirstName)
      .input("LastName", sql.VarChar, LastName)
      .input("EmailAddress", sql.VarChar, EmailAddress)
      .input("HashedPassword", sql.VarChar, hashedPassword)
      .input("ProfilePicture", sql.VarChar, ProfilePicture)
      .input("Role", sql.VarChar, Role)
      .query(updateQuery);

    if (updateResult.rowsAffected[0] === 1) {
      res.status(200).json({ message: "Therapist updated successfully" });
    } else {
      // This is an edge case when the therapist exists but the update fails for some reason
      handleServerError(res);
    }
  };

  tryCatchWrapper(handler, req, res);
};

export const deleteTherapist = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    handleMissingParamsError(res);
    return;
  }

  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);

    // Check if the therapist exists before attempting to delete
    const therapistExists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT TOP 1 1 FROM Therapists WHERE TherapistID = @id");

    if (therapistExists.recordset.length === 0) {
      handleUserNotFound(res);
      return;
    }

    // Therapist exists, proceed with deletion
    const deleteResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Therapists WHERE TherapistID = @id");

    if (deleteResult.rowsAffected[0] === 1) {
      res.status(200).json({ message: "Therapist deleted successfully" });
    } else {
      // This is an edge case when the therapist exists but the deletion fails for some reason
      handleServerError(res);
    }
  };

  tryCatchWrapper(handler, req, res);
};