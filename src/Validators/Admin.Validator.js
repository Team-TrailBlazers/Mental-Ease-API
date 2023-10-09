import Joi from "joi";

export const adminLoginValidator = (admin) => {
  const adminLoginValidationSchema = Joi.object({
    EmailAddress: Joi.string().email().required(),
    Password: Joi.string().min(4).max(20).required(),
  });

  return adminLoginValidationSchema.validate(admin);
};


export const therapistLoginValidator = (admin) => {
    const adminLoginValidationSchema = Joi.object({
      EmailAddress: Joi.string().email().required(),
      Password: Joi.string().min(4).max(20).required(),
    });
  
    return adminLoginValidationSchema.validate(admin);
  };