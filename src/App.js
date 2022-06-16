import { ApolloProvider } from "@apollo/client";
import { ConfigProvider } from "antd";
import { client } from "./apollo/ApolloClient";
import esES from "antd/lib/locale/es_ES";
import "./App.css";
import TablaNegocios from "./components/ui/table/TablaNegocios";

const App = () => {
  return (
    <ConfigProvider locale={esES}>
      <ApolloProvider client={client}>
        <TablaNegocios />
      </ApolloProvider>
    </ConfigProvider>
  );
};

export default App;
