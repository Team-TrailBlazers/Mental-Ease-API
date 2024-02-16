import httpStatus from "http-status";
import { createResource1, getResources1, getResourceById1, updateResource1, deleteResource1} from "../Services/index.js";

export const createResource = async (req, res) => {
    const { resourceType, resourceTitle, resourceDescription, resourceLink } = req.body;
    await createResource1(resourceType, resourceTitle, resourceDescription, resourceLink);
    res.status(httpStatus.CREATED).json({
        message: "Resource created successfully",
    });
};

export const getResources = async (req, res) => {
    const resources = await getResources1();
    res.status(httpStatus.OK).json(resources);
};

export const getResourceById = async (req, res) => {
    const { resourceId } = req.params;
    const resource = await getResourceById1(resourceId);
    res.status(httpStatus.OK).json(resource);
};

export const updateResource = async (req, res) => {
    const { resourceId } = req.params;
    const { resourceType, resourceTitle, resourceDescription, resourceLink } = req.body;
    await updateResource1(resourceId, resourceType, resourceTitle, resourceDescription, resourceLink);
    res.status(httpStatus.OK).json({
        message: "Resource updated successfully",
    });
};

export const deleteResource = async (req, res) => {
    const { resourceId } = req.params;
    await deleteResource1(resourceId);
    res.status(httpStatus.OK).json({
        message: "Resource deleted successfully",
    });
};