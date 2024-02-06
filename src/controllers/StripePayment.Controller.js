import stripe from "stripe";
import config from "./../db/config.js";
import sql from "mssql";
import {tryCatchWrapper } from "../factory/Factory.js";

const stripeInstance = stripe(config.stripe_secret_key);

//checkout session
export const createCheckoutSession = async (req, res) => {
  const customer = await stripeInstance.customers.create({
    metadata: {
      UserID: req.body.UserID,
      clientAppoinmentID: JSON.stringify(req.body.clientAppoinmentID),
    },
  });

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
      customer: customer.id,
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


// webhook integration.

let endpointSecret;
//  endpointSecret= "whsec_f92c3adf007e1208809b7e64e464b28caace836c0777b4cafc1696720dc093e4";

export const webhookEvents = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let data;
  let eventType;

  if (endpointSecret) {
    let event;

    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("WebHook verified");
    } catch (err) {
      console.log("Webhook Error: ", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    if (stripeInstance && stripeInstance.customers) {
      // Check if stripeInstance.customers.retrieve is defined before using it
      if (stripeInstance.customers.retrieve) {
        try {
          const customer = await stripeInstance.customers.retrieve(data.customer);
          // console.log("Customer: ", customer);
          // console.log("data: ", data);
          bookAppointment(customer, data)
        } catch (err) {
          console.log("Error retrieving customer: ", err.message);
        }
      } else {
        console.error("stripeInstance.customers.retrieve is not defined");
      }
    } else {
      console.error("stripeInstance or stripeInstance.customers is not defined");
    }

    console.log("Payment was successful");
  }

  res.send().end();
}


const bookAppointment = async (customer, data, req, res) => {
  try {
    const AppointArray = JSON.parse(customer.metadata.clientAppoinmentID);
    const AppointmentID = AppointArray[0].id;
    const UserID = JSON.parse(customer.metadata.UserID);

    console.log("appointment " + AppointmentID);
    console.log("user_id " + UserID);

    // ({ AppointmentID, UserID } = req.body);

    let pool = await sql.connect(config.sql);
    await pool
      .request()
      .input("AppointmentID", sql.Int, AppointmentID)
      .input("UserID", sql.Int, UserID)
      .query("UPDATE Appointments SET AppointmentStatus = 'booked' WHERE AppointmentID = @AppointmentID");

    if (res) {
      res.status(201).json({
        message: "Appointment created successfully",
      });
    } 
    // else {
    //   console.error("Failed to create appointment: Response object is undefined");
    // }
  } catch (error) {
    if (res) {
      res.status(500).json({
        message: "Failed to create appointment",
        error: error.message,
      });
    } 
    // else {
    //   console.error("Failed to create appointment:", error.message);
    // }
  }
};