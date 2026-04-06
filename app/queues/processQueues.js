const {
  eventQueue
} = require("./index");

// Process jobs in the eventQueue
eventQueue.process(async (job) => {
  // Handle the job processing logic here
  try {
    // Use the updated job processing function
    const result = await require("../jobs/Event")(job);
    // console.log(result);
  } catch (error) {
    console.error("Error processing job:", error);
    throw error; // Let Bull handle the failure
  }
});

console.log("Queues are running...");
