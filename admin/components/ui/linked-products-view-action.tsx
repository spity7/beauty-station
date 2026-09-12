import Link from "next/link";
import { Icon } from "@/components/layout/icon";
import { cn } from "@/utils/cn";

function formatLinkedProductCount(count: number): string {
  if (count > 99) {
    return "99+";
  }
  return String(count);
}

function linkedProductsAriaLabel(count: number): string {
  if (count <= 0) {
    return "View linked products";
  }
  return `View ${count} linked product${count === 1 ? "" : "s"}`;
}

type LinkedProductsViewActionProps = {
  count: number;
  disabled?: boolean;
  href: string;
};

export function LinkedProductsViewAction({
  count,
  disabled = false,
  href,
}: LinkedProductsViewActionProps) {
  const label = linkedProductsAriaLabel(count);
  const badge = formatLinkedProductCount(count);
  const className = cn(
    "icon-button relative hover:bg-brand-50 hover:text-brand-600",
    disabled && "cursor-not-allowed opacity-60"
  );

  const content = (
    <>
      <Icon className="h-4 w-4" name="eye" />
      <sup
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-0.5 -top-0 text-[12px] font-bold leading-none tabular-nums",
          count > 0 ? "text-brand-600" : "text-ink-400"
        )}
      >
        {badge}
      </sup>
    </>
  );

  if (disabled) {
    return (
      <button aria-label={label} className={className} disabled type="button">
        {content}
      </button>
    );
  }

  return (
    <Link aria-label={label} className={className} href={href} title={label}>
      {content}
    </Link>
  );
}

type StorefrontProductViewActionProps = {
  disabled?: boolean;
  href: string;
};

export function StorefrontProductViewAction({
  disabled = false,
  href,
}: StorefrontProductViewActionProps) {
  const label = "View on storefront";
  const className = cn(
    "icon-button hover:bg-brand-50 hover:text-brand-600",
    disabled && "cursor-not-allowed opacity-60"
  );

  if (disabled) {
    return (
      <button aria-label={label} className={className} disabled type="button">
        <Icon className="h-4 w-4" name="store" />
      </button>
    );
  }

  return (
    <a
      aria-label={label}
      className={className}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      title={label}
    >
      <Icon className="h-4 w-4" name="store" />
    </a>
  );
}
