import { generatePayHereHash } from "../services/paymentService.js";

export const initializePayment = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
    } = req.body;

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const currency = "LKR";

    const formattedAmount = Number(amount).toFixed(2);

    const hash = generatePayHereHash(
      merchantId,
      orderId,
      formattedAmount,
      currency,
      merchantSecret
    );

    return res.status(200).json({
      success: true,
      paymentData: {
        merchant_id: merchantId,
        return_url: process.env.PAYHERE_RETURN_URL,
        cancel_url: process.env.PAYHERE_CANCEL_URL,
        notify_url: process.env.PAYHERE_NOTIFY_URL,

        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        city,
        country: "Sri Lanka",

        order_id: orderId,
        items: "Electra Order",
        currency,
        amount: formattedAmount,
        hash,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to initialize payment.",
    });
  }
};