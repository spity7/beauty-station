"use client";

import NavEffectTabs from "@/components/common/ui/NavEffectTabs";
import type { ShopCatalogPagination } from "@/types/shop-catalog";
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopServerPagination({
  page,
  limit,
  total,
  onPageChange,
}: ShopCatalogPagination & {
  onPageChange?: (page: number) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (nextPage: number) => {
    if (onPageChange) {
      onPageChange(nextPage);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const options = pages.map((pageNumber) => ({
    id: String(pageNumber),
    label: String(pageNumber),
  }));

  return (
    <nav className="rbt-nav-effect-activation text-center">
      <NavEffectTabs
        active={String(page)}
        endAdornment={
          <a
            aria-label="Next"
            className="transp-link b3"
            href="#!"
            onClick={(event) => {
              event.preventDefault();
              if (page < totalPages) {
                goToPage(page + 1);
              }
            }}
          >
            <i className="fa-regular fa-chevron-right" />
          </a>
        }
        groupClassName="rbt-pagination"
        highlightClassName="rbt-bg-highlight rbt-pagination-bg-highlight"
        itemClassName=""
        options={options}
        parentClassName="text-center d-flex align-items-center justify-content-center rbt-gap--8"
        setActive={(id) => goToPage(Number(id))}
        startAdornment={
          <a
            aria-label="Previous"
            className="transp-link b3"
            href="#!"
            onClick={(event) => {
              event.preventDefault();
              if (page > 1) {
                goToPage(page - 1);
              }
            }}
          >
            <i className="fa-regular fa-chevron-left" />
          </a>
        }
      />
    </nav>
  );
}
