import React, { type CSSProperties } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../lib/utils';

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  'aria-label'?: string;
};

type InternalProps = BaseProps & {
  to: LinkProps['to'];
};

type ExternalProps = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

type TextLinkStyle = CSSProperties & { ['--textlink-accent']?: string };

export default function TextLink(props: InternalProps | ExternalProps) {
  const style = { '--textlink-accent': props.accent ?? '204 255 0' } as TextLinkStyle;

  const classes = cn('textlink', props.className);

  if ('href' in props) {
    const target = props.target;
    const rel = props.rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);

    return (
      <a
        href={props.href}
        target={target}
        rel={rel}
        aria-label={props['aria-label']}
        className={classes}
        style={style}
      >
        {props.children}
      </a>
    );
  }

  return (
    <Link to={props.to} aria-label={props['aria-label']} className={classes} style={style}>
      {props.children}
    </Link>
  );
}
