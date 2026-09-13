import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Tooltip } from '../tooltip/Tooltip';
import { EarthIcon } from '../icons/Earth';
import { IconSize } from '../Icon';

export type FeedScope = 'tr' | 'global';

export const FEED_SCOPE_STORAGE_KEY = 'devcore_feed_scope';
export const FEED_SCOPE_EVENT = 'devcore_feed_scope_change';

export function useFeedScope(): [FeedScope, (newScope: FeedScope) => void] {
  const [scope, setScope] = useState<FeedScope>('tr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FEED_SCOPE_STORAGE_KEY) as
        | FeedScope
        | null;
      if (saved === 'tr' || saved === 'global') {
        setScope(saved);
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<FeedScope>;
      if (customEvent.detail) {
        setScope(customEvent.detail);
      }
    };

    window.addEventListener(FEED_SCOPE_EVENT, handler);
    return () => window.removeEventListener(FEED_SCOPE_EVENT, handler);
  }, []);

  const updateScope = (newScope: FeedScope) => {
    setScope(newScope);
    try {
      localStorage.setItem(FEED_SCOPE_STORAGE_KEY, newScope);
      window.dispatchEvent(
        new CustomEvent(FEED_SCOPE_EVENT, { detail: newScope }),
      );
    } catch {
      // ignore
    }
  };

  return [scope, updateScope];
}

export function FeedScopeToggle({ className }: { className?: string }): ReactElement {
  const [scope, setScope] = useFeedScope();
  const isGlobal = scope === 'global';

  return (
    <Tooltip
      content={
        isGlobal
          ? 'Global akış açık (İngilizce + Türkçe). Sadece Türkçe görmek için tıklayın.'
          : 'Global akışı aç (Yabancı ve global tech içeriklerini dahil et)'
      }
      side="bottom"
    >
      <button
        type="button"
        onClick={() => setScope(isGlobal ? 'tr' : 'global')}
        aria-pressed={isGlobal}
        aria-label={isGlobal ? 'Global akışı kapat' : 'Global akışı aç'}
        className={classNames(
          'hidden laptop:flex items-center gap-2 h-10 px-3.5 rounded-12 typo-callout font-semibold transition-all duration-200 cursor-pointer border select-none',
          isGlobal
            ? 'bg-text-primary text-background-default border-text-primary shadow-sm hover:opacity-95'
            : 'bg-surface-float text-text-secondary border-border-subtlest-tertiary hover:text-text-primary hover:bg-surface-hover hover:border-border-subtle',
          className,
        )}
      >
        <EarthIcon
          size={IconSize.Size16}
          secondary={isGlobal}
          className={classNames(
            'transition-transform duration-200',
            isGlobal ? 'scale-105' : 'text-text-secondary',
          )}
        />
        <span>Global</span>
        <span
          className={classNames(
            'w-1.5 h-1.5 rounded-full transition-all duration-200',
            isGlobal
              ? 'bg-background-default shadow-sm'
              : 'bg-border-subtlest-tertiary',
          )}
        />
      </button>
    </Tooltip>
  );
}

export default FeedScopeToggle;
