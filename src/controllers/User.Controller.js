import sql from "mssql";
import config from "../db/config.js";
import bcrypt from "bcrypt";

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
} from "./../factory/Factory.js";

// user registration || POST REQUEST
export const registerUser = async (req, res) => {
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
      .query("SELECT * FROM Users WHERE EmailAddress = @EmailAddress");

    const user = result.recordset[0];
    if (user) {
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
          "INSERT INTO Users (FirstName, LastName, EmailAddress, RegistrationDate, HashedPassword, IsTherapist) VALUES (@FirstName, @LastName, @EmailAddress, @RegistrationDate, @Password, 0)"
        );
      res.status(201).json({
        message: "User created successfully",
      });
    }
  };
  tryCatchWrapper(handler, req, res);
};

//GET ALL USERS || GET REQUEST
export const getAllUsers = async (req, res) => {
  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);
    let result = await pool
      .request()
      .query(
        "SELECT UserID, FirstName, LastName, EmailAddress, RegistrationDate, ProfilePicture, Role, IsTherapist FROM Users"
      );
    result.recordset.length > 0
      ? res.status(200).json(result.recordset)
      : res.status(404).json({ message: "No users found" });
  };
  tryCatchWrapper(handler, req, res);
};

// Get Single User || GET REQUEST
export const getSingleUser = async (req, res) => {
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
        "SELECT UserID, FirstName, LastName, EmailAddress, RegistrationDate, ProfilePicture, Role, IsTherapist FROM Users WHERE UserID = @id"
      );
    result.recordset.length > 0
      ? res.status(200).json(result.recordset[0])
      : handleUserNotFound(res);
  };
  tryCatchWrapper(handler, req, res);
};

// UPDATE USER || POST REQUEST
export const updateUser = async (req, res) => {
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
    // Check if the user exists before attempting to update
    const userExists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT TOP 1 1 FROM Users WHERE UserID = @id");

    if (userExists.recordset.length === 0) {
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
      SELECT TOP 1 1 FROM Users WHERE EmailAddress = @EmailAddress AND UserID != @innerId
    `;

      const emailExistsResult = await pool
        .request()
        .input("EmailAddress", sql.VarChar, EmailAddress)
        .input("id", sql.Int, id)
        .query(emailExistsQuery);

      if (emailExistsResult.recordset.length > 0) {
        // Email address is already in use by another user
        handleValidationErrors(
          { details: [{ message: "Email address is already in use" }] },
          res
        );
        return;
      }
    }

    // User exists, proceed with update
    let hashedPassword;
    if (Password) {
      hashedPassword = bcrypt.hashSync(Password, 10); // Hash the updated password
    }
    const updateFields = [];
    if (FirstName) updateFields.push("FirstName = @FirstName");
    if (LastName) updateFields.push("LastName = @LastName");
    if (EmailAddress) updateFields.push("EmailAddress = @EmailAddress");
    if (Password) updateFields.push("HashedPassword = @HashedPassword");
    if (ProfilePicture) updateFields.push("ProfilePicture = @ProfilePicture");
    if (Role !== undefined) {
      updateFields.push("Role = @Role");
      if (Role === "therapist") {
        updateFields.push("IsTherapist = 1"); // Update IsTherapist to 1 when Role is updated to "therapist"
      }
    }

    const updateQuery = `
      UPDATE Users SET
        ${updateFields.join(", ")} 
      WHERE UserID = @id
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
      res.status(200).json({ message: "User updated successfully" });
    } else {
      handleServerError(error, res);
    }
  };

  tryCatchWrapper(handler, req, res);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    handleMissingParamsError(res);
    return;
  }

  const handler = async (req, res) => {
    let pool = await sql.connect(config.sql);

    // Check if the user exists before attempting to delete
    const userExists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT TOP 1 1 FROM Users WHERE UserID = @id");

    if (userExists.recordset.length === 0) {
      handleUserNotFound(res);
      return;
    }

    // User exists, proceed with deletion
    const deleteResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Users WHERE UserID = @id");

    if (deleteResult.rowsAffected[0] === 1) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      // This is an edge case when the user exists but the deletion fails for some reason
      handleServerError(res);
    }
  };

  tryCatchWrapper(handler, req, res);
};
