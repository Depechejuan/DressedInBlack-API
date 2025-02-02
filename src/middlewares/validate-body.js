"use strict";

const sendError = require("../utils/send-error");

const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map(
                (err) => err.message
            )[0];
            res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: errorMessage,
                },
            });
        } else {
            next();
        }
    };
};

module.exports = validateBody;
