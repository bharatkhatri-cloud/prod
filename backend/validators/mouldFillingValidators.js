const { z } = require("zod");

const mouldFillingZodSchema = z.object({
    mouldId: z.string({ required_error: "Mould ID is required" })
        .trim()
        .min(3, { message: "Mould ID is required and must be at least three characters long" }),
        // .unique({ message: "Mould ID must be unique" }),  // Note: Zod itself doesn't enforce uniqueness

    bagId: z.string({ required_error: "Bag ID is required" })
        .trim()
        .min(3, { message: "Bag ID is required and must be at least three characters long" }),

    typeOfMould: z.string({ required_error: "Type of Mould is required" })
        .trim()
        .min(3, { message: "Type of Mould is required and must be at least three characters long" }),

    fillingDate: z.date({ required_error: "Filling Date is required" })
        .default(() => new Date()),

 
    // previousStatusTillBagInoculation: z.any({ required_error: "Previous Status Till Bag Inoculation is required" })
});

module.exports = mouldFillingZodSchema;
