const { z } = require("zod");

const jamPreparationZodSchema = z.object({
    jamId: z.string({ required_error: "Jam ID is required" })
        .trim()
        .min(3, { message: "Jam ID is required to fill and it must be at least three characters long" }),

    jamQty: z.string({ message: "Jam quantity is required" })
        .min(1, { message: "Jam Quantity is required to fill and it must be at least one character long" })
        .trim(),

    lcId: z.string({ required_error: "LC ID is required" })
        .min(3, { message: "LC ID must be at least three characters long" })
        .trim(),

    lcQty: z.string({ required_error: "LC quantity is required" })
        .min(1, { message: "LC Quantity is required to fill and it must be at least one character long" })
        .trim(),

    jamPreparationTime: z.date({ required_error: "Jam preparation time is required" })
        .default(() => new Date())
});

module.exports = jamPreparationZodSchema;
