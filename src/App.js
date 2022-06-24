import { ApolloProvider } from "@apollo/client";
import { ConfigProvider } from "antd";
import { client } from "./apollo/ApolloClient";
import esES from "antd/lib/locale/es_ES";
import "./App.css";
import TablaNegocios from "./components/ui/table/TablaNegocios";
import { GlobalContext } from "./components/context/GlobalContext";
import { useState } from "react";
import {getCotizacionDolar} from '../src/helpers/getCotizacionDolar'; 
import {getCotizacionReal} from '../src/helpers/getCotizacionReal';

const App = () => {

  const [cotizacionDolar, setCotizacionDolar] = useState(0);
  const [cotizacionReal, setCotizacionReal] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState("")

  getCotizacionDolar().then((res) => {
    if (res.data){
      setCotizacionDolar(1 / (Number(res.data.venta)));
      setUltimaActualizacion(res.data.fecha);
    }
  });

  getCotizacionReal().then((res) => {
    if (res.data) setCotizacionReal(1 / (Number(res.data.venta)));
  });

  return (
    <GlobalContext.Provider value={{cotizacionDolar, cotizacionReal, ultimaActualizacion}}>
      <ConfigProvider locale={esES}>
        <ApolloProvider client={client}>
          <TablaNegocios />
        </ApolloProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
};

export default App;
