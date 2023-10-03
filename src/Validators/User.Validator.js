import Joi from "joi";

export const UserRegisterValidator = (user) => {
  const userValidationSchema = Joi.object({
    FirstName: Joi.string().min(3).max(30).required(),
    LastName: Joi.string().min(3).max(30).required(),
    EmailAddress: Joi.string().email().required(),
    Password: Joi.string().min(4).max(30).required(),
    ConfirmPassword: Joi.ref("Password"),
  });
  return userValidationSchema.validate(user);
};

export const userLoginValidator = (user) => {
  const userLoginValidationSchema = Joi.object({
    EmailAddress: Joi.string().email().required(),
    Password: Joi.string().min(4).max(30).required(),
  });
  return userLoginValidationSchema.validate(user);
};
