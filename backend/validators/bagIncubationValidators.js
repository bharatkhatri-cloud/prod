const { z } = require("zod");

const bagIncubationZodSchema = z.object({
    bagId: z.string({ required_error: "Bag ID is required" })
        .trim()
        .min(3, { message: "Bag ID required and must be at least three characters long" }),

    reasonOfRejection: z.string({ required_error: "Reason of rejection is required" })
        .trim()
        .min(3, { message: "Reason of rejection required and must be at least three characters long" }),

    bagRejectionTime: z.date({ required_error: "Bag rejection time is required" })
        .default(() => new Date()),

});

module.exports = bagIncubationZodSchema;
