const validate = (zodSchema) => async (req, res, next) => {
    try {
        const parseBody = await zodSchema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (err) {
        const message = err.errors[0].message
        console.log(err);
        res.status(400).json({ message: message });
    }
};

module.exports = validate;
