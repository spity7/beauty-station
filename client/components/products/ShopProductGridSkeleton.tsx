type ShopProductGridSkeletonProps = {
  columnClass: string;
  count: number;
  hasCardBorder?: boolean;
};

function ShopProductCardSkeleton() {
  return (
    <div className="rbt-shop-product-skeleton-card">
      <div className="rbt-shop-product-skeleton-block rbt-shop-product-skeleton-image" />
      <div className="rbt-shop-product-skeleton-block rbt-shop-product-skeleton-line rbt-shop-product-skeleton-line-sm" />
      <div className="rbt-shop-product-skeleton-block rbt-shop-product-skeleton-line" />
      <div className="rbt-shop-product-skeleton-block rbt-shop-product-skeleton-line rbt-shop-product-skeleton-line-md" />
      <div className="rbt-shop-product-skeleton-block rbt-shop-product-skeleton-btn" />
    </div>
  );
}

export default function ShopProductGridSkeleton({
  columnClass,
  count,
  hasCardBorder = false,
}: ShopProductGridSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`shop-skeleton-${index}`}
          className={
            columnClass +
            (hasCardBorder ? " rbt-border mt--0" : " mt--24")
          }
          style={
            hasCardBorder
              ? { marginTop: "-1px", marginLeft: "-1px" }
              : undefined
          }
        >
          <ShopProductCardSkeleton />
        </div>
      ))}
    </>
  );
}
