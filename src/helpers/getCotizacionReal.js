import axios from "axios";

export const getCotizacionReal = async () => {
  try {
    const config = {
      method: "GET",
      url: "https://api-cotizaciones-tt7h9.ondigitalocean.app/api/real/nacion",
    };

    const res = await axios(config);
    return res;
  } catch (error) {
    console.log(err);
  }
};
