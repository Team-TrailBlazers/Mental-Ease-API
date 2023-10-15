import Joi from "joi";

export const StripePaymentValidator = (payment) => {
  const paymentValidationSchema = Joi.object({
    AppointmentID: Joi.number().required(),
  });
  return paymentValidationSchema.validate(payment);
};
