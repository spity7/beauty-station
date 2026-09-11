import Image from "next/image";
import Link from "next/link";
import { megaMenuCategories, type MegaMenuCategory } from "@/data/megaMenu";
import { CATEGORIES_PAGE_PATH } from "@/lib/category-paths";
import MegaMenuFlameIcon from "./MegaMenuFlameIcon";

// ─── Sub-components ────────────────────────────────────────────────────────────

/** A single list item in the sidebar parent list (no mega-panel) */
function SimpleListItem({ cat }: { cat: MegaMenuCategory }) {
  return (
    <li className="dropdown-parent-list">
      <Link href={cat.href}>
        <span>
          <i className={cat.icon} />
        </span>
        {cat.label}
      </Link>
    </li>
  );
}

/** A sidebar list item that opens a full mega-panel on hover */
function MegaPanelItem({
  cat,
  index,
  childWrapperAlign,
}: {
  cat: MegaMenuCategory;
  index: number;
  childWrapperAlign?: string;
}) {
  return (
    <li className="dropdown-parent-list">
      <Link href={cat.href}>
        <span>
          <i className={cat.icon} />
        </span>
        {cat.label}
        <span className="rbt-chevron-right">
          <i className="fa-regular fa-chevron-right" />
        </span>
      </Link>
      <div
        className={`rbt-dropdown-child-wrapper rbt-dropdown-child-wrapper-lg${
          childWrapperAlign ? ` ${childWrapperAlign}` : ""
        }`}
      >
        <div className="rbt-child-inner">
          {/* category mega menu */}
          <div className="rbt-megamenu grid-item-2">
            <div className="rbt-megamenu-wrapper">
              <div className="row row--16">
                {/* Left: two link columns */}
                <div className="col-lg-6 col-xl-7 col-xxl-7">
                  <div className="row row--16">
                    {cat.columns?.map((col, ci) => (
                      <div
                        key={ci}
                        className={`col-lg-6 col-xl-6 col-xxl-6 single-mega-item rbt-scroll-trigger fade_in animation-order-${ci + 1}`}
                      >
                        <h6 className="rbt-short-title">{col.title}</h6>
                        <ul className="mega-menu-item">
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link href={link.href}>{link.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Flame shipping tag */}
                    <div className="col-lg-12">
                      <div className="rbt-quick-info-tag d-flex mt--16">
                        <MegaMenuFlameIcon id={`mega-flame-${index}`} />
                        <p>
                          <strong className="mr--4">
                            Free Express Shipping
                          </strong>
                          on orders $200!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: promotional banner card */}
                {cat.banner && (
                  <div className="col-lg-6 col-xl-5 col-xxl-5 single-mega-item rbt-scroll-trigger fade_in animation-order-1">
                    <div
                      className={cat.banner.cardClass ?? "rbt-menu-offer-card"}
                    >
                      <div className="mega-top-banner">
                        <div className="rbt-banner-inner flex-column justify-content-center rbt-gap--8 align-items-center text-center">
                          <div className="rbt-banner-content">
                            <h5 className={cat.banner.titleClass ?? "title"}>
                              {cat.banner.title}
                            </h5>
                            {cat.banner.desc && (
                              <p className={cat.banner.descClass ?? "b3 desc"}>
                                {cat.banner.desc}
                              </p>
                            )}
                          </div>
                          <Link
                            className={
                              cat.banner.btnClass ??
                              "rbt-btn rbt-btn-sm rbt-btn-black"
                            }
                            href={cat.banner.btnHref}
                          >
                            {cat.banner.btnLabel}
                          </Link>
                          <Link
                            href={cat.banner.btnHref}
                            className="product-img position-bottom mt--24"
                          >
                            <Image
                              alt="Ecommerce Product"
                              src={cat.banner.imgSrc}
                              width={cat.banner.imgWidth}
                              height={cat.banner.imgHeight}
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* end category mega menu */}
        </div>
      </div>
    </li>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────

interface MegaMenuDropdownProps {
  /** Extra CSS class for the child-wrapper div (e.g. left-align variant) */
  childWrapperAlign?: string;
}

/**
 * The full "All Categories" dropdown list rendered inside every large header.
 * Previously this was copy-pasted inline in Header4/8/9/9Transparent/17/20/22.
 */
export default function MegaMenuDropdown({
  childWrapperAlign,
}: MegaMenuDropdownProps) {
  return (
    <div className="rbt-update-category-dropdown">
      <div className="inner">
        <ul className="rbt-dropdown-parent-wrapper">
          {megaMenuCategories.map((cat, i) =>
            cat.hasMegaPanel ? (
              <MegaPanelItem
                key={cat.label}
                cat={cat}
                index={i}
                childWrapperAlign={childWrapperAlign}
              />
            ) : (
              <SimpleListItem key={cat.label} cat={cat} />
            )
          )}
          <li className="dropdown-parent-list">
            <Link href={CATEGORIES_PAGE_PATH}>
              View All Categories
              <i className="fa-regular fa-chevron-right ml--8" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
