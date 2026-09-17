import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { contentGuidelines, webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export type FooterLinksProps = {
  className?: string;
};

export const FooterLinks = ({ className }: FooterLinksProps): ReactElement => {
  return (
    <footer className="z-1 pb-4">
      <nav>
        <ul
          className={classNames(
            className,
            'mb-4 flex flex-row flex-wrap justify-center gap-3 text-text-tertiary typo-caption1',
          )}
        >
          <li>&copy; {new Date().getFullYear()} devcore.tr</li>
          <li>
            <a href={contentGuidelines} target="_blank" rel={anchorDefaultRel}>
              İlkeler
            </a>
          </li>
          <li>
            <a href={`${webappUrl}posts`}>Keşfet</a>
          </li>
          <li>
            <a href={`${webappUrl}tags`}>Etiketler</a>
          </li>
          <li>
            <a href={`${webappUrl}sources`}>Kaynaklar</a>
          </li>
          <li>
            <a href={`${webappUrl}squads`}>Topluluklar</a>
          </li>
          <li>
            <a href={`${webappUrl}users`}>Liderlik Tablosu</a>
          </li>
        </ul>
      </nav>
    </footer>
  );
};
