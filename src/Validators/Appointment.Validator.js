import Joi from "joi";

export const appointmentValidator = (appoinment) => {
  const appointmentValidationSchema = Joi.object({
    UserID: Joi.number().integer().min(1),
    TherapistID: Joi.number().integer().min(1),
    AppointmentDate: Joi.date(),
    AppointmentTime: Joi.string().min(1).max(50),
    Duration: Joi.number().integer().min(10),
    Price: Joi.number().min(1),
    MessageText: Joi.string().min(5).max(500),
    Location: Joi.string().min(1).max(50),
    AppointmentStatus: Joi.string().min(1).max(50),
  });
  return appointmentValidationSchema.validate(appoinment);
};
