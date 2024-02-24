import { api } from '@/api';

import type { LoaderFunctionArgs } from '@modern-js/runtime/router';

export const loader = ({ params }: LoaderFunctionArgs): Promise<XJ.CollectionDetail | undefined> => {
  if (params.collectionId) {
    return api.getCollectionDetail(params.collectionId).then(res => res.data);
  }
  return Promise.resolve(undefined);
};
