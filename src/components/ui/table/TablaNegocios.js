import { Table, Tag, Space, Input, Button, Card, Popover, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./index.css";
import { useState, useRef, useEffect } from "react";
import moment from "moment";
import { useQuery } from "@apollo/client";
import { GET_NEGOCIOS } from "../../../graphql/query/Negocios";

const TablaNegocios = () => {
  const searchInput = useRef(null);
  // const [searchText, setSearchText] = useState("");
  // const [searchedColumn, setSearchedColumn] = useState("");
  const [listadoNegocios, setListadoNegocios] = useState([]);
  const [listadoEtiquetas, setListadoEtiquetas] = useState([]);
  const [totalNegocio, setTotalNegocio] = useState([]);
  const [totalEtapa, setTotalEtapa] = useState([]);
  const [cantAbiertos, setCantAbiertos] = useState([]);
  const [cantCerrados, setCantCerrados] = useState([]);

  const { data, loading, error } = useQuery(GET_NEGOCIOS, {
    variables: { idCliente: 6510 },
  });

  useEffect(() => {
    if (data) {
      const negocios = JSON.parse(data.getNegociosIframeResolver);
      console.log(data);
      console.log(negocios);
      setListadoNegocios(negocios.dataNeg);
      setListadoEtiquetas(negocios.dataTags);

      let sumaNegocio = 0;
      let sumaEtapa = 0;

      let conteoAbiertos = 0;
      let conteoCerrados = 0;
      negocios.dataNeg.map((element) => {
        sumaNegocio += element.neg_valor;
        sumaEtapa += (element.neg_valor * element.eta_avance) / 100;
        element.neg_estado === 0 ? conteoAbiertos++ : conteoCerrados++;
      });
      console.log(sumaNegocio);
      setTotalNegocio(sumaNegocio);

      console.log(sumaEtapa);
      setTotalEtapa(sumaEtapa);

      setCantAbiertos(conteoAbiertos);
      setCantCerrados(conteoCerrados);
    }
  }, [data]);

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
      ...getColumnSearchProps("pipe"),
      // render: (dataIndex, item) => (
      //   <>
      //     {dataIndex}
      //     {item.age < 30 ? (
      //       <Tag
      //         color={"green"}
      //         key={1}
      //         onClick={() => console.log(dataIndex, item)}
      //       >
      //         Menor a 30
      //       </Tag>
      //     ) : (
      //       <Tag
      //         color={"red"}
      //         key={1}
      //         onClick={() => console.log(dataIndex, item)}
      //       >
      //         Mayor a 30
      //       </Tag>
      //     )}
      //   </>
      // ),
      //se maneja por el dataIndex
      //
    },
    {
      title: "Etapa",
      dataIndex: "eta_id",
      key: "eta_id",
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
        console.log(etiquetasNegocios);
        return (
          <>
            {dataIndex}
            <div className="div-contenedor">
              {etiquetasNegocios.map((element) => {
                return (
                  <Popover
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
              {/* {setEtiquetaPorNegocio(listadoEtiquetas.filter((x) => x.neg_id === item.neg_id))}; */}
              {/* {item.pipe === "Comercial" && (
              <>
                <Popover
                  content={() => (
                    <>
                      <Tag color="#f50">Etiqueta 1</Tag>
                      <Tag color="#f50fff">Etiqueta 2</Tag>
                    </>
                  )}
                >
                  <span className="span-cajas">
                    <Tag color="#f50" style={{ height: "5px" }}></Tag>
                    <Tag color="#f50fff" style={{ height: "5px" }}></Tag>
                  </span>
                </Popover>
              </>
            )} */}
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
        <>{`${item.mon_codigo} ${dataIndex.toLocaleString("de-DE", {
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
  ];

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
            <h2>Abiertos</h2>
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
            <h2>Cerrados</h2>
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
      </div>
      <Table
        size={"small"}
        dataSource={listadoNegocios}
        columns={columns}
        pagination={{
          position: ["none", "bottomCenter"],
        }}
      />
    </>
  );
};

export default TablaNegocios;
