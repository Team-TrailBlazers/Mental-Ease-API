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
  handleUserExists,
  handleUserNotFound,
  tryCatchWrapper,
  handleWrongCredentials,
  handleInvalidUser,
} from "./../factory/Factory.js";

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
