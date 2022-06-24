
import { Popover, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const Info = ({ title, placement, children }) => {
  return (
    <>
      <Popover placement={placement} title={title} content={children} trigger="click">
        <Button type="link" style={{ padding: 0 }}>
          {' '}
          <InfoCircleOutlined style={{ paddingLeft: 0, marginRight: 7, color: "#00b33c" }} />
        </Button>
      </Popover>
    </>
  );
};

export default Info;