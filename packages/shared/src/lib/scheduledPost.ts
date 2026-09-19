import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import { dateFormatInTimezone, DEFAULT_TIMEZONE } from './timezones';

// Keep in sync with daily-api MAX_POST_SCHEDULE_DAYS in src/common/postScheduling.ts
export const MAX_POST_SCHEDULE_DAYS = 14;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_POST_SCHEDULE_MS = MAX_POST_SCHEDULE_DAYS * ONE_DAY_MS;
const DEFAULT_SCHEDULE_DELAY_MS = 60 * 60 * 1000;

export type PostScheduleValidation = { iso: string } | { error: string };

export const getDefaultPostScheduledStart = (timezone?: string): string =>
  dateFormatInTimezone(
    new Date(Date.now() + DEFAULT_SCHEDULE_DELAY_MS),
    "yyyy-MM-dd'T'HH:mm",
    timezone,
  );

// Convert a stored ISO/UTC scheduledAt into the `datetime-local` string the
// picker expects, rendered in the given timezone.
export const formatScheduledAtInput = (
  iso: string,
  timezone?: string,
): string =>
  dateFormatInTimezone(new Date(iso), "yyyy-MM-dd'T'HH:mm", timezone);

export const parsePostScheduledStart = (
  value: string | undefined | null,
  timezone?: string,
): Date | null => {
  if (!value) {
    return null;
  }

  const date = zonedTimeToUtc(value, timezone || DEFAULT_TIMEZONE);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatScheduleDelta = (date: Date | null): string | null => {
  if (!date) {
    return null;
  }

  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) {
    return 'şimdi';
  }

  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) {
    return `${minutes} dakika sonra`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} saat sonra`;
  }

  const days = Math.round(hours / 24);
  return `${days} gün sonra`;
};

// Validation copy mirrors the daily-api errors so the client blocks the same
// inputs the server would reject.
export const validatePostScheduledStart = (
  value: string | undefined | null,
  timezone?: string,
): PostScheduleValidation => {
  const date = parsePostScheduledStart(value, timezone);

  if (!date) {
    return { error: 'Planlanan zaman geçersiz' };
  }

  if (date.getTime() <= Date.now()) {
    return { error: 'Planlanan zaman gelecekte bir tarih olmalıdır' };
  }

  if (date.getTime() > Date.now() + MAX_POST_SCHEDULE_MS) {
    return {
      error: `Planlanan zaman ${MAX_POST_SCHEDULE_DAYS} gün içinde olmalıdır`,
    };
  }

  return { iso: date.toISOString() };
};
