export type ProductFormAttribute = {
  displayType: "Dropdown" | "Swatch" | "Text";
  inactive?: boolean;
  name: string;
  slug: string;
  values: string[];
};

export function toProductFormAttribute(attribute: {
  displayType: ProductFormAttribute["displayType"];
  name: string;
  slug: string;
  values: string[];
}): ProductFormAttribute {
  return {
    displayType: attribute.displayType,
    name: attribute.name,
    slug: attribute.slug,
    values: attribute.values,
  };
}

export function assignedProductAttributeSlugs(
  attributes: Record<string, string | string[]> | undefined
): string[] {
  if (!attributes) {
    return [];
  }

  return Object.entries(attributes)
    .filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.some((item) => String(item).trim().length > 0);
      }
      return String(value).trim().length > 0;
    })
    .map(([slug]) => slug);
}

export function mergeProductFormAttributes(
  activeAttributes: ProductFormAttribute[],
  catalogAttributes: ProductFormAttribute[],
  assignedSlugs: string[]
): ProductFormAttribute[] {
  const merged = new Map(
    activeAttributes.map((attribute) => [attribute.slug, attribute])
  );

  for (const slug of assignedSlugs) {
    if (merged.has(slug)) {
      continue;
    }
    const definition = catalogAttributes.find(
      (attribute) => attribute.slug === slug
    );
    if (definition) {
      merged.set(slug, { ...definition, inactive: true });
    }
  }

  return Array.from(merged.values());
}
