import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'ghost';

type BaseProps = {
  variant?: Variant;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

type AnchorProps = BaseProps & {
  href: string;
  to?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

type LinkProps = BaseProps & {
  to: string;
  href?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type ButtonProps = BaseProps & {
  to?: never;
  href?: never;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type PillButtonProps = AnchorProps | LinkProps | ButtonProps;

function isLinkProps(props: PillButtonProps): props is LinkProps {
  return typeof (props as LinkProps).to === 'string';
}

function isAnchorProps(props: PillButtonProps): props is AnchorProps {
  return typeof (props as AnchorProps).href === 'string';
}

export default function PillButton(props: PillButtonProps) {
  const { variant = 'ghost', icon, className, children, ariaLabel } = props;
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 font-display text-[12px] font-extrabold uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[4px] focus-visible:outline-acid';

  const styles =
    variant === 'primary'
      ? 'border-acid bg-acid text-ink hover:border-acid-deep hover:bg-acid-deep'
      : 'border-acid/80 bg-transparent text-acid hover:bg-acid hover:text-ink hover:shadow-[0_10px_40px_-12px_rgba(204,255,0,0.4)]';

  const content = (
    <>
      {icon ? <span className="shrink-0" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  const sharedProps = {
    className: cn(base, styles, className),
    'aria-label': ariaLabel,
  } as const;

  if (isLinkProps(props)) {
    const { to, onClick } = props;
    return (
      <Link to={to} onClick={onClick} {...sharedProps}>
        {content}
      </Link>
    );
  }

  if (isAnchorProps(props)) {
    const { href, onClick, target, rel: relProp } = props;
    const rel = target === '_blank' ? relProp ?? 'noopener noreferrer' : relProp;
    return (
      <a href={href} onClick={onClick} target={target} rel={rel} {...sharedProps}>
        {content}
      </a>
    );
  }

  const { type = 'button', disabled, onClick } = props;
  return (
    <button type={type} disabled={disabled} onClick={onClick} {...sharedProps}>
      {content}
    </button>
  );
}
