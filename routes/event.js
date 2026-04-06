const express = require("express");
const EventController = require("../app/controllers/EventController");
const {
  validate,
  validateCreateEvent,
  validateUpdateEvent
} = require("../app/services/Validation/RequestValidation");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

const router = express.Router();

router.route("/events").get(EventController.getAllEvents);

router.route("/events").post(authenticateAdmin, validateCreateEvent(), validate, EventController.createEvent);

router.route("/events/:eventId").get(EventController.getEventById);

router.route("/events/:eventId").patch(authenticateAdmin, validateUpdateEvent(), validate, EventController.updateEvent);

router.route("/events/:eventId").delete(authenticateAdmin, EventController.deleteEvent);

module.exports = router;
