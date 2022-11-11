import { ApolloProvider } from "@apollo/client";
import { ConfigProvider, Spin } from "antd";
import { client } from "./apollo/ApolloClient";
import esES from "antd/lib/locale/es_ES";
import "./App.css";
import TablaNegocios from "./components/ui/table/TablaNegocios";
import { GlobalContext } from "./components/context/GlobalContext";
import { useEffect, useState } from "react";
import {getCotizacionDolar} from '../src/helpers/getCotizacionDolar'; 
import {getCotizacionReal} from '../src/helpers/getCotizacionReal';

const App = () => {

  const [cotizacionDolar, setCotizacionDolar] = useState(0);
  const [cotizacionReal, setCotizacionReal] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState("")
  const [reloadingApp, setReloadingApp] = useState(false);
  const [idNeg, setIdNeg] = useState();
  const [idUser, setIdUser] = useState("");


  useEffect(() => {
    const url = window.location;
    const urlSearch = url.search;

    if (urlSearch) {
      const params = urlSearch.split("=");
      //console.log(params);
      const idUserFromParams = params[1];
      setIdUser(Number(idUserFromParams));
      // console.log("Usuario ->", idUserFromParams);
    }
  }, []);


  getCotizacionDolar().then((res) => {
    if (res.data){
      setCotizacionDolar(1 / (Number(res.data.venta)));
      setUltimaActualizacion(res.data.fecha);
      setReloadingApp(false);
    }
  });

  getCotizacionReal().then((res) => {
    if (res.data) setCotizacionReal(1 / (Number(res.data.venta)));
  });

  return (
    <GlobalContext.Provider value={{cotizacionDolar, cotizacionReal, ultimaActualizacion, setReloadingApp, idNeg, setIdNeg, idUser, setIdUser}}>
      <ConfigProvider locale={esES}>
        <ApolloProvider client={client}>
          <Spin id="main_loader" tip="Cargando" spinning={reloadingApp} className="color">
            <TablaNegocios />
          </Spin>
        </ApolloProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
};

export default App;
