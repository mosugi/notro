import type { PropertyPageObjectResponseType } from "../loader/schema.ts";

export const getPlainText = (
  property: PropertyPageObjectResponseType,
): string | undefined => {
  if (property?.type === "rich_text" && property.rich_text.length > 0) {
    return property.rich_text.map((t) => t.plain_text).join("");
  }
  if (property?.type === "title" && property.title.length > 0) {
    return property.title.map((t) => t.plain_text).join("");
  }
  if (property?.type === "select" && property.select?.name !== undefined) {
    return property.select.name;
  }
  if (
    property?.type === "multi_select" &&
    property.multi_select !== undefined
  ) {
    return property.multi_select.map((option) => option.name).join();
  }
  return undefined;
};
