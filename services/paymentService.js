import crypto from "crypto";

/**
 * Generate PayHere Hash
 */
export const generatePayHereHash = (
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret
) => {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  return crypto
    .createHash("md5")
    .update(
      merchantId +
        orderId +
        amount +
        currency +
        hashedSecret
    )
    .digest("hex")
    .toUpperCase();
};