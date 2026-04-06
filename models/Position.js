"use strict";

const Sequelize = require("sequelize");
const postgresDb = require("../database/PostgresDb");

const Position = postgresDb.define(
    "positions",
    {
        id: {
            type: Sequelize.UUID,
            defaultValue: new Sequelize.UUIDV4(),
            primaryKey: true,
            unique: true
        },

        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        paranoid: true,
        indexes: [
            { fields: ["name"], unique: true },
            { fields: ["createdAt"] }
        ]
    }
);

module.exports = Position;