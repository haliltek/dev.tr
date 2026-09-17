import type { HTMLAttributes, ReactElement } from 'react';
import React from 'react';
import { isValid } from 'date-fns';

export interface JoinedDateProps extends HTMLAttributes<HTMLDivElement> {
  date: Date;
  dateFormat?: string;
}

export default function JoinedDate({
  date,
  ...props
}: JoinedDateProps): ReactElement | null {
  if (!isValid(date)) {
    return null;
  }

  const formattedDate = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div {...props}>
      <time dateTime={date.toISOString()}>{formattedDate}</time> tarihinde katıldı
    </div>
  );
}
