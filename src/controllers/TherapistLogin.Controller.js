import sql from "mssql";
import config from "../db/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { therapistLoginValidator } from "../Validators/Admin.Validator.js";

import {
  handleValidationErrors,
  handleUserNotFound,
  tryCatchWrapper,
  handleWrongCredentials,
} from "../factory/Factory.js";

export const loginTherapist = async (req, res) => {
  const handler = async (req, res) => {
    const { error } = therapistLoginValidator(req.body);
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
    const therapist = result.recordset[0];
    if (!therapist) {
      handleUserNotFound(res);
    } else if (therapist.Role !== "therapist") {
      handleUserNotFound(res);
    } else {
      const validPassword = bcrypt.compareSync(
        Password,
        therapist.HashedPassword
      );
      if (!validPassword) {
        handleWrongCredentials(res);
        return;
      }
      const token = jwt.sign(
        {
          UserID: therapist.UserID,
          FirstName: therapist.FirstName,
          LastName: therapist.LastName,
          EmailAddress: therapist.EmailAddress,
          Role: therapist.Role,
        },
        config.jwt_secret,
        {
          expiresIn: "24h",
        }
      );
      res.status(200).json({
        message: "Therapist logged in successfully",
        token,
      });
    }
  };
  tryCatchWrapper(handler, req, res);
};
