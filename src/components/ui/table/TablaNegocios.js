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
  LikeOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./index.css";
import { useState, useRef, useEffect, useMemo } from "react";
import moment from "moment";
import { useQuery } from "@apollo/client";
import { GET_NEGOCIOS } from "../../../graphql/query/Negocios";
import { GET_CONFIGURACION } from "../../../graphql/query/Configuracion";
import { getCotizacionDolar } from "../../../helpers/getCotizacionDolar";
import { getCotizacionReal } from "../../../helpers/getCotizacionReal";

const TablaNegocios = () => {
  const url = window.location.search;
  const urlParameter = url.split("=");
  const idCliente = urlParameter[1];

  const searchInput = useRef(null);
  const [listadoNegocios, setListadoNegocios] = useState([]);
  const [listadoNegociosFiltrados, setListadoNegociosFiltrados] = useState([]);
  const [listadoEtiquetas, setListadoEtiquetas] = useState([]);
  const [totalNegocio, setTotalNegocio] = useState([]);
  const [totalEtapa, setTotalEtapa] = useState([]);
  const [cantAbiertos, setCantAbiertos] = useState([]);
  const [cantCerrados, setCantCerrados] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [config, setConfig] = useState({});

  const { data, loading, error } = useQuery(GET_NEGOCIOS, {
    variables: { idCliente: Number(idCliente) },
  });

  const { data: getConfiguracion } = useQuery(GET_CONFIGURACION);

  getCotizacionDolar().then((res) => {
    console.log(res.data);
  });

  getCotizacionReal().then((res) => {
    console.log(res.data);
  });

  useEffect(() => {
    if (data && getConfiguracion) {
      const dataConfig = JSON.parse(getConfiguracion.getConfiguracionResolver);
      setConfig(dataConfig[0]);
      const negocios = JSON.parse(data.getNegociosIframeResolver);

      setListadoNegocios(negocios.dataNeg);
      setListadoNegociosFiltrados(negocios.dataNeg);
      setListadoEtiquetas(negocios.dataTags);
      setPipelines(
        negocios.dataPipelines.map((item) => {
          return { text: item.pip_nombre, value: item.pip_nombre };
        })
      );

      let sumaNegocio = 0;
      let sumaEtapa = 0;

      let conteoAbiertos = 0;
      let conteoCerrados = 0;
      negocios.dataNeg.map((element) => {

        
        sumaNegocio += element.neg_valor;
        sumaEtapa += (element.neg_valor * element.eta_avance) / 100;
        element.neg_estado === 0 ? conteoAbiertos++ : conteoCerrados++;
      });

      setTotalNegocio(sumaNegocio);
      setTotalEtapa(sumaEtapa);
      setCantAbiertos(conteoAbiertos);
      setCantCerrados(conteoCerrados);
    }
  }, [data, getConfiguracion]);

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
          placeholder={`Buscar por embudo`}
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
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const getDate = (date) => {
    const fecha = date.split("T");

    return fecha[0].split("-").reverse().join("-");
  };

  const columns = [
    {
      title: "Pipe",
      dataIndex: "pip_nombre",
      key: "pip_nombre",
      filters: pipelines,
      onFilter: (value, record) => {
        return record.pip_nombre === value;
      },
    },
    {
      title: "Etapa",
      dataIndex: "eta_nombre",
      key: "eta_nombre",
    },
    {
      title: "Negocio",
      dataIndex: "neg_asunto",
      key: "neg_asunto",
      ...getColumnSearchProps("negocio"),
      render: (dataIndex, item) => {
        const etiquetasNegocios = listadoEtiquetas.filter(
          (x) => x.neg_id === item.neg_id
        );
        return (
          <>
            {dataIndex}
            <div className="div-contenedor">
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
                    <Tag color={element.etq_color} key={element.etq_id}></Tag>
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
      sorter: (a, b) => a.importe - b.importe,
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
      sorter: (a, b) => a.pcetapa - b.pcetapa,
      // render: (dataIndex) => (
      //   <>{dataIndex.toLocaleString("de-DE", { minimumFractionDigits: 0 })}</>
      // ),
    },
    {
      title: "Fecha de Creación",
      dataIndex: "neg_fechacreacion",
      key: "neg_fechacreacion",
      align: "center",
      sorter: (a, b) =>
        new Date(moment(a.cierre, "Do MMMM YYYY").format("L")) -
        new Date(moment(b.cierre, "Do MMMM YYYY").format("L")),
      render: (dataIndex) => getDate(dataIndex),
    },
    {
      title: "Fecha de Cierre",
      dataIndex: "neg_fechacierre",
      key: "neg_fechacierre",
      align: "center",
      sorter: (a, b) =>
        new Date(moment(a.cierre, "Do MMMM YYYY").format("L")) -
        new Date(moment(b.cierre, "Do MMMM YYYY").format("L")),
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
    } else {
      setListadoNegociosFiltrados(
        listadoNegocios.filter((x) => x.neg_estado !== 0)
      );
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
        <div className="card-principal">
          <div className="div-secundario">
            <h2
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleClickEstado("abierto");
              }}
            >
              Abiertos
            </h2>
            <h4>{cantAbiertos}</h4>
          </div>
          <Divider
            type="vertical"
            style={{
              height: "100%",
              borderColor: "#f0f0f0",
              borderWidth: "2px",
            }}
          />
          <div className="div-secundario">
            <h2
              style={{ cursor: "pointer" }}
              onClick={() => handleClickEstado("cerrado")}
            >
              Cerrados
            </h2>
            <h4>{cantCerrados}</h4>
          </div>
        </div>
        <Card className="card-content">
          <div className="div-content">
            <h2>
              {`U$D ${totalNegocio.toLocaleString("de-DE", {
                minimumFractionDigits: 0,
              })}`}
            </h2>
            <h4>Total negocios</h4>
          </div>
        </Card>
        <Card className="card-content">
          <div className="div-content">
            <h2>
              {`U$D ${totalEtapa.toLocaleString("de-DE", {
                minimumFractionDigits: 0,
              })}`}
            </h2>
            <h4>Total % por etapa</h4>
          </div>
        </Card>

        <div className="config-content">
          <Tooltip title={config.mon_divisa} placement="bottomRight">
            <SettingOutlined style={{ fontSize: "15px" }} />
          </Tooltip>
        </div>
      </div>
      <Table
        rowKey={"neg_id"}
        size={"small"}
        dataSource={listadoNegociosFiltrados}
        columns={columns}
        pagination={{
          position: ["none", "bottomCenter"],
        }}
      />
    </>
  );
};

export default TablaNegocios;
