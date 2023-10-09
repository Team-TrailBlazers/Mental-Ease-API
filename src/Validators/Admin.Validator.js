import Joi from "joi";

export const adminRegisterValidator = (admin) => {
  const adminValidationSchema = Joi.object({
    FirstName: Joi.string().min(2).max(50).required(),
    LastName: Joi.string().min(2).max(50).required(),
    EmailAddress: Joi.string().email().required(),
    Password: Joi.string().min(4).max(20).required(),
    ConfirmPassword: Joi.ref("Password"),
  });

  return adminValidationSchema.validate(admin);
};

export const adminLoginValidator = (admin) => {
  const adminLoginValidationSchema = Joi.object({
    EmailAddress: Joi.string().email().required(),
    Password: Joi.string().min(4).max(20).required(),
  });

  return adminLoginValidationSchema.validate(admin);
};
