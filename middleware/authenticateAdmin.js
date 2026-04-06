"use strict";

const { authenticateUser } = require("./authenticateUser");
const Administrator = require("../models/Administrator");

const authenticateAdmin = async (req, res, next) => {
    return authenticateUser(req, res, async () => {
        try {
            if (!req.user?.adminId || !req.user?.id) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden. Admin access required."
                });
            }

            const admin = await Administrator.findOne({
                where: {
                    id: req.user.adminId,
                    userId: req.user.id
                }
            });

            if (!admin) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden. Admin access required."
                });
            }

            req.admin = admin;
            return next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Invalid authentication context."
            });
        }
    });
};

module.exports = { authenticateAdmin };