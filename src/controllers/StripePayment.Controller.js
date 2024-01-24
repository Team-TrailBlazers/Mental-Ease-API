import stripe from "stripe";
import config from "./../db/config.js";
import sql from "mssql";
import { tryCatchWrapper } from "../factory/Factory.js";

const stripeInstance = stripe(config.stripe_secret_key);

export const createCheckoutSession = async (req, res) => {
  const handler = async (req, res) => {
    const clientAppointmentIDs = req.body.clientAppoinmentID;
    const pool = await sql.connect(config.sql);

    const line_items = await Promise.all(
      clientAppointmentIDs.map(async (app) => {
        const appointmentID = app.id;
        const result = await pool
          .request()
          .input("AppointmentID", sql.Int, appointmentID)
          .query(
            "SELECT Price FROM Appointments WHERE AppointmentID = @AppointmentID"
          );

        const appointment = result.recordset[0];
        
        if (!appointment) {
          res.status(404).json({
            message: "Appointment not found",
          });
          return;
        }

        return {
          price_data: {
            currency: "kes",
            product_data: {
              name: "Appointment",
            },
            unit_amount: appointment.Price * 100,
          },
          quantity: 1,
        };
      })
    );

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${config.client}/success`,
      cancel_url: `${config.client}/stripe`,
    });

    if (session) {
      res.status(200).json({ url: session.url });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  tryCatchWrapper(handler, req, res);
};
