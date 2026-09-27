const { z } = require("zod");

const MouldIncubationZodSchema = z.object({
    mouldId: z.string({ required_error: "Mould ID is required" })
        .trim()
        .min(3, { message: "Mould ID is required and must be at least three characters long" }),
        // .unique({ message: "Mould ID must be unique" }),  // Note: Zod itself doesn't enforce uniqueness

    reasonOfRejection: z.string({ required_error: "Reason of Rejection is required" })
        .trim()
        .min(3, { message: "Reason of Rejection is required and must be at least three characters long" }),

    MouldRejectionTime: z.date({ required_error: "Mould Rejection Time is required" })
        .default(() => new Date()),

    // previousStatusTillMouldInoculation: z.any({ required_error: "Previous Status Till Mould Inoculation is required" })
});

module.exports = MouldIncubationZodSchema;
