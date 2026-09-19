import type { ReactElement } from 'react';
import React from 'react';
import { CharmEmptyState } from './charm/CharmEmptyState';
import { cloudinaryCharmBookmarks } from '../lib/image';

interface BookmarkEmptyScreenProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

const defaultDescription =
  'Feed\'inize dönün ve saklamak veya daha sonra okumak istediğiniz postları yer imlerine ekleyin. Yer imlerine eklediğiniz her post burada saklanacaktır.';

export default function BookmarkEmptyScreen({
  title = 'Yer imi listeniz boş.',
  description = defaultDescription,
  image = cloudinaryCharmBookmarks,
  imageAlt = 'daily.dev charm holding a bookmark',
}: BookmarkEmptyScreenProps): ReactElement {
  return (
    <CharmEmptyState
      className="withNavBar mt-12 justify-center"
      image={image}
      imageAlt={imageAlt}
      title={title}
      description={description}
      action={{ label: 'Feed\'e geri dön', href: '/' }}
    />
  );
}
