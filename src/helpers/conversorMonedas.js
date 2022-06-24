export const conversorMonedas = (
  elemento,
  monedaDefecto,
  cotizacionDolar,
  cotizacionReal
) => {
  let nuevoImporte = 0;

  if (elemento.mon_id !== monedaDefecto) {
    if (monedaDefecto == 2) {
      if (elemento.mon_id == 1) {
        nuevoImporte = elemento.neg_valor * cotizacionDolar;
      } else {
        nuevoImporte = elemento.neg_valor * (cotizacionDolar / cotizacionReal);
      }
    } else if (monedaDefecto == 3) {
      if (elemento.mon_id == 1) {
        nuevoImporte = elemento.neg_valor * cotizacionReal;
      } else {
        nuevoImporte = elemento.neg_valor * (cotizacionReal / cotizacionDolar);
      }
    } else if (monedaDefecto == 1) {
      if (elemento.mon_id == 2) {
        nuevoImporte = elemento.neg_valor * (1 / cotizacionDolar);
      } else {
        nuevoImporte = elemento.neg_valor * (1 / cotizacionReal);
      }
    }
  } else {
    nuevoImporte = elemento.neg_valor;
  }
  
  return {nuevoImporte};
};
