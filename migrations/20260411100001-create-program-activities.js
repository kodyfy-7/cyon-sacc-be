"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("program_activities", {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal("gen_random_uuid()")
            },

            programYearId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "program_years",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
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
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW")
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW")
            },

            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        await queryInterface.addIndex("program_activities", ["programYearId"]);
        await queryInterface.addIndex("program_activities", ["name"]);
        await queryInterface.addIndex("program_activities", ["sn"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("program_activities");
    }
};
