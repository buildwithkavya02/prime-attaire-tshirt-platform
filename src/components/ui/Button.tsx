import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

interface BaseProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg" | "sm";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  to?: undefined;
}

interface ButtonAsLink extends BaseProps {
  to: string;
  onClick?: () => void;
}

type Props = ButtonAsButton | ButtonAsLink;

const sizeMap = {
  sm: "px-5 py-2.5 text-xs",
  md: "px-7 py-3.5 text-sm",
  lg: "px-9 py-4 text-base",
};

const variantMap = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "text-ink hover:text-gold transition-colors duration-300",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  children,
  className = "",
  to,
  ...rest
}: Props) {
  const classes = `${variantMap[variant]} ${
    variant !== "ghost" ? sizeMap[size] : ""
  } group ${className}`.trim();

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="transition-transform duration-300 group-hover:translate-x-1">{icon}</span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={(rest as ButtonAsLink).onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
