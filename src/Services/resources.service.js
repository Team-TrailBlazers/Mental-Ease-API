import sql from "mssql";
import httpStatus from "http-status";
import config from "../db/config.js";
import ApiError from "../Utils/ApiError.js";


export const createResource1 = async (req, res) => {
    const { resourceType, resourceTitle, resourceDescription, resourceLink } = req.body;
    let pool = await sql.connect(config.sql);
    let result = await pool
        .request()
        .input("resourceType", sql.VarChar, resourceType)
        .input("resourceTitle", sql.VarChar, resourceTitle)
        .input("resourceDescription", sql.VarChar, resourceDescription)
        .input("resourceLink", sql.VarChar, resourceLink)
        .query(
        `INSERT INTO Resources
         (resourceType, resourceTitle, resourceDescription, resourceLink) 
         VALUES
            (@resourceType, @resourceTitle, @resourceDescription, @resourceLink)`
        );
    res.status(httpStatus.CREATED).json({
        message: "Resource created successfully",
    });
};

export const getResources1 = async (req, res) => {
    let pool = await sql.connect(config.sql);
    let result = await pool.request().query("SELECT * FROM Resources");
    res.status(httpStatus.OK).json(result.recordset);
};

export const getResourceById1 = async (req, res) => {
    const { resourceId } = req.params;
    let pool = await sql.connect(config.sql);
    let result = await pool
        .request()
        .input("resourceId", sql.Int, resourceId)
        .query("SELECT * FROM Resources WHERE resourceId = @resourceId");
    if (result.recordset.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "Resource not found");
    }
    res.status(httpStatus.OK).json(result.recordset);
};

export const updateResource1 = async (req, res) => {
    const { resourceId } = req.params;
    const { resourceType, resourceTitle, resourceDescription, resourceLink } = req.body;
    let pool = await sql.connect(config.sql);
    let result = await pool
        .request()
        .input("resourceId", sql.Int, resourceId)
        .input("resourceType", sql.VarChar, resourceType)
        .input("resourceTitle", sql.VarChar, resourceTitle)
        .input("resourceDescription", sql.VarChar, resourceDescription)
        .input("resourceLink", sql.VarChar, resourceLink)
        .query(
        `UPDATE Resources
         SET resourceType = @resourceType, resourceTitle = @resourceTitle, resourceDescription = @resourceDescription, resourceLink = @resourceLink
         WHERE resourceId = @resourceId`
        );
    if (result.rowsAffected[0] === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "Resource not found");
    }
    res.status(httpStatus.OK).json({
        message: "Resource updated successfully",
    });
};

export const deleteResource1 = async (req, res) => {
    const { resourceId } = req.params;
    let pool = await sql.connect(config.sql);
    let result = await pool
        .request()
        .input("resourceId", sql.Int, resourceId)
        .query("DELETE FROM Resources WHERE resourceId = @resourceId");
    if (result.rowsAffected[0] === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "Resource not found");
    }
    res.status(httpStatus.OK).json({
        message: "Resource deleted successfully",
    });
};
