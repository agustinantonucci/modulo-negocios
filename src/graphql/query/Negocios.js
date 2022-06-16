import { gql } from "@apollo/client";

export const GET_NEGOCIOS = gql`
  query getNegociosIframe($idCliente: Int) {
    getNegociosIframeResolver(idCliente: $idCliente)
  }
`;
