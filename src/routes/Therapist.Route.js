import express from "express";
import { 
	registerTherapist,
	getAllTherapists,
	getSingleTherapist,
	updateTherapist,
	deleteTherapist,
} from "../controllers/Therapist.Controller.js";

const router = express.Router();

router
	.route("/")
	.post(registerTherapist)
	.get(getAllTherapists);

router
	.route("/:id")
	.get(getSingleTherapist)
	.patch(updateTherapist)
	.delete(deleteTherapist);

export default router;