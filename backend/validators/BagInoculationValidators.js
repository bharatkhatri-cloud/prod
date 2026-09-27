const { z } = require("zod");

const bagInoculationZodSchema = z.object({
    JamOrLcId: z.string({ required_error: "Jam or LC ID is required" }).trim().min(3, { message: "Jam or LC ID must be provided at least  three characters long" }),
    JamOrLcQty: z.string({ required_error: "Jam or LC Quantity is required" }).trim().min(1, { message: "Jam or LC Quantity must be provided" }),
    bagId: z.string({ required_error: "Bag ID is required" }).trim().min(3, { message: "Bag ID must be provided at least  three characters long" }),
    bagQty: z.string({ required_error: "Bag Quantity is required" }).trim().min(2, { message: "Bag Quantity must be provided at least two characters long"  }),
    inoculationTimeStamp: z.date({ required_error: "Inoculation timestamp is required" }).default(() => new Date())
});

module.exports = bagInoculationZodSchema;
