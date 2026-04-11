"use strict";

const { Op } = require("sequelize");
const errorHandler = require("../../middleware/errorHandler");
const ProgramYear = require("../../models/ProgramYear");
const ProgramActivity = require("../../models/ProgramActivity");

// ── Helpers ────────────────────────────────────────────────────────────────────

const yearWithActivities = (yearId) =>
    ProgramYear.findOne({
        where: { id: yearId },
        include: [{ model: ProgramActivity, as: "activities" }],
        order: [[{ model: ProgramActivity, as: "activities" }, "sn", "ASC"]]
    });

// ── Year endpoints ─────────────────────────────────────────────────────────────

exports.getAllYears = async (req, res) => {
    try {
        const years = await ProgramYear.findAll({ order: [["year", "DESC"]] });
        return res.status(200).json({ success: true, data: years });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error fetching program years", req.originalUrl));
    }
};

exports.getYearById = async (req, res) => {
    try {
        const { yearId } = req.params;
        const programYear = await yearWithActivities(yearId);

        if (!programYear) {
            return res.status(404).json({ success: false, message: "Program year not found" });
        }

        return res.status(200).json({ success: true, data: programYear });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error fetching program year", req.originalUrl));
    }
};

exports.createYear = async (req, res) => {
    try {
        const { year, theme } = req.body;

        const existing = await ProgramYear.findOne({ where: { year } });
        if (existing) {
            return res.status(409).json({ success: false, message: `Program year ${year} already exists` });
        }

        const programYear = await ProgramYear.create({
            year,
            theme: theme || null,
            createdBy: req.user?.id || null,
            updatedBy: req.user?.id || null
        });

        return res.status(201).json({ success: true, message: "Program year created", data: programYear });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error creating program year", req.originalUrl));
    }
};

exports.updateYear = async (req, res) => {
    try {
        const { yearId } = req.params;
        const { year, theme } = req.body;

        const programYear = await ProgramYear.findOne({ where: { id: yearId } });
        if (!programYear) {
            return res.status(404).json({ success: false, message: "Program year not found" });
        }

        if (year !== undefined) {
            const conflict = await ProgramYear.findOne({ where: { year, id: { [Op.ne]: yearId } } });
            if (conflict) {
                return res.status(409).json({ success: false, message: `Program year ${year} already exists` });
            }
            programYear.year = year;
        }

        if (theme !== undefined) programYear.theme = theme;
        programYear.updatedBy = req.user?.id || programYear.updatedBy;

        await programYear.save();

        return res.status(200).json({ success: true, message: "Program year updated", data: programYear });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error updating program year", req.originalUrl));
    }
};

exports.deleteYear = async (req, res) => {
    try {
        const { yearId } = req.params;

        const programYear = await ProgramYear.findOne({ where: { id: yearId } });
        if (!programYear) {
            return res.status(404).json({ success: false, message: "Program year not found" });
        }

        await programYear.destroy();

        return res.status(200).json({ success: true, message: "Program year deleted" });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error deleting program year", req.originalUrl));
    }
};

// ── Activity endpoints ─────────────────────────────────────────────────────────

exports.addActivity = async (req, res) => {
    try {
        const { yearId } = req.params;
        const { sn, name, eventDate, level, venue } = req.body;

        const programYear = await ProgramYear.findOne({ where: { id: yearId } });
        if (!programYear) {
            return res.status(404).json({ success: false, message: "Program year not found" });
        }

        const activity = await ProgramActivity.create({
            programYearId: yearId,
            sn: sn || null,
            name,
            eventDate: eventDate || null,
            level: level || null,
            venue: venue || null,
            createdBy: req.user?.id || null,
            updatedBy: req.user?.id || null
        });

        return res.status(201).json({ success: true, message: "Activity added", data: activity });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error adding activity", req.originalUrl));
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { sn, name, eventDate, level, venue } = req.body;

        const activity = await ProgramActivity.findOne({ where: { id: activityId } });
        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }

        if (sn !== undefined) activity.sn = sn;
        if (name !== undefined) activity.name = name;
        if (eventDate !== undefined) activity.eventDate = eventDate;
        if (level !== undefined) activity.level = level;
        if (venue !== undefined) activity.venue = venue;
        activity.updatedBy = req.user?.id || activity.updatedBy;

        await activity.save();

        return res.status(200).json({ success: true, message: "Activity updated", data: activity });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error updating activity", req.originalUrl));
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;

        const activity = await ProgramActivity.findOne({ where: { id: activityId } });
        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }

        await activity.destroy();

        return res.status(200).json({ success: true, message: "Activity deleted" });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error deleting activity", req.originalUrl));
    }
};

// ── Public endpoint ────────────────────────────────────────────────────────────

exports.getCurrentYearProgram = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const programYear = await ProgramYear.findOne({
            where: { year: currentYear },
            include: [{ model: ProgramActivity, as: "activities" }],
            order: [[{ model: ProgramActivity, as: "activities" }, "sn", "ASC"]]
        });

        if (!programYear) {
            return res.status(404).json({
                success: false,
                message: `No program found for year ${currentYear}`
            });
        }

        return res.status(200).json({ success: true, data: programYear });
    } catch (error) {
        return res.status(500).json(await errorHandler(error, "Error fetching current year program", req.originalUrl));
    }
};
