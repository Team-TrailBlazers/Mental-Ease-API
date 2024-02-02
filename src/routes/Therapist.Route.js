import { 
	registerTherapist,
	getAllTherapists,
	getSingleTherapist,
	updateTherapist,
	deleteTherapist,
} from "../controllers/Therapist.Controller.js";

const therapistRoutes = (app) => {
	app.route("/api/therapist").post(registerTherapist).get(getAllTherapists);
	app.route("/api/therapist/:id").get(getSingleTherapist).patch(updateTherapist).delete(deleteTherapist);
};

export default therapistRoutes;