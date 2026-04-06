"use strict";

const errorHandler = require("../../middleware/errorHandler");
const Event = require("../../models/Event");
const Member = require("../../models/Member");

exports.getPublicSummary = async (req, res) => {
    try {
        const [numberOfEvents, numberOfMembers] = await Promise.all([
            Event.count(),
            Member.count(),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                numberOfEvents,
                numberOfMembers,
            },
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error fetching public summary", req.originalUrl));
    }
};
