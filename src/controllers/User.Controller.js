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
          "INSERT INTO Users (FirstName, LastName, EmailAddress,RegistrationDate, HashedPassword) VALUES (@FirstName, @LastName, @EmailAddress,@RegistrationDate, @Password)"
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
    let result = await pool.request().query("SELECT * FROM Users");
    result.recordset.length > 0
      ? res.status(200).json(result.recordset)
      : res.status(404).json({ message: "No users found" });
    // res.json(result.recordset);
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

    if (
      // Check if all fields are empty
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
    }

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

    // User exists, proceed with update
    const updateFields = [];
    if (FirstName) updateFields.push("FirstName = @FirstName");
    if (LastName) updateFields.push("LastName = @LastName");
    if (EmailAddress) updateFields.push("EmailAddress = @EmailAddress");
    if (Password) updateFields.push("HashedPassword = @Password");
    if (ProfilePicture) updateFields.push("ProfilePicture = @ProfilePicture");
    if (Role !== undefined) updateFields.push("Role = @Role");

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
      .input("Password", sql.VarChar, Password)
      .input("ProfilePicture", sql.VarChar, ProfilePicture)
      .input("Role", sql.VarChar, Role)
      .query(updateQuery);

    if (updateResult.rowsAffected[0] === 1) {
      res.status(200).json({ message: "User updated successfully" });
    } else {
      // This is an edge case when the user exists but the update fails for some reason
      handleServerError(res);
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
