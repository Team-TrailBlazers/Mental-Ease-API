import sql from "mssql";
import config from "../db/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { adminLoginValidator } from "../Validators/Admin.Validator.js";

import {
  handleValidationErrors,
  handleUserNotFound,
  tryCatchWrapper,
  handleWrongCredentials,
} from "../factory/Factory.js";

export const loginAdmin = async (req, res) => {
  const handler = async (req, res) => {
    const { error } = adminLoginValidator(req.body);
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
    const admin = result.recordset[0];
    if (!admin) {
      handleUserNotFound(res);
    } else if (admin.Role !== "admin") {
      res.status(404).json({
        message: "You are not an admin",
      });
    } else {
      const validPassword = bcrypt.compareSync(Password, admin.HashedPassword);
      if (!validPassword) {
        handleWrongCredentials(res);
        return;
      }
      const token = jwt.sign(
        {
          UserID: admin.UserID,
          FirstName: admin.FirstName,
          LastName: admin.LastName,
          EmailAddress: admin.EmailAddress,
          Role: admin.Role,
        },
        config.jwt_secret,
        {
          expiresIn: "24h",
        }
      );
      res.status(200).json({
        message: "Admin logged in successfully",
        token,
      });
    }
  };
  tryCatchWrapper(handler, req, res);
};
