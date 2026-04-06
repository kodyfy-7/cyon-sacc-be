"use strict";

const Sequelize = require("sequelize");
const postgresDb = require("../database/PostgresDb");

const User = postgresDb.define(
    "users",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: new Sequelize.UUIDV4(),
            primaryKey: true,
            unique: true
        },

        name: {
            type: Sequelize.STRING,
            allowNull: false
        },

        email: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        phoneNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },

        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        paranoid: true,
        indexes: [
            { fields: ["email"], unique: true },
            { fields: ["isActive"] },
            { fields: ["createdAt"] }
        ]
    }
);

module.exports = User;