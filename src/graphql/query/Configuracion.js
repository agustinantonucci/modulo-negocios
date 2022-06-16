import { gql } from "@apollo/client";

export const GET_CONFIGURACION = gql`
  query getConfig {
    getConfiguracionResolver
  }
`;
