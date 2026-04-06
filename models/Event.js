"use strict";

const Sequelize = require("sequelize");
const postgresDb = require("../database/PostgresDb");

const Event = postgresDb.define(
  "events",
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

    fileUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },

    description: {
      type: Sequelize.TEXT,
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
      { fields: ["name"] },
      { fields: ["createdAt"] },
      { fields: ["createdBy"] },
      { fields: ["updatedBy"] }
    ]
  }
);

module.exports = Event;
