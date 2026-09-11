import { CATEGORIES_PAGE_PATH } from "@/lib/category-paths";
import { redirect } from "next/navigation";

export default function CategoriesListRedirectPage() {
  redirect(CATEGORIES_PAGE_PATH);
}
