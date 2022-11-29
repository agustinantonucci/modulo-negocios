import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  Card,
  Popover,
  Divider,
  Tooltip,
} from "antd";
import {
  DislikeOutlined,
  EyeOutlined,
  LikeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./index.css";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_NEGOCIOS } from "../../../graphql/query/Negocios";
import { GET_CONFIGURACION } from "../../../graphql/query/Configuracion";
import { GlobalContext } from "../../context/GlobalContext";
import { useContext } from "react";
import { conversorMonedas } from "../../../helpers/conversorMonedas";
import Info from "./Info";
import { infoCotizacion } from "./InfoCotizacion";

const TablaNegocios = () => {
  const url = window.location.search;
  const urlParameter = url.split("=");
  const primerSplit = urlParameter[1].split("?");
  const idCliente = primerSplit[0];

  const searchInput = useRef(null);
  const [listadoNegocios, setListadoNegocios] = useState([]);
  const [listadoNegociosFiltrados, setListadoNegociosFiltrados] = useState([]);
  const [listadoEtiquetas, setListadoEtiquetas] = useState([]);
  const [totalMostrar, setTotalMostrar] = useState([]);
  const [totalEtapaMostrar, setTotalEtapaMostrar] = useState([]);
  const [cantAbiertos, setCantAbiertos] = useState([]);
  const [cantGanados, setCantGanados] = useState([]);
  const [cantPerdidos, setCantPerdidos] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("abierto");
  const [monIsoBase, setMonIsoBase] = useState([]);
  const [verInfo, setVerInfo] = useState([]);

  const {
    cotizacionDolar,
    cotizacionReal,
    ultimaActualizacion,
    setReloadingApp,
    usuA, 
    setUsuA,
    idEtapa, 
    setIdEtapa,
    idNeg,
    setIdNeg,
    idUser,
  } = useContext(GlobalContext);

  //console.log(idNeg);
  localStorage.setItem("IdNeg", idNeg);
  localStorage.setItem("IdEtapa", idEtapa);

  const { data, loading, error } = useQuery(GET_NEGOCIOS, {
    variables: { idCliente: Number(idCliente) },
  });

  const { data: getConfiguracion } = useQuery(GET_CONFIGURACION);

  useEffect(() => {
    setReloadingApp(true);
    setVerInfo(urlParameter[2] ? urlParameter[2] : "0");

    if (data && getConfiguracion) {
      const dataConfig = JSON.parse(getConfiguracion.getConfiguracionResolver);
      const negocios = JSON.parse(data.getNegociosIframeResolver);

      //console.log(negocios);

      setListadoNegocios(negocios.dataNeg);

      //console.log(verInfo);

      setListadoEtiquetas(negocios.dataTags);
      setPipelines(
        negocios.dataPipelines.map((item) => {
          return { text: item.pip_nombre, value: item.pip_nombre };
        })
      );

      let sumaNegociosAbiertos = 0;
      let sumaNegociosCerrados = 0;

      let sumaEtapaAbiertos = 0;
      let sumaEtapaCerrados = 0;

      const negociosAbiertos = negocios.dataNeg.filter(
        (negocio) => negocio.neg_estado === 0
      );

      const negociosCerrados = negocios.dataNeg.filter(
        (negocio) => negocio.neg_estado !== 0
      );

      setListadoNegociosFiltrados(
        tipoFiltro === "abierto"
          ? negociosAbiertos
          : tipoFiltro === "cerrado"
          ? negociosCerrados
          : listadoNegocios
      );

      setCantAbiertos(negociosAbiertos.length);
      setCantGanados(
        negociosCerrados.filter((negocio) => negocio.neg_estado === 1).length
      );
      setCantPerdidos(
        negociosCerrados.filter((negocio) => negocio.neg_estado === 2).length
      );

      const monedaDefecto = dataConfig[0].mon_id;
      setMonIsoBase(dataConfig[0].mon_iso);

      negociosAbiertos.map((negocio) => {
        const elemento = negocio;

        const { nuevoImporte } = conversorMonedas(
          elemento,
          monedaDefecto,
          cotizacionDolar,
          cotizacionReal
        );

        sumaEtapaAbiertos += (nuevoImporte * negocio.eta_avance) / 100;
        sumaNegociosAbiertos += nuevoImporte;
      });

      negociosCerrados.map((negocio) => {
        const elemento = negocio;

        const { nuevoImporte } = conversorMonedas(
          elemento,
          monedaDefecto,
          cotizacionDolar,
          cotizacionReal
        );

        sumaEtapaCerrados += (nuevoImporte * negocio.eta_avance) / 100;
        sumaNegociosCerrados += nuevoImporte;
      });

      // const{ totalNegocios, totalEtapas } = calcularTotales(tipoFiltro, sumaNegociosAbiertos, sumaNegociosCerrados, sumaEtapaAbiertos, sumaEtapaCerrados);

      // setTotalMostrar(totalNegocios);
      // setTotalEtapaMostrar(totalEtapas);

      tipoFiltro === "abierto"
        ? (setTotalMostrar(sumaNegociosAbiertos),
          setTotalEtapaMostrar(sumaEtapaAbiertos))
        : tipoFiltro === "cerrado"
        ? (setTotalMostrar(sumaNegociosCerrados),
          setTotalEtapaMostrar(sumaEtapaCerrados))
        : (setTotalMostrar(sumaNegociosAbiertos + sumaNegociosCerrados),
          setTotalEtapaMostrar(sumaEtapaAbiertos + sumaEtapaCerrados));

      setReloadingApp(false);
    }
  }, [data, getConfiguracion, tipoFiltro]);

  //console.log(idUser);

  const obtenerFila = (val) => {
    setIdNeg(val);
    const PORT = window.location.port ? window.location.port : 80;
    const PROTOCOL = window.location.protocol;
    const HOSTNAME = window.location.hostname;
    const loc = window.location.pathname;
    const URL = `${PROTOCOL}//${HOSTNAME}:${PORT}`;

    console.log("URL ", URL);
    const c = idUser;
    const u = localStorage.getItem('usuario');
    //const u = 2049;
    //console.log("usuarioLocalStorage: ", u);
    //console.log(`${PROTOCOL}//${HOSTNAME}:${PORT}/tati/deal/?negId=${val}&userId=${u}`);

    //window.open(`${PROTOCOL}//${HOSTNAME}:${PORT}/tati/deal/?negId=${val}&userId=${u}`)
    window.location.href = `${PROTOCOL}//${HOSTNAME}:${PORT}/duoc/deal/?negId=${val}&cliId=${u}`;

  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={"Buscar negocio"}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reiniciar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
  });

  const getDate = (date) => {
    const fecha = date.split("T");

    return fecha[0].split("-").reverse().join("/");
  };

  const columns = [
    {
      title: "Embudo",
      dataIndex: "pip_nombre",
      key: "pip_nombre",
      filters: pipelines,
      onFilter: (value, record) => {
        return record.pip_nombre === value;
      },
      render: (dataIndex) => {
        return <p className="columna-color">{dataIndex}</p>;
      },
    },
    {
      title: "Etapa",
      dataIndex: "eta_nombre",
      key: "eta_nombre",
      align: "left",
    },
    {
      title: "Negocio",
      dataIndex: "neg_asunto",
      key: "neg_asunto",
      ...getColumnSearchProps("neg_asunto"),
      render: (dataIndex, item) => {
        const etiquetasNegocios = listadoEtiquetas.filter(
          (x) => x.neg_id === item.neg_id
        );
        return (
          <>
            <p className="columna-color">{dataIndex}</p>
            <div
              className={etiquetasNegocios.length > 0 ? "div-contenedor" : ""}
            >
              {etiquetasNegocios.map((element, idx) => {
                return (
                  <Popover
                    key={idx}
                    content={etiquetasNegocios.map((element) => {
                      return (
                        <Tag color={element.etq_color} key={element.etq_id}>
                          {element.etq_nombre}
                        </Tag>
                      );
                    })}
                  >
                    <Tag
                      color={element.etq_color}
                      key={element.etq_id}
                      className="tags"
                    ></Tag>
                  </Popover>
                );
              })}
            </div>
          </>
        );
      },
    },
    {
      title: "Importe",
      dataIndex: "neg_valor",
      key: "neg_valor",
      align: "right",
      sorter: (a, b) => a.neg_valor - b.neg_valor,
      render: (dataIndex, item) => (
        <>{`${item.mon_iso} ${dataIndex.toLocaleString("de-DE", {
          minimumFractionDigits: 0,
        })}`}</>
      ),
    },
    {
      title: "% Etapa",
      dataIndex: "eta_avance",
      key: "eta_avance",
      align: "right",
      sorter: (a, b) => a.eta_avance - b.eta_avance,
    },
    {
      title: "Fecha de Creación",
      dataIndex: "neg_fechacreacion",
      key: "neg_fechacreacion",
      align: "center",
      sorter: (a, b) => a.neg_fechacreacion.localeCompare(b.neg_fechacreacion),
      render: (dataIndex) => getDate(dataIndex),
    },
    {
      title: "Fecha de Cierre",
      dataIndex: "neg_fechacierre",
      key: "neg_fechacierre",
      align: "center",
      sorter: (a, b) => a.neg_fechacierre.localeCompare(b.neg_fechacierre),
      render: (dataIndex) => getDate(dataIndex),
    },
    {
      title: "...",
      key: "tipoCerrado",
      align: "center",
      render: (dataIndex, item) => {
        return (
          <span>
            {tipoFiltro === "cerrado" ? (
              <>
                {item.neg_estado === 1 && (
                  <Tooltip title="Cerrado Ganado" placement="left">
                    <LikeOutlined style={{ color: "green" }} />
                  </Tooltip>
                )}
                {item.neg_estado === 2 && (
                  <Tooltip title="Cerrado Perdido" placement="left">
                    <DislikeOutlined style={{ color: "red" }} />
                  </Tooltip>
                )}
              </>
            ) : null}
          </span>
        );
      },
    },
  ];

  const handleClickEstado = (estado) => {
    setTipoFiltro(estado);
    if (estado === "abierto") {
      setListadoNegociosFiltrados(
        listadoNegocios.filter((x) => x.neg_estado === 0)
      );
    } else if (estado === "cerrado") {
      setListadoNegociosFiltrados(
        listadoNegocios.filter((x) => x.neg_estado !== 0)
      );
    } else {
      setListadoNegociosFiltrados(listadoNegocios);
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  return (
    <>
      <div className="card-wrapper">
        <div className="card-contadores">
          <div
            className={
              tipoFiltro === "total"
                ? "div-secundario dashed"
                : "div-secundario"
            }
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleClickEstado("total");
            }}
          >
            <p className="texto">NEGOCIOS</p>
            <p className="numeros">
              {cantAbiertos + cantGanados + cantPerdidos}
            </p>
          </div>
          <Divider
            type="vertical"
            style={{
              height: "100%",
              borderColor: "#f0f0f0",
              borderWidth: "2px",
            }}
          />
          <div>
            <div
              className={
                tipoFiltro === "abierto"
                  ? "div-secundario dashed"
                  : "div-secundario"
              }
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleClickEstado("abierto");
              }}
            >
              <p className="texto">ABIERTOS</p>
              <p className="numeros">{cantAbiertos}</p>
            </div>
            <hr className={tipoFiltro === "total" ? "hr1" : "cancela-hr"} />
            <div
              className={
                tipoFiltro === "cerrado"
                  ? "div-secundario dashed"
                  : "div-secundario"
              }
              style={{ cursor: "pointer" }}
              onClick={() => handleClickEstado("cerrado")}
            >
              <p className="texto">CERRADOS</p>
              <p className="numeros">{cantGanados + cantPerdidos}</p>
            </div>
          </div>
        </div>
        <Card className="card-content">
          <div className="div-content">
            <p className="totales">
              {`U$D ${totalMostrar.toLocaleString("de-DE", {
                minimumFractionDigits: 0,
              })}`}
            </p>
            <p className="descripcion">Total negocios</p>
          </div>
        </Card>
        <Card className="card-content">
          <div className="div-content">
            <p className="totales">
              {`U$D ${totalEtapaMostrar.toLocaleString("de-DE", {
                minimumFractionDigits: 0,
              })}`}
            </p>
            <p className="descripcion">Total % por etapa</p>
          </div>
        </Card>
        {verInfo === "0" ? (
          <div className="filter-data">
            <Info placement={"left"} title={`Cotización ${monIsoBase}`}>
              {infoCotizacion(
                monIsoBase,
                cotizacionDolar,
                cotizacionReal,
                ultimaActualizacion
              )}
            </Info>
          </div>
        ) : (
          <></>
        )}
      </div>
      <Table
        rowKey={"neg_id"}
        size={"small"}
        dataSource={listadoNegociosFiltrados}
        columns={columns}
        pagination={{
          position: ["none", "bottomCenter"],
        }}
        onRow={(record) => ({
          onClick: () => {
            //console.log(record)
            obtenerFila(record.neg_id);
            setIdEtapa(record.eta_id);
          },
        })}
      />
    </>
  );
};

export default TablaNegocios;
