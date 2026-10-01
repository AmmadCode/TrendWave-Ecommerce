import { Button } from "@/components/ui/button";
import { SIZE_OPTIONS } from "@/features/admin/products/constants";

const wrapperClass = "space-y-3";

const headerClass = "space-y-1";

const titleClass = "text-sm font-semibold text-foreground";

const descriptionClass = "text-sm text-muted-foreground";

const gridClass = "grid grid-cols-4 gap-2";

const sizeButtonClass = "h-11";

type sizeSelectedProps = {
  selectedSize: string[];
  onToggle: (size: string) => void;
};

export function SizeSelector({ selectedSize, onToggle }: sizeSelectedProps) {
  return (
    <div className={wrapperClass}>
      <div className={headerClass}>
        <h3 className={titleClass}>Sizes</h3>
      </div>
      <div className={gridClass}>
        {SIZE_OPTIONS.map((size) => {
          const active = selectedSize.includes(size);
          return (
            <Button
              onClick={() => onToggle(size)}
              key={size}
              variant={active ? "default" : "outline"}
              type="button"
              className={sizeButtonClass}
            >
              {size}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
