export const DELIVERY_FEES = {
  Colombo: 250,
  Gampaha: 300,
  Kalutara: 350,

  Kandy: 350,
  Matale: 400,
  "Nuwara Eliya": 450,

  Galle: 400,
  Matara: 450,
  Hambantota: 500,

  Kurunegala: 400,
  Puttalam: 450,

  Kegalle: 400,
  Ratnapura: 450,

  Badulla: 500,
  Monaragala: 550,

  Anuradhapura: 550,
  Polonnaruwa: 550,

  Trincomalee: 600,
  Batticaloa: 650,
  Ampara: 650,

  Jaffna: 700,
  Kilinochchi: 700,
  Mullaitivu: 750,
  Mannar: 650,
  Vavuniya: 600,
};

export const getDeliveryFee = (district) => {
  return DELIVERY_FEES[district] || 0;
};