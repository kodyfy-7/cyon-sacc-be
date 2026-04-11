"use strict";

const Sequelize = require("sequelize");
const postgresDb = require("../database/PostgresDb");

const ProgramYear = postgresDb.define(
    "program_years",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: new Sequelize.UUIDV4(),
            primaryKey: true,
            unique: true
        },

        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
        },

        theme: {
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
        indexes: [{ fields: ["year"] }]
    }
);

module.exports = ProgramYear;
