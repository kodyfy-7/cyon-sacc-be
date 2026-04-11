"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("program_years", {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal("gen_random_uuid()")
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

        await queryInterface.addIndex("program_years", ["year"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("program_years");
    }
};
