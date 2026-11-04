import "dotenv/config";
import Stripe from "stripe";

const chaveSecreta = process.env.STRIPE_SECRET_KEY;

// Sem STRIPE_SECRET_KEY o restante da API funciona normalmente;
// só o pagamento online fica indisponível.
export const stripe = chaveSecreta ? new Stripe(chaveSecreta) : null;
