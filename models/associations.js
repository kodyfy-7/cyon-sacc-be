"use strict";

const User = require("./User");
const Member = require("./Member");
const Administrator = require("./Administrator");
const Position = require("./Position");

// User <-> Member (1:1)
if (!User.associations.member) {
    User.hasOne(Member, { foreignKey: "userId", as: "member" });
}

if (!Member.associations.user) {
    Member.belongsTo(User, { foreignKey: "userId", as: "user" });
}

// User <-> Administrator (1:1)
if (!User.associations.administrator) {
    User.hasOne(Administrator, { foreignKey: "userId", as: "administrator" });
}

if (!Administrator.associations.user) {
    Administrator.belongsTo(User, { foreignKey: "userId", as: "user" });
}

// Member -> Administrator via shared userId
if (!Member.associations.administrator) {
    Member.hasOne(Administrator, {
        foreignKey: "userId",
        sourceKey: "userId",
        as: "administrator"
    });
}

// Position <-> Administrator (1:N)
if (!Position.associations.administrators) {
    Position.hasMany(Administrator, { foreignKey: "positionId", as: "administrators" });
}

if (!Administrator.associations.position) {
    Administrator.belongsTo(Position, { foreignKey: "positionId", as: "position" });
}

module.exports = {
    User,
    Member,
    Administrator,
    Position
};