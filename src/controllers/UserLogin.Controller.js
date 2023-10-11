import sql from "mssql";
import config from "../db/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { userLoginValidator } from "../Validators/User.Validator.js";

import {
  handleValidationErrors,
  handleUserNotFound,
  tryCatchWrapper,
  handleWrongCredentials,
} from "../factory/Factory.js";

export const loginUser = async (req, res) => {
  const handler = async (req, res) => {
    const { error } = userLoginValidator(req.body);
    if (error) {
      handleValidationErrors(error, res);
      return;
    }
    const { EmailAddress, Password } = req.body;
    let pool = await sql.connect(config.sql);
    let result = await pool
      .request()
      .input("EmailAddress", sql.VarChar, EmailAddress)
      .query("SELECT * FROM Users WHERE EmailAddress = @EmailAddress");
    const user = result.recordset[0];
      if (!user) {
          handleUserNotFound(res);
      } else if (user.Role !== "user") {
          res.status(404).json({
              message: " You are not a user",
          });
      } else {
      const validPassword = bcrypt.compareSync(Password, user.HashedPassword);
      if (!validPassword) {
        handleWrongCredentials(res);
        return;
      }
      const token = jwt.sign(
        {
          UserID: user.UserID,
          FirstName: user.FirstName,
          LastName: user.LastName,
          EmailAddress: user.EmailAddress,
          Role: user.Role,
        },
        config.jwt_secret,
        {
          expiresIn: "24h",
        }
      );
      res.status(200).json({
        message: "User logged in successfully",
        FirstName: user.FirstName,
        LastName: user.LastName,
        EmailAddress: user.EmailAddress,
        Role: user.Role,
        token,
      });
    }
  };
  tryCatchWrapper(handler, req, res);
};
