  
    const express = require("express");
    const router = express.Router();
    const { createTicket, getTicket, addUserMessage } = require("../controllers/TicketController");


  
    router.post("/", createTicket);
    router.get("/:id", getTicket);
    router.post("/:id/messages", addUserMessage);

    module.exports = router;
