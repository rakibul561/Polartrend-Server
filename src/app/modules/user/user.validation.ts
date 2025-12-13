import Joi from "joi";

export const registerUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required"
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password must not exceed 30 characters",
      "any.required": "Password is required"
    }),

  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 50 characters"
    }),

  role: Joi.string()
    .valid("USER", "ADMIN")
    .optional()
    .messages({
      "any.only": "Role must be either USER or ADMIN"
    })
});
