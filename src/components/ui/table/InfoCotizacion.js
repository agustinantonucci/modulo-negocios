import moment from "moment";


export const infoCotizacion = (monIsoBase, cotizacionDolar, cotizacionReal, ultimaActualizacion) => {
  // Devuelve el componente correspondiente según la moneda base.

  switch (monIsoBase) {
    case "AR$":
      //1. Si la moneda base es Pesos: moneda 1 = Dolar, moneda2= Real , cotizacion1=cotizacionDolar, Cotizacion2=Cotizacion real
      return cotizacionSegunMonedaBase(
        "1 USD =",
        "1 BRL =",
        1 / cotizacionDolar,
        1 / cotizacionReal,
        monIsoBase,
        ultimaActualizacion
      );

    //2. Si la moneda base es Dolares:Moneda 1= AR$ moneda= 2 BRL, 1/cotizacion dolar , cotizacionReal/cotizacionDolar
    case "USD":
      return cotizacionSegunMonedaBase(
        "1 AR$ =",
        "1 BRL =",
        cotizacionDolar,
        cotizacionDolar / cotizacionReal,
        monIsoBase,
        ultimaActualizacion
      );
    //3. Si la moneda base es REAL:Moneda 1= AR$ moneda= 2 USD, 1/cotizacionReal , 1/cotizacionReal*cotizacionDolar
    case "BRL":
      return cotizacionSegunMonedaBase(
        "1 AR$ =",
        "1 USD =",
        cotizacionReal,
        (1 / cotizacionDolar * cotizacionReal),
        monIsoBase,
        ultimaActualizacion
      );

    default:
      break;
  }
};

const cotizacionSegunMonedaBase = (
    moneda1,
    moneda2,
    cotizacion1,
    cotizacion2,
    monIsoBase,
    ultimaActualizacion
  ) => {
    return (
      <div className="cotizaciones">
        {cotizacion2 ? (
          <>
            <p className="cotizaciones_p">
              <span className="cotizacion">{moneda1}</span> {`${monIsoBase} `}{" "}
              {cotizacion1.toLocaleString("de-DE", {
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="cotizaciones_p">
              <span className="cotizacion">{moneda2}</span> {`${monIsoBase} `}{" "}
              {cotizacion2.toLocaleString("de-DE", {
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="info_data cotizaciones_p">
              ultima actualizacion:{" "}
              <strong>
                {moment(ultimaActualizacion).format("DD/MM/YYYY hh:mm")} hs
              </strong>
            </p>
          </>
        ) : (
          <p className="info_data cotizaciones_p">
            Momentaneamente el servicio de cotizaciones se encuentra{" "}
            <strong>suspendido.</strong>
          </p>
        )}
      </div>
    );
  };