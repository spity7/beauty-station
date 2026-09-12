"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buildShopCatalogHref, createShopCatalogQuery } from "@/lib/shop-query";

type StorefrontProductSearchFormProps = {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onSubmitted?: () => void;
};

export default function StorefrontProductSearchForm({
  className = "rbt-search-form",
  inputClassName = "search-input",
  placeholder = "What Are You Looking For?",
  onSubmitted,
}: StorefrontProductSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();
    router.push(
      buildShopCatalogHref(
        createShopCatalogQuery({
          page: 1,
          search: search || undefined,
        })
      )
    );
    onSubmitted?.();
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="input-section position-relative w-100 mr--12 mr_sm--4">
        <input
          aria-label="Search products"
          className={inputClassName}
          placeholder={placeholder}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          aria-label="Search"
          className="rbt-round-btn search-btn"
          type="submit"
        >
          <i className="fa-solid fa-magnifying-glass" />
        </button>
      </div>
    </form>
  );
}
