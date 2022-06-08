import { Table, Tag, Space, Input, Button } from 'antd';
import {  SearchOutlined } from '@ant-design/icons';
const TablaNegocios = () => {

    const dataSource = [
        {
          key: '1',
          name: 'Mike',
          age: 29,
          address: '10 Downing Street',
        },
        {
          key: '2',
          name: 'John',
          age: 42,
          address: '10 Downing Street',
        },
      ];
      
      const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          //...getColumnSearchProps('name'),
          render: (dataIndex, item) => (
            <>
            {dataIndex}
            {item.age < 30 ? <Tag color={"green"} key={1} onClick={() => console.log(dataIndex,item)}>
                    Menor a 30
                </Tag>: <Tag color={"red"} key={1} onClick={() => console.log(dataIndex,item)}>
                    Mayor a 30
                </Tag>}
            </>
          ),
          //se maneja por el dataIndex
          //
        },
        {
          title: 'Age',
          dataIndex: 'age',
          key: 'age',
          render: (dataIndex, item) => (
            <>
                {dataIndex}
                {item.name === "Mike" ? <Button disabled={true} onClick={() => console.log(dataIndex, item)}>Probar</Button>
                : <Button size= "large" onClick={() => console.log(dataIndex, item)}>Probar</Button>}
            </>
          )
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
        },
      ];

      const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder={"Buscar negocio"}
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ width: 188, marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Buscar
              </Button>
              <Button
                onClick={() => handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reiniciar
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex]
            ? record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            : "",
      });

    return ( 
        <Table dataSource={dataSource}
            columns={columns}/>
     );
}
 
export default TablaNegocios;