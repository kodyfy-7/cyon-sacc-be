"use strict";

const errorHandler = require("../../middleware/errorHandler");
const { Op } = require("sequelize");
const postgresDb = require("../../database/PostgresDb");
const PaginationService = require("../../helpers/pagination");

const User = require("../../models/User");
const Member = require("../../models/Member");
const Administrator = require("../../models/Administrator");
const Position = require("../../models/Position");

exports.getAllMembers = async (req, res) => {
    try {
        const {
            page = 1,
            perPage = 25,
            sort = "createdAt:desc",
            search,
            gender,
            isAdmin
        } = req.query;

        const where = {};

        if (gender) where.gender = gender;

        // Search in related user name or email via include alias
        if (search) {
            where[Op.or] = [
                { "$user.name$": { [Op.iLike]: `%${search}%` } },
                { "$user.email$": { [Op.iLike]: `%${search}%` } }
            ];
        }

        const paginate = PaginationService.pagination({ page, perPage });

        const include = [
            { model: User, as: "user", attributes: ["id", "name", "email", "phoneNumber", "isActive"] },
            { model: Administrator, as: "administrator", required: isAdmin === "true", attributes: ["id", "positionId", "isSuper"] }
        ];

        const results = await Member.findAndCountAll({
            where,
            include,
            order: PaginationService.sortList({ sort }),
            ...paginate,
            subQuery: false
        });

        const meta = PaginationService.paginationLink({
            total: results.count,
            page,
            perPage
        });

        return res.status(200).json({
            success: true,
            data: { members: results.rows },
            meta
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error fetching members", req.originalUrl));
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await Member.findOne({
            where: { id: memberId },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email", "phoneNumber", "isActive"] },
                { model: Administrator, as: "administrator", attributes: ["id", "positionId", "isSuper"] }
            ]
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: member
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error fetching member", req.originalUrl));
    }
};

exports.createMember = async (req, res) => {
    const transaction = await postgresDb.transaction();
    try {
        const {
            name,
            email,
            password,
            phoneNumber,
            gender,
            outstation,
            dateOfBirth
        } = req.body;

        const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

        // Check if user exists by email (when provided)
        if (normalizedEmail) {
            const existingByEmail = await User.findOne({ where: { email: normalizedEmail }, transaction });
            if (existingByEmail) {
                await transaction.rollback();
                return res.status(409).json({
                    success: false,
                    message: "A user with this email already exists."
                });
            }
        }

        const existingByPhone = await User.findOne({ where: { phoneNumber }, transaction });
        if (existingByPhone) {
            await transaction.rollback();
            return res.status(409).json({
                success: false,
                message: "A user with this phone number already exists."
            });
        }

        // Hash password
        const bcrypt = require("bcryptjs");
        const hashed = await bcrypt.hash(password, 10);

        // Create user and member together
        const user = await User.create(
            { name, email: normalizedEmail, password: hashed, phoneNumber },
            { transaction }
        );

        const member = await Member.create(
            { userId: user.id, gender, outstation: outstation || null, dateOfBirth },
            { transaction }
        );

        await transaction.commit();

        const memberWithRelations = await Member.findOne({
            where: { id: member.id },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email", "phoneNumber", "isActive"] }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Member created successfully.",
            data: memberWithRelations
        });
    } catch (error) {
        await transaction.rollback();
        return res
            .status(500)
            .json(await errorHandler(error, "Error creating member", req.originalUrl));
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { name, phoneNumber, gender, outstation, dateOfBirth, isActive } = req.body;

        const member = await Member.findOne({
            where: { id: memberId },
            include: [{ model: User, as: "user" }]
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Update user fields
        if (name !== undefined) member.user.name = name;
        if (phoneNumber !== undefined) member.user.phoneNumber = phoneNumber;
        if (isActive !== undefined) member.user.isActive = isActive;

        // Update member fields
        if (gender !== undefined) member.gender = gender;
        if (outstation !== undefined) member.outstation = outstation;
        if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth;

        await member.user.save();
        await member.save();

        const updated = await Member.findOne({
            where: { id: memberId },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email", "phoneNumber", "isActive"] },
                { model: Administrator, as: "administrator", attributes: ["id", "positionId", "isSuper"] }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Member updated successfully.",
            data: updated
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error updating member", req.originalUrl));
    }
};

exports.deleteMember = async (req, res) => {
    const transaction = await postgresDb.transaction();
    try {
        const { memberId } = req.params;

        const member = await Member.findOne({
            where: { id: memberId },
            include: [{ model: User, as: "user" }],
            transaction
        });

        if (!member) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Delete administrator record if exists
        await Administrator.destroy({ where: { userId: member.userId }, transaction });

        // Delete member and user
        await member.destroy({ transaction });
        await member.user.destroy({ transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Member deleted successfully."
        });
    } catch (error) {
        await transaction.rollback();
        return res
            .status(500)
            .json(await errorHandler(error, "Error deleting member", req.originalUrl));
    }
};

exports.makeAdministrator = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { positionId, isSuper = false } = req.body;

        const member = await Member.findOne({
            where: { id: memberId }
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Check if position exists
        const position = await Position.findOne({ where: { id: positionId } });
        if (!position) {
            return res.status(404).json({
                success: false,
                message: "Position not found"
            });
        }

        // Check if already an administrator
        let admin = await Administrator.findOne({ where: { userId: member.userId } });

        if (admin) {
            // Update existing
            admin.positionId = positionId;
            admin.isSuper = isSuper;
            await admin.save();
        } else {
            // Create new
            admin = await Administrator.create({
                userId: member.userId,
                positionId,
                isSuper
            });
        }

        const updated = await Member.findOne({
            where: { id: memberId },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email", "phoneNumber", "isActive"] },
                { model: Administrator, as: "administrator", attributes: ["id", "positionId", "isSuper"] }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Member promoted to administrator.",
            data: updated
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error promoting member", req.originalUrl));
    }
};

exports.unmakeAdministrator = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await Member.findOne({ where: { id: memberId } });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        const admin = await Administrator.findOne({ where: { userId: member.userId } });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Member is not an administrator."
            });
        }

        await admin.destroy();

        const updated = await Member.findOne({
            where: { id: memberId },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email", "phoneNumber", "isActive"] },
                { model: Administrator, as: "administrator", attributes: ["id", "positionId", "isSuper"] }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Member demoted from administrator.",
            data: updated
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error demoting member", req.originalUrl));
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const [user, member, administrator] = await Promise.all([
            User.findOne({
                where: { id: userId },
                attributes: ["id", "name", "email", "phoneNumber", "isActive"]
            }),
            Member.findOne({ where: { userId } }),
            Administrator.findOne({
                where: { userId },
                attributes: ["id", "positionId", "isSuper"]
            })
        ]);

        if (!user || !member) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                member: {
                    id: member.id,
                    userId: member.userId,
                    gender: member.gender,
                    outstation: member.outstation,
                    dateOfBirth: member.dateOfBirth,
                    createdAt: member.createdAt,
                    updatedAt: member.updatedAt,
                    deletedAt: member.deletedAt,
                    user,
                    administrator: administrator || null
                }
            }
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error fetching profile", req.originalUrl));
    }
};
