import express from "express";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/Resources.Controller.js";

const router = express.Router();

router
    .route("/")
    .post(createResource)
    .get(getResources);

router
    .route("/:id")
    .get(getResourceById)
    .patch(updateResource)
    .delete(deleteResource);

export default router;