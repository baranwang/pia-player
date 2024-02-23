import { Outlet } from '@modern-js/runtime/router';

import { BaseLayout } from '@/components/base-layout';

export default function () {
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}
