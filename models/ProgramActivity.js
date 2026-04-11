"use strict";

const Sequelize = require("sequelize");
const postgresDb = require("../database/PostgresDb");

const ProgramActivity = postgresDb.define(
    "program_activities",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: new Sequelize.UUIDV4(),
            primaryKey: true,
            unique: true
        },

        programYearId: {
            type: Sequelize.UUID,
            allowNull: false
        },

        sn: {
            type: Sequelize.INTEGER,
            allowNull: true
        },

        name: {
            type: Sequelize.STRING,
            allowNull: false
        },

        eventDate: {
            type: Sequelize.STRING,
            allowNull: true
        },

        level: {
            type: Sequelize.STRING,
            allowNull: true
        },

        venue: {
            type: Sequelize.STRING,
            allowNull: true
        },

        createdBy: {
            type: Sequelize.UUID,
            allowNull: true
        },

        updatedBy: {
            type: Sequelize.UUID,
            allowNull: true
        }
    },
    {
        paranoid: true,
        indexes: [
            { fields: ["programYearId"] },
            { fields: ["name"] },
            { fields: ["sn"] }
        ]
    }
);

module.exports = ProgramActivity;
