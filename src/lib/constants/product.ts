// Product form constants
export const MAX_UPLOAD_FILES = 3;
export const MIN_NAME_LENGTH = 2;
export const MIN_DESCRIPTION_LENGTH = 10;

export const PRODUCT_TYPE_OPTIONS = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "service", label: "Service" },
] as const;

export const PRODUCT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of Stock" },
] as const;
