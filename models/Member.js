"use strict";

const Sequelize = require("sequelize");
const postgresDb = require("../database/PostgresDb");

const Member = postgresDb.define(
    "members",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: new Sequelize.UUIDV4(),
            primaryKey: true,
            unique: true
        },

        userId: {
            type: Sequelize.UUID,
            allowNull: false
        },

        gender: {
            type: Sequelize.STRING,
            allowNull: false
        },

        outstation: {
            type: Sequelize.STRING,
            allowNull: true
        },

        dateOfBirth: {
            type: Sequelize.DATEONLY,
            allowNull: false
        }
    },
    {
        paranoid: true,
        indexes: [
            { fields: ["userId"], unique: true },
            { fields: ["gender"] },
            { fields: ["createdAt"] }
        ]
    }
);

module.exports = Member;