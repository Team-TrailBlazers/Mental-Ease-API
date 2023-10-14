import Joi from "joi";

export const StripePaymentValidator = (payment) => { 
    const paymentValidationSchema = Joi.object({
        priceId: Joi.string().required(),
        successUrl: Joi.string().required(),
        cancelUrl: Joi.string().required(),
    });
    return paymentValidationSchema.validate(payment);
};