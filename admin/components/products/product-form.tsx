"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SelectField } from "@/components/forms/admin-form-primitives";
import { Icon } from "@/components/layout/icon";
import { AppSelect } from "@/components/ui/app-select";
import { routes } from "@/config/routes";
import { baseURL, cn } from "@/utils/cn";

type ProductFormMode = "add" | "edit";
type ProductTab = "advanced" | "general" | "reviews" | "seo";
type DiscountType = "fixed" | "none" | "percentage";
type ProductStatus = "archived" | "draft" | "published";
type Variation = {
  attribute: string;
  id: string;
  value: string;
};

type ProductFormProps = {
  description: string;
  formId: string;
  mode: ProductFormMode;
  subtitle: string;
  title: string;
};

const tabLabels: Record<ProductTab, string> = {
  advanced: "Advanced",
  general: "General",
  reviews: "Reviews",
  seo: "SEO",
};

export function ProductForm({
  description,
  formId,
  mode,
  subtitle,
  title,
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<ProductTab>("general");
  const [discountType, setDiscountType] = useState<DiscountType>(
    mode === "edit" ? "percentage" : "none"
  );
  const [discountPercent, setDiscountPercent] = useState(10);
  const [status, setStatus] = useState<ProductStatus>(
    mode === "edit" ? "published" : "draft"
  );
  const [thumbPreview, setThumbPreview] = useState(
    mode === "edit"
      ? `${baseURL}assets/images/catagory-img/cat-img-shoe-a-01.webp`
      : ""
  );
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [variations, setVariations] = useState<Variation[]>([
    { attribute: "", id: "variation-1", value: "" },
  ]);
  const [guideOpen, setGuideOpen] = useState(false);

  const tabs: ProductTab[] =
    mode === "edit"
      ? ["general", "advanced", "reviews"]
      : ["general", "advanced", "seo"];

  const statusHelp = useMemo(() => {
    switch (status) {
      case "published":
        return "Published products appear in storefront shop and product pages.";
      case "archived":
        return "Archived products are kept for reference but hidden from storefront views.";
      default:
        return "Draft products are hidden from published storefront views.";
    }
  }, [status]);

  const statusOptions = useMemo(
    () => [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      ...(mode === "edit"
        ? [{ label: "Archived", value: "archived" as const }]
        : []),
    ],
    [mode]
  );

  function updateFiles(files: FileList | null, target: "media" | "thumb") {
    if (!files?.length) {
      return;
    }

    if (target === "thumb") {
      setThumbPreview(URL.createObjectURL(files[0]));
      return;
    }

    setMediaPreviews((current) => [
      ...current,
      ...Array.from(files).map((file) => URL.createObjectURL(file)),
    ]);
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 max-w-full">
          <nav className="mb-1 flex items-center gap-1.5 text-[13px] text-ink-400">
            <Link className="hover:text-brand-600" href={routes.dashboard}>
              Home
            </Link>
            <Icon className="h-3.5 w-3.5" name="chevron-right" />
            <Link className="hover:text-brand-600" href={routes.products}>
              Products
            </Link>
            <Icon className="h-3.5 w-3.5" name="chevron-right" />
            <span className="text-ink-700">{subtitle}</span>
          </nav>
          <h1 className="text-[22px] font-semibold text-ink-900">{title}</h1>
          <p className="mt-1 break-words text-[14px] text-ink-500">
            {description}
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-base border border-surface-line px-4 text-[13px] font-semibold text-ink-700 hover:bg-surface-muted cursor-pointer"
          onClick={() => setGuideOpen(true)}
          type="button"
        >
          <Icon className="h-4 w-4" name="panel-left" />
          Form Guide
        </button>
      </div>

      <form
        className="grid min-w-0 max-w-full gap-4 xl:grid-cols-[280px_minmax(0,1fr)]"
        id={formId}
      >
        <div className="min-w-0 space-y-4 xl:order-2">
          <div
            aria-label="Product form tabs"
            className="flex border-b border-surface-line"
            role="tablist"
          >
            {tabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  aria-selected={active}
                  className={cn(
                    "relative -mb-px border-b-2 px-4 pb-3 pt-1 text-[14px] font-semibold transition-colors",
                    active
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-ink-500 hover:text-ink-700"
                  )}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  type="button"
                >
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>

          {activeTab === "general" ? (
            <div className="space-y-4">
              <Card title="General">
                <div className="space-y-4">
                  <Field
                    defaultValue={
                      mode === "edit" ? "Sample product" : undefined
                    }
                    help="A product name is required and recommended to be unique."
                    label="Product Name"
                    name="name"
                    placeholder="Product name"
                    required
                  />
                  <RichTextArea
                    help="Set a description to the product for better visibility."
                    label="Description"
                    name="description"
                    rows={3}
                  />
                </div>
              </Card>

              {mode === "add" ? <StorefrontDisplay /> : null}

              <Card title="Media">
                <label className="flex cursor-pointer flex-col gap-3 rounded-base border-2 border-dashed border-brand-300 bg-brand-50/40 px-5 py-5 transition-colors hover:bg-brand-50 sm:flex-row sm:items-center sm:text-left">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-base bg-brand-100 text-brand-600">
                    <Icon className="h-5 w-5" name="upload" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-ink-900">
                      Drop files here or click to upload.
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-400">
                      Upload up to 10 files
                    </span>
                  </span>
                  <input
                    accept="image/*"
                    aria-label="Upload product media"
                    className="sr-only"
                    multiple
                    onChange={(event) =>
                      updateFiles(event.target.files, "media")
                    }
                    type="file"
                  />
                </label>
                <p className="mt-2 text-[12px] text-ink-400">
                  Set the product media gallery.
                </p>
                {mediaPreviews.length ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {mediaPreviews.map((preview) => (
                      <div
                        className="relative h-20 w-20 overflow-hidden rounded-base border border-surface-line bg-surface-body"
                        key={preview}
                      >
                        <div
                          aria-hidden="true"
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${preview})` }}
                        />
                        <button
                          aria-label="Remove media"
                          className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-ink-900/60 text-white hover:bg-danger-500"
                          onClick={() =>
                            setMediaPreviews((current) =>
                              current.filter((item) => item !== preview)
                            )
                          }
                          type="button"
                        >
                          <Icon className="h-3 w-3" name="x" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Card>

              <Card title="Pricing">
                <div className="space-y-4">
                  <Field
                    defaultValue={mode === "edit" ? "199.99" : undefined}
                    help="Set the product price."
                    label="Base Price"
                    name="price"
                    placeholder="Product price"
                    required
                    type="number"
                  />
                  <div>
                    <span className="text-[13px] font-semibold text-ink-700">
                      Discount Type
                    </span>
                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                      {[
                        ["none", "No Discount"],
                        ["percentage", "Percentage %"],
                        ["fixed", "Fixed Price"],
                      ].map(([value, label]) => {
                        const active = discountType === value;
                        return (
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-base border px-4 py-3",
                              active
                                ? "border-brand-600 bg-brand-50/60"
                                : "border-surface-line hover:bg-surface-muted"
                            )}
                            key={value}
                          >
                            <input
                              checked={active}
                              className="h-4 w-4 border-surface-line text-brand-600 focus:ring-brand-600"
                              name="discount_type"
                              onChange={() =>
                                setDiscountType(value as DiscountType)
                              }
                              type="radio"
                              value={value}
                            />
                            <span className="text-[14px] font-semibold text-ink-900">
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {discountType !== "none" ? (
                    <div>
                      <div className="block">
                        <span className="text-[13px] font-semibold text-ink-700">
                          {discountType === "percentage"
                            ? mode === "edit"
                              ? "Set Discount Percentage"
                              : "Discount Percentage (%)"
                            : "Fixed Discount Price ($)"}
                        </span>
                        {mode === "edit" && discountType === "percentage" ? (
                          <>
                            <input
                              name="discount_value"
                              type="hidden"
                              value={discountPercent}
                            />
                            <div className="mt-5 text-center text-[38px] font-semibold text-ink-900">
                              {discountPercent}
                              <span className="align-super text-[14px]">%</span>
                            </div>
                            <input
                              className="mt-5 h-1 w-full accent-brand-600"
                              max="80"
                              min="0"
                              name="discount_percentage"
                              onChange={(event) =>
                                setDiscountPercent(Number(event.target.value))
                              }
                              type="range"
                              value={discountPercent}
                            />
                            <p className="mt-3 text-[12px] text-ink-400">
                              Set a percentage discount to be applied on this
                              product.
                            </p>
                          </>
                        ) : (
                          <input
                            aria-label="Discount value"
                            className="mt-1.5 h-10 w-full max-w-xs rounded-base border border-surface-line bg-surface-body px-3 text-[14px] focus:border-brand-600"
                            min="0"
                            name="discount_value"
                            placeholder="0"
                            step="0.01"
                            type="number"
                          />
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      defaultValue={
                        mode === "edit" ? "Taxable Goods" : undefined
                      }
                      help="Set the product tax class."
                      label="Tax Class"
                      name="tax_class"
                      options={[
                        mode === "edit" ? "Taxable Goods" : "Standard Rate",
                        "Zero Rate",
                        "Reduced Rate",
                      ]}
                      required
                    />
                    <Field
                      defaultValue={mode === "edit" ? "35" : undefined}
                      help="Set the product VAT amount."
                      label="VAT Amount (%)"
                      name="vat"
                      placeholder="0"
                      type="number"
                    />
                  </div>
                </div>
              </Card>

              {mode === "add" ? <OptionsBuyBox /> : null}
            </div>
          ) : null}

          {activeTab === "advanced" ? (
            <div className="space-y-4">
              <InventorySection />
              <Card title="Variations">
                <p className="mb-4 text-[13px] font-semibold text-ink-700">
                  Add Product Variations
                </p>
                <div className="space-y-3">
                  {variations.map((variation, index) => (
                    <div className="flex items-center gap-2" key={variation.id}>
                      <AppSelect
                        className="flex-1"
                        onValueChange={(attribute) =>
                          setVariations((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, attribute }
                                : item
                            )
                          )
                        }
                        options={["Color", "Size", "Material", "Weight"]}
                        placeholder="Select a variation"
                        value={variation.attribute || undefined}
                      />
                      <input
                        className="h-10 flex-1 rounded-base border border-surface-line bg-surface-body px-3 text-[14px] focus:border-brand-600"
                        onChange={(event) =>
                          setVariations((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, value: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="Variation"
                        type="text"
                        value={variation.value}
                      />
                      <button
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-base border border-danger-100 bg-danger-50 text-danger-500 hover:bg-danger-100"
                        onClick={() =>
                          setVariations((current) =>
                            current.length > 1
                              ? current.filter(
                                  (_, itemIndex) => itemIndex !== index
                                )
                              : current
                          )
                        }
                        type="button"
                      >
                        <Icon className="h-4 w-4" name="x" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-base border border-surface-line px-4 text-[13px] font-semibold text-ink-700 hover:bg-surface-muted cursor-pointer"
                  onClick={() =>
                    setVariations((current) => [
                      ...current,
                      {
                        attribute: "",
                        id: `variation-${Date.now()}`,
                        value: "",
                      },
                    ])
                  }
                  type="button"
                >
                  <Icon className="h-4 w-4" name="plus" />
                  Add variation
                </button>
              </Card>
              <ShippingSection />
              <ProductDetailsAdvanced />
            </div>
          ) : null}

          {activeTab === "seo" ? (
            <div className="space-y-4">
              <Card title="Meta Options">
                <div className="space-y-4">
                  <Field
                    help="Set a meta tag title. Recommended to be simple and precise keywords."
                    label="Meta Tag Title"
                    name="meta_title"
                    placeholder="Meta tag name"
                  />
                  <RichTextArea
                    help="Set a meta tag description to the product for increased SEO ranking."
                    label="Meta Tag Description"
                    name="meta_desc"
                    rows={3}
                  />
                  <Field
                    help="Set a list of keywords the product is related to. Separate keywords with a comma."
                    label="Meta Tag Keywords"
                    name="meta_keywords"
                    placeholder="e.g. shoes, clothing, apparel"
                  />
                </div>
              </Card>
            </div>
          ) : null}

          {activeTab === "reviews" ? <ReviewsPanel /> : null}
        </div>

        <div className="min-w-0 space-y-4 xl:order-1">
          <Card title="Thumbnail" titleTag="h3">
            <div className="flex flex-col items-center text-center">
              <label className="group relative grid h-36 w-36 cursor-pointer place-items-center overflow-hidden rounded-base bg-surface-card shadow-soft transition-shadow hover:shadow-lift">
                <span className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-surface-card text-ink-400 shadow-card transition-colors group-hover:text-brand-600">
                  <Icon className="h-3.5 w-3.5" name="pencil" />
                </span>
                {thumbPreview ? (
                  <Image
                    alt="Thumbnail preview"
                    className="absolute inset-0 h-full w-full object-cover p-2"
                    height={144}
                    src={thumbPreview}
                    width={144}
                  />
                ) : (
                  <span className="grid h-20 w-20 -rotate-6 place-items-center rounded-base bg-brand-50 text-brand-200">
                    <Icon
                      className="h-10 w-10 transition-colors group-hover:text-brand-400"
                      name="image"
                    />
                  </span>
                )}
                <input
                  accept=".png,.jpg,.jpeg"
                  aria-label="Upload thumbnail image"
                  className="sr-only"
                  onChange={(event) => updateFiles(event.target.files, "thumb")}
                  type="file"
                />
              </label>
              <p className="mt-4 text-[12px] text-ink-400">
                Set the product thumbnail image. Only *.png, *.jpg and *.jpeg
                image files are accepted.
              </p>
            </div>
          </Card>

          <Card
            title="Status"
            titleEnd={
              <span
                aria-label={`Current status: ${status}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  status === "published"
                    ? "bg-success-500"
                    : status === "draft"
                      ? "bg-warning-500"
                      : "bg-ink-300"
                )}
                role="status"
              />
            }
            titleTag="h3"
          >
            <AppSelect
              name="status"
              onValueChange={(value) => setStatus(value as ProductStatus)}
              options={statusOptions}
              value={status}
            />
            <p className="mt-2 text-[12px] text-ink-400">{statusHelp}</p>
          </Card>

          <Card title="Product Details" titleTag="h3">
            <div className="space-y-4">
              <SelectField
                help="Add product to a category."
                label="Categories"
                name="category"
                options={[
                  "Electronics",
                  "Grocery",
                  "Bakery",
                  "Drinks",
                  "Snacks",
                  "Dairy",
                ]}
              />
              <button
                className="inline-flex h-9 items-center gap-1.5 rounded-base bg-brand-50 px-3 text-[13px]! font-semibold! text-brand-600 hover:bg-brand-100 hover:text-brand-700"
                type="button"
              >
                <Icon className="h-3.5 w-3.5" name="plus" />
                Create new category
              </button>
              {mode === "edit" ? (
                <div>
                  <span className="mb-2 block text-[13px] font-semibold text-ink-700">
                    Tags
                  </span>
                  <div className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-base border border-surface-line bg-surface-body px-3 py-2 text-[13px]">
                    {["new", "trending", "sale"].map((tag) => (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-ink-600"
                        key={tag}
                      >
                        {tag} <Icon className="h-3 w-3" name="x" />
                      </span>
                    ))}
                    <input
                      name="tags"
                      type="hidden"
                      value="new,trending,sale"
                    />
                  </div>
                  <p className="mt-1 text-[12px] text-ink-400">
                    Add tags to a product.
                  </p>
                </div>
              ) : (
                <Field
                  help="Add tags to a product."
                  label="Tags"
                  name="tags"
                  placeholder="Add tags..."
                />
              )}
            </div>
          </Card>

          {mode === "edit" ? <SalesSummary /> : <WeeklySales />}

          <Card title="Product Template" titleTag="h3">
            <SelectField
              help="Assign a template from your current theme to define how a single product is displayed."
              label="Select a product template"
              name="template"
              options={[
                "Default template",
                "Featured template",
                "Compact template",
              ]}
            />
          </Card>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-line pt-5">
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-base border border-surface-line px-5 text-[14px] font-semibold text-ink-700 hover:bg-surface-muted"
          href={routes.products}
        >
          Cancel
        </Link>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-base bg-brand-600 px-5 text-[14px] font-semibold text-white hover:bg-brand-700"
          form={formId}
          type="submit"
        >
          <Icon className="h-4 w-4" name="save" />
          Save Changes
        </button>
      </div>

      {guideOpen ? (
        <FormGuideDrawer onClose={() => setGuideOpen(false)} />
      ) : null}
    </>
  );
}

type CardProps = {
  children: React.ReactNode;
  title: string;
  titleEnd?: React.ReactNode;
  titleTag?: "h2" | "h3";
};

function Card({ children, title, titleEnd, titleTag = "h2" }: CardProps) {
  const Title = titleTag;

  return (
    <article className="rounded-card border border-surface-line bg-surface-card p-5 shadow-card">
      {titleEnd ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <Title className="text-[16px] font-semibold text-ink-900">
            {title}
          </Title>
          {titleEnd}
        </div>
      ) : (
        <Title className="mb-4 text-[16px] font-semibold text-ink-900">
          {title}
        </Title>
      )}
      {children}
    </article>
  );
}

type FieldProps = {
  defaultValue?: string;
  help?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function Field({
  defaultValue,
  help,
  label,
  name,
  placeholder,
  required,
  type = "text",
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink-700">
        {label} {required ? <span className="text-danger-500">*</span> : null}
      </span>
      <input
        className="mt-1.5 h-10 w-full rounded-base border border-surface-line bg-surface-body px-3 text-[14px] placeholder:text-ink-400 focus:border-brand-600"
        defaultValue={defaultValue}
        min={type === "number" ? "0" : undefined}
        name={name}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        type={type}
      />
      {help ? <p className="mt-1 text-[12px] text-ink-400">{help}</p> : null}
    </label>
  );
}

type RichTextAreaProps = {
  help: string;
  label: string;
  name: string;
  rows: number;
};

function RichTextArea({ help, label, name, rows }: RichTextAreaProps) {
  return (
    <div>
      <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      <div className="mt-1.5 rounded-base border border-surface-line bg-surface-body">
        <div className="flex flex-wrap items-center gap-1 border-b border-surface-line px-3 py-2">
          <AppSelect
            className="w-[132px]"
            defaultValue="Normal"
            options={["Normal", "Heading 1", "Heading 2"]}
            size="sm"
          />
          <div className="mx-1 h-5 w-px bg-surface-line" />
          {["B", "I", "U"].map((item) => (
            <button
              className={cn(
                "rounded px-2 py-1 text-[13px] text-ink-600 hover:bg-surface-muted",
                item === "B" ? "font-bold" : "",
                item === "I" ? "italic" : "",
                item === "U" ? "underline" : ""
              )}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-surface-line" />
          <button
            aria-label="Insert image"
            className="rounded px-2 py-1 hover:bg-surface-muted"
            type="button"
          >
            <Icon className="h-3.5 w-3.5 text-ink-600" name="image" />
          </button>
          <button
            aria-label="Insert code snippet"
            className="rounded px-2 py-1 hover:bg-surface-muted"
            type="button"
          >
            <Icon className="h-3.5 w-3.5 text-ink-600" name="code" />
          </button>
        </div>
        <textarea
          className="min-h-[132px] w-full resize-y bg-transparent px-3 py-3 text-[14px] text-ink-700 placeholder:text-ink-400 focus:outline-none"
          name={name}
          placeholder="Type your text here..."
          rows={rows}
        />
      </div>
      <p className="mt-1 text-[12px] text-ink-400">{help}</p>
    </div>
  );
}

function StorefrontDisplay() {
  return (
    <Card title="Storefront Display">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          help="Shown near the product title and filters."
          label="Brand Name"
          name="brand_name"
          placeholder="e.g. Beats"
        />
        <Field
          help="Separate multiple storefront badges with commas."
          label="Product Badges"
          name="product_badges"
          placeholder="New, Hot, Sale"
        />
        <Field
          help="Optional rating value for preview/demo storefronts."
          label="Average Rating"
          name="average_rating"
          placeholder="4.8"
          type="number"
        />
        <Field
          help="Used for the review summary beside the stars."
          label="Review Count"
          name="review_count"
          placeholder="52"
          type="number"
        />
        <TextAreaField
          className="md:col-span-2"
          help="A compact intro for the upper product detail area."
          label="Short Summary"
          name="short_summary"
          placeholder="Wireless earbuds with active noise cancellation, long battery life, and fast charging."
        />
        <TextAreaField
          className="md:col-span-2"
          help="Separate product highlight chips or bullets with semicolons."
          label="Key Highlights"
          name="key_highlights"
          placeholder="Bluetooth 5.3; Noise cancellation; Fast charging; Water resistant"
        />
      </div>
    </Card>
  );
}

function OptionsBuyBox() {
  return (
    <Card title="Options & Buy Box">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          help="Use name:hex pairs for color selectors."
          label="Color Swatches"
          name="color_swatches"
          placeholder="Black:#111111, White:#ffffff, Pink:#f8c7d8"
        />
        <Field
          help="Shown as option buttons in the buy box."
          label="Style Options"
          name="style_options"
          placeholder="Basic, Premium, Wireless"
        />
        <TextAreaField
          className="md:col-span-2"
          help="Short storefront message near shipping and returns."
          label="Shipping Message"
          name="shipping_message"
          placeholder="Free returns; Secure payment; Authentic guarantee; Warranty included"
        />
      </div>
    </Card>
  );
}

type TextAreaFieldProps = {
  className?: string;
  help: string;
  label: string;
  name: string;
  placeholder: string;
};

function TextAreaField({
  className,
  help,
  label,
  name,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      <textarea
        className="mt-1.5 min-h-[92px] w-full resize-y rounded-base border border-surface-line bg-surface-body px-3 py-3 text-[14px] focus:border-brand-600"
        name={name}
        placeholder={placeholder}
        rows={3}
      />
      <p className="mt-1 text-[12px] text-ink-400">{help}</p>
    </label>
  );
}

function InventorySection() {
  return (
    <Card title="Inventory">
      <div className="space-y-4">
        <Field
          help="Enter the product SKU."
          label="SKU"
          name="sku"
          placeholder="SKU Number"
          required
        />
        <Field
          help="Enter the product barcode number."
          label="Barcode"
          name="barcode"
          placeholder="Barcode Number"
          required
        />
        <div>
          <span className="text-[13px] font-semibold text-ink-700">
            Quantity <span className="text-danger-500">*</span>
          </span>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            <input
              className="h-10 rounded-base border border-surface-line bg-surface-body px-3 text-[14px] focus:border-brand-600"
              min="0"
              name="qty_shelf"
              placeholder="On shelf"
              type="number"
            />
            <input
              className="h-10 rounded-base border border-surface-line bg-surface-body px-3 text-[14px] focus:border-brand-600"
              min="0"
              name="qty_warehouse"
              placeholder="In warehouse"
              type="number"
            />
          </div>
          <p className="mt-1 text-[12px] text-ink-400">
            Enter the product quantity.
          </p>
        </div>
        <div>
          <span className="mb-2 block text-[13px] font-semibold text-ink-700">
            Allow Backorders
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              className="h-4 w-4 rounded border-surface-line text-brand-600 focus:ring-brand-600"
              name="backorders"
              type="checkbox"
            />
            <span className="text-[14px] text-ink-700">Yes</span>
          </label>
          <p className="mt-1 text-[12px] text-ink-400">
            Allow customers to purchase products that are out of stock.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ShippingSection() {
  return (
    <Card title="Shipping">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Weight"
          name="weight"
          placeholder="0.00"
          type="number"
          help="Used for shipping calculations."
        />
        <Field
          label="Width"
          name="width"
          placeholder="0.00"
          type="number"
          help="Package width."
        />
        <Field
          label="Height"
          name="height"
          placeholder="0.00"
          type="number"
          help="Package height."
        />
        <Field
          label="Length"
          name="length"
          placeholder="0.00"
          type="number"
          help="Package length."
        />
      </div>
    </Card>
  );
}

function ProductDetailsAdvanced() {
  return (
    <Card title="Product Specifications">
      <div className="space-y-4">
        <TextAreaField
          help="Use semicolon-separated pairs for storefront specification rows."
          label="Specification Details"
          name="specifications"
          placeholder="Brand: Beats; Model: Studio Buds; Material: Plastic; Warranty: 1 year"
        />
        <TextAreaField
          help="Video links for the review videos section."
          label="Review Video URLs"
          name="review_videos"
          placeholder="https://example.com/video"
        />
      </div>
    </Card>
  );
}

function ReviewsPanel() {
  return (
    <div className="space-y-4">
      <Card title="Review Overview">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Reviews", "124", "text-ink-900"],
            ["Approved", "118", "text-success-600"],
            ["Pending", "6", "text-warning-600"],
          ].map(([label, value, valueClass]) => (
            <div
              className="rounded-base border border-surface-line bg-surface-body p-4"
              key={label}
            >
              <p className="text-[13px] text-ink-400">{label}</p>
              <p className={cn("mt-2 text-[22px] font-semibold", valueClass)}>
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="dashboard-scrollbar mt-6 overflow-x-auto rounded-base border border-surface-line">
          <table className="w-full min-w-[680px] text-left text-[14px]">
            <thead className="border-b border-surface-line bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-[13px] font-semibold text-ink-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold text-ink-500">
                  Rating
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold text-ink-500">
                  Review
                </th>
                <th className="px-4 py-3 text-right text-[13px] font-semibold text-ink-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              <tr>
                <td className="px-4 py-3 font-semibold text-ink-900">
                  Sarah M.
                </td>
                <td className="px-4 py-3 text-warning-500">5/5</td>
                <td className="px-4 py-3 text-ink-600">
                  Great fit and clean finish.
                </td>
                <td className="px-4 py-3 text-right text-success-600">
                  Approved
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-ink-900">
                  Mizan R.
                </td>
                <td className="px-4 py-3 text-warning-500">4/5</td>
                <td className="px-4 py-3 text-ink-600">
                  Looks good, delivery was quick.
                </td>
                <td className="px-4 py-3 text-right text-warning-600">
                  Pending
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function WeeklySales() {
  return (
    <Card title="Weekly Sales" titleTag="h3">
      <p className="text-[13px] text-ink-400">
        No data available. Sales data will begin capturing once product has been
        published.
      </p>
    </Card>
  );
}

function SalesSummary() {
  return (
    <Card title="Average Daily Sales" titleTag="h3">
      <div className="flex items-start gap-2">
        <span className="pt-1 text-[13px] font-semibold text-ink-500">$</span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[30px] font-semibold leading-none text-ink-900">
              2,420
            </p>
            <span className="rounded-full bg-success-50 px-2 py-0.5 text-[12px] font-semibold text-success-600">
              +2.6%
            </span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-ink-400">
            Average Daily Sales
          </p>
        </div>
      </div>
      <div className="mt-6 flex h-14 items-end justify-between gap-2">
        {[
          { height: 2, id: "mon" },
          { height: 7, id: "tue" },
          { height: 6, id: "wed" },
          { height: 5, id: "thu" },
          { height: 7, id: "fri" },
          { height: 10, id: "sat" },
          { height: 6, id: "sun" },
        ].map((bar) => (
          <span
            className="w-3 rounded-full bg-brand-500"
            key={bar.id}
            style={{ height: `${bar.height * 0.25}rem` }}
          />
        ))}
      </div>
    </Card>
  );
}

type FormGuideDrawerProps = {
  onClose: () => void;
};

function FormGuideDrawer({ onClose }: FormGuideDrawerProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
    >
      <button
        aria-label="Close form guide"
        className="absolute inset-0 bg-ink-900/45"
        onClick={onClose}
        type="button"
      />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col bg-surface-card shadow-lift">
        <div className="flex items-start justify-between gap-4 border-b border-surface-line px-5 py-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-600">
              Form Guide
            </p>
            <h2 className="mt-1 text-[18px] font-semibold text-ink-900">
              Compact editing checklist
            </h2>
            <p className="mt-1 text-[13px] text-ink-500">
              Use the tabs to finish only the section you are working on.
            </p>
          </div>
          <button
            aria-label="Close form guide"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-base border border-surface-line text-ink-500 hover:bg-surface-muted hover:text-ink-900"
            onClick={onClose}
            type="button"
          >
            <Icon className="h-4 w-4" name="x" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            <section className="rounded-base border border-surface-line p-4">
              <h3 className="text-[14px] font-semibold text-ink-900">
                Before publishing
              </h3>
              <ul className="mt-3 space-y-2 text-[13px] text-ink-500">
                {[
                  "Required name, code, price, or status fields are filled.",
                  "Images and preview cards match the final storefront content.",
                  "SEO, rules, and schedule tabs are reviewed before saving.",
                ].map((item) => (
                  <li className="flex gap-2" key={item}>
                    <Icon
                      className="mt-0.5 h-4 w-4 text-success-500"
                      name="check"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-base border border-surface-line p-4">
              <h3 className="text-[14px] font-semibold text-ink-900">
                Fast layout tips
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-ink-500">
                The main form now groups related fields into tabs and tighter
                two-column rows. Sidebar cards keep live preview, status,
                schedule, and template controls close without taking over the
                page.
              </p>
            </section>
            <section className="rounded-base border border-surface-line p-4">
              <h3 className="text-[14px] font-semibold text-ink-900">
                Common saves
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-semibold text-ink-600">
                {[
                  "Draft first",
                  "Check preview",
                  "Review rules",
                  "Save changes",
                ].map((item) => (
                  <span
                    className="rounded-base bg-surface-muted px-3 py-2"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
