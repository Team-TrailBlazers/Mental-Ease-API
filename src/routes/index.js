import express from "express";
import appointment from "./Appointment.Route.js";
import stripe from "./StripePayment.Route.js";
import therapist from "./Therapist.Route.js";
import user from "./User.Route.js";
import resource from "./resources.route.js";

const router = express.Router();

const defaultRoutes = [
    {
        path: "/appointment",
        route: appointment,
    },
    {
        path: "/stripe",
        route: stripe,
    },
    {
        path: "/therapist",
        route: therapist,
    },
    {
        path: "/",
        route: user,
    },
    {
        path: "/resource",
        route: resource,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
