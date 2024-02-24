import { useEffect, useMemo } from 'react';

import { useRequest } from 'ahooks';
import { groupBy } from 'lodash';

export const useMediaDevices = () => {
  const { data, refresh } = useRequest(
    () => navigator.mediaDevices.getUserMedia({ audio: true }).then(() => navigator.mediaDevices.enumerateDevices()),
    {
      cacheKey: 'mediaDevices',
    },
  );

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refresh);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refresh);
    };
  }, []);

  const mediaDevices = useMemo(() => groupBy(data, 'kind') as Record<MediaDeviceKind, MediaDeviceInfo[]>, [data]);

  return { mediaDevices, refresh };
};
