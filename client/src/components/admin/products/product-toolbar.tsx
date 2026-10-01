import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const wrapperClass =
  "flex flex-col gap-3 md:flex-row md:items-center md:justify-between";

const searchWrapClass = "relative w-full md:w-80";

const searchIconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";

const searchInputClass = "pl-9";

const actionsWrapClass = "flex flex-col gap-3 sm:flex-row";

const addIconClass = "mr-2 h-4 w-4";

type productToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onManageCategories: () => void;
  onAddProduct: () => void;
};

export function ProductsToolbar({
  search,
  onSearchChange,
  onManageCategories,
  onAddProduct,
}: productToolbarProps) {
  return (
    <div className={wrapperClass}>
      <div className={searchWrapClass}>
        <Search className={searchIconClass} />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={searchInputClass}
          placeholder="Search products..."
        />
      </div>
      <div className={actionsWrapClass}>
        <Button onClick={onManageCategories} variant="outline">
          Manage Categories
        </Button>
        <Button onClick={onAddProduct}>
          <Plus className={addIconClass} />
          Add Product
        </Button>
      </div>
    </div>
  );
}
