import { CategoryDialog } from "@/components/admin/products/category-dialog";
import { ProductDialog } from "@/components/admin/products/product-dialog";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductsToolbar } from "@/components/admin/products/product-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminProducts } from "@/features/admin/products/use-admin-products";

const pageWrap = "space-y-6 p-6";

const cardClass = "border-border bg-card shadow-sm";

const cardHeaderClass = "space-y-4";

const cardTitleClass = "text-xl";

const cardContentClass = "space-y-4";

function AdminProducts() {
  const {
    search,
    setSearch,
    productDialogOpen,
    products,
    categories,
    categoryDialogOpen,
    loading,
    editingProduct,
    setCategoryDialogOpen,
    setProductDialogOpen,
    openCreateDialog,
    closeProductDialog,
    refreshAll,
    openEditDialog,
  } = useAdminProducts();
  return (
    <div className={pageWrap}>
      <Card className={cardClass}>
        <CardHeader className={cardHeaderClass}>
          <CardTitle className={cardTitleClass}>Products</CardTitle>
          <ProductsToolbar
            search={search}
            onSearchChange={setSearch}
            onManageCategories={() => setCategoryDialogOpen(true)}
            onAddProduct={openCreateDialog}
          />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <ProductTable
            products={products}
            onEdit={openEditDialog}
            loading={loading}
          />
        </CardContent>
      </Card>
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categories={categories}
        onSaved={refreshAll}
      />
      <ProductDialog
        open={productDialogOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            closeProductDialog();
            return;
          }
          setProductDialogOpen(true);
        }}
        categories={categories}
        product={editingProduct}
        onSaved={refreshAll}
      />
    </div>
  );
}

export default AdminProducts;
