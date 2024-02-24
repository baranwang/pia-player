import { useEffect, useState } from 'react';

import { Image, Modal } from '@douyinfe/semi-ui';
import { useRequest } from 'ahooks';
import { createRoot } from 'react-dom/client';

import { api } from '@/api';

interface LoginProps {
  onLogin?: () => void;
  onCancel?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [visible, setVisible] = useState(true);
  const { data } = useRequest(api.getWechatQrCode);

  const { cancel } = useRequest(() => api.getWechatLoginStatus(data?.ticket ?? ''), {
    refreshDeps: [data?.ticket],
    ready: Boolean(data?.ticket) && visible,
    pollingInterval: 1000,
    onSuccess: res => {
      if ('token' in res) {
        localStorage.setItem('token', res.token);
        setVisible(false);
        onLogin?.();
      }
    },
  });

  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  const handleCancel = () => {
    setVisible(false);
    onCancel?.();
  };
  return (
    <Modal title="使用微信扫码登录" visible={visible} footer={<></>} onCancel={handleCancel}>
      <div style={{ textAlign: 'center' }}>
        <Image src={data?.url} preview={false} width={160} height={160} />
      </div>
    </Modal>
  );
};

let loginPromise: Promise<void> | undefined;

export const login = () => {
  const container = document.createDocumentFragment();
  const root = createRoot(container);
  if (!loginPromise) {
    loginPromise = new Promise<void>((resolve, reject) => {
      root.render(<Login onLogin={resolve} onCancel={reject} />);
    }).finally(() => {
      root.unmount();
      loginPromise = undefined;
    });
  }
  return loginPromise;
};
