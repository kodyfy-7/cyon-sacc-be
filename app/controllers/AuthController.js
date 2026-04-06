"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const errorHandler = require("../../middleware/errorHandler");
const postgresDb = require("../../database/PostgresDb");
const User = require("../../models/User");
const Member = require("../../models/Member");
const Administrator = require("../../models/Administrator");

const SALT_ROUNDS = 10;

const signAccessToken = (user, adminId = null) =>
    jwt.sign(
        { id: user.id, ...(adminId && { adminId }) },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

const signRefreshToken = (user) =>
    jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
    );

exports.register = async (req, res) => {
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

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create(
            { name, email: normalizedEmail, password: hashed, phoneNumber },
            { transaction }
        );

        const member = await Member.create(
            { userId: user.id, gender, outstation: outstation || null, dateOfBirth },
            { transaction }
        );

        await transaction.commit();

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    isActive: user.isActive
                },
                member: {
                    id: member.id,
                    gender: member.gender,
                    outstation: member.outstation,
                    dateOfBirth: member.dateOfBirth
                }
            }
        });
    } catch (error) {
        await transaction.rollback();
        return res
            .status(500)
            .json(await errorHandler(error, "Error during registration", req.originalUrl));
    }
};

exports.login = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;
        const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

        const identifierWhere = [];
        if (normalizedEmail) identifierWhere.push({ email: normalizedEmail });
        if (phoneNumber) identifierWhere.push({ phoneNumber });

        const user = await User.findOne({
            where: {
                isActive: true,
                [Op.or]: identifierWhere
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials or password."
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials or password."
            });
        }

        const [member, administrator] = await Promise.all([
            Member.findOne({ where: { userId: user.id } }),
            Administrator.findOne({ where: { userId: user.id } })
        ]);

        const accessToken = signAccessToken(user, administrator ? administrator.id : null);
        const refreshToken = signRefreshToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    // email: user.email,
                    // phoneNumber: user.phoneNumber,
                    // isActive: user.isActive
                },
                member: member
                    ? {
                        id: member.id,
                        // gender: member.gender,
                        // outstation: member.outstation,
                        // dateOfBirth: member.dateOfBirth
                    }
                    : null,
                administrator: administrator
                    ? {
                        id: administrator.id,
                        // positionId: administrator.positionId,
                        // isSuper: administrator.isSuper
                    }
                    : null
            }
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error during login", req.originalUrl));
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required."
            });
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token."
            });
        }

        const user = await User.findOne({
            where: { id: payload.id, isActive: true }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive."
            });
        }

        const accessToken = signAccessToken(user);

        return res.status(200).json({
            success: true,
            data: { accessToken }
        });
    } catch (error) {
        return res
            .status(500)
            .json(await errorHandler(error, "Error refreshing token", req.originalUrl));
    }
};
