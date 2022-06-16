import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo/ApolloClient";
import "./App.css";
import TablaNegocios from "./components/ui/table/TablaNegocios";

const App = () => {
  return (
    <ApolloProvider client={client}>
      <TablaNegocios />
    </ApolloProvider>
  );
};

export default App;
