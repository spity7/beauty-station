import Link from "next/link";

type StorefrontCatalogEmptyStateProps = {
  message: string;
  className?: string;
  shopHref?: string;
  shopLabel?: string;
};

export function StorefrontCatalogEmptyState({
  message,
  className = "mb--0 text-center rbt-text-color-body",
  shopHref = "/shop",
  shopLabel = "Browse the shop",
}: StorefrontCatalogEmptyStateProps) {
  return (
    <p className={className}>
      {message}{" "}
      <Link className="rbt-btn-link" href={shopHref}>
        {shopLabel}
      </Link>
      .
    </p>
  );
}
