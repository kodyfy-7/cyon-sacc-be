const express = require("express");
const ProgramController = require("../app/controllers/ProgramController");
const {
    validate,
    validateCreateProgramYear,
    validateUpdateProgramYear,
    validateCreateActivity,
    validateUpdateActivity
} = require("../app/services/Validation/RequestValidation");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

const router = express.Router();

// Public: current year's program
router.route("/program").get(ProgramController.getCurrentYearProgram);

// Admin: manage program years
router.route("/program-years").get(authenticateAdmin, ProgramController.getAllYears);
router.route("/program-years").post(authenticateAdmin, validateCreateProgramYear(), validate, ProgramController.createYear);
router.route("/program-years/:yearId").get(authenticateAdmin, ProgramController.getYearById);
router.route("/program-years/:yearId").patch(authenticateAdmin, validateUpdateProgramYear(), validate, ProgramController.updateYear);
router.route("/program-years/:yearId").delete(authenticateAdmin, ProgramController.deleteYear);

// Admin: manage activities within a year
router.route("/program-years/:yearId/activities").post(authenticateAdmin, validateCreateActivity(), validate, ProgramController.addActivity);
router.route("/program-years/:yearId/activities/:activityId").patch(authenticateAdmin, validateUpdateActivity(), validate, ProgramController.updateActivity);
router.route("/program-years/:yearId/activities/:activityId").delete(authenticateAdmin, ProgramController.deleteActivity);

module.exports = router;
