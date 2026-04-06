require("dotenv").config();
const express = require("express");
const expressBasicAuth = require("express-basic-auth");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");
const { eventQueue } = require("../app/queues");

const router = express.Router();

// Create Bull Board Express Adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Create Bull Board
createBullBoard({
  queues: [
    new BullAdapter(eventQueue)
  ],
  serverAdapter,
});

// Add basic auth
router.use(
  "/admin/queues",
  expressBasicAuth({
    users: { admin: process.env.QUEUE_KEY },
    challenge: true,
  }),
  serverAdapter.getRouter()
);

module.exports = router;
