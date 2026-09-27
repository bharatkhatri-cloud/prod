const { z } = require("zod");

const lcPreparationZodSchema = z.object({
    lcId: z.string({ required_error: "LC ID is required" })
        .trim()
        .min(3, { message: "LC ID must be at least three characters long" }),

    lcQty: z.string({ required_error: "LC quantity is required" })
        .trim()
        .min(1, { message: "LC Quantity must be at least one character long" }),

    scId: z.string({ required_error: "SC ID is required" })
        .trim()
        .min(3, { message: "SC ID must be at least three characters long" }),

    scQty: z.string({ required_error: "SC quantity is required" })
        .trim()
        .min(1, { message: "SC Quantity must be at least one character long" }),

    lcPreparationTime: z.date({ required_error: "LC preparation time is required" })
        .default(() => new Date())


});

module.exports = lcPreparationZodSchema;
