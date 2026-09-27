const  { z } = require("zod");

const lcRejectionZodSchema = z.object({
    lcId: z.string({ required_error: "LC ID is required" }).trim().min(3, { message: "LC ID must be at least three characters long" }),
    reasonOfRejection: z.string({ required_error: "Reason of Rejection is required" }).trim().min(3, { message: "Reason of Rejection is required to filled and must be at least three characters long" }),
    lcRejectionTime: z.date({ required_error: "LC Rejection time is required" })
    .default(() => new Date()),
})

module.exports = lcRejectionZodSchema