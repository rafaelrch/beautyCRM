"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, DollarSign, Box, Loader2, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import type { Database } from "@/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      
      // Converter dados do Supabase para o formato esperado
      const formattedProducts: (Product & { 
        totalQuantity: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      })[] = data.map((product: ProductRow) => {
        const quantity = Number(product.quantity);
        const totalQuantity = Number((product as any).total_quantity || product.quantity);
        
        // Calcular status automaticamente
        let status: string;
        const halfQuantity = totalQuantity * 0.5;
        
        if (quantity === 0) {
          status = "out_of_stock"; // Em falta
        } else if (quantity > halfQuantity) {
          status = "in_stock"; // Em estoque (quantidade > 50% do total)
        } else if (Math.abs(quantity - halfQuantity) <= 0.01) {
          // Estoque pela metade (quantidade = 50% do total, com margem de erro pequena para números decimais)
          status = "half_stock";
        } else {
          status = "low_stock"; // Estoque no fim (quantidade < 50% do total)
        }

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          quantity: quantity,
          minQuantity: 0, // Mantido para compatibilidade, mas não usado
          unit: "un",
          costPrice: Number(product.cost_price),
          salePrice: Number(product.sale_price),
          supplier: product.supplier || "",
          lastPurchase: new Date(),
          expirationDate: undefined,
          status: status,
          totalQuantity: totalQuantity,
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at),
        };
      });

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalProducts = products.filter((p) => {
    const productWithExtras = p as Product & { totalQuantity: number; status: string };
    return productWithExtras.status === "out_of_stock" || productWithExtras.status === "low_stock";
  });
  const totalProducts = products.length;
  const inventoryValue = products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0);
  const inventorySaleValue = products.reduce((sum, p) => sum + p.salePrice * p.quantity, 0);

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case "in_stock":
        return "Em estoque";
      case "half_stock":
        return "Estoque pela metade";
      case "low_stock":
        return "Estoque no fim";
      case "out_of_stock":
        return "Em falta";
      default:
        return "Desconhecido";
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-700 border-green-200";
      case "half_stock":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low_stock":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "out_of_stock":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    try {
      await createProduct({
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        quantity: parseFloat(formData.get("quantity") as string),
        cost_price: parseFloat(formData.get("costPrice") as string),
        sale_price: parseFloat(formData.get("salePrice") as string),
        supplier: formData.get("supplier") as string || null,
        total_quantity: parseFloat(formData.get("totalQuantity") as string),
      } as any);

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });

      // Resetar o formulário antes de fechar o dialog
      if (form) {
        form.reset();
      }
      
      setIsDialogOpen(false);
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar produto",
        variant: "destructive",
      });
    }
  };

  // Obter categorias únicas: combinar categorias dos produtos com categorias padrão
  const defaultCategories = ["Cabelo", "Unhas", "Estética", "Maquiagem", "Massagem", "Geral"];
  const productCategories = products.map(p => p.category);
  const allCategories = Array.from(new Set([...defaultCategories, ...productCategories])).sort();

  return (
    <div className="space-y-6">
      <Header 
        title="Estoque" 
        actionLabel="Adicione produto" 
        onAction={() => setIsDialogOpen(true)}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Valor em Estoque (Preço de Venda)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(inventorySaleValue)}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <DollarSign className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Valor do Estoque (Preço de Custo)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(inventoryValue)}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <DollarSign className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total de Produtos</p>
                <p className="text-4xl font-bold text-foreground">{totalProducts}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <Box className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-800 mb-1">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">{criticalProducts.length}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <AlertTriangle className="h-12 w-12 text-red-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {criticalProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-2">
              {criticalProducts.length} produto(s) abaixo da quantidade mínima:
            </p>
            <div className="flex flex-wrap gap-2">
              {criticalProducts.map((product) => {
                const productWithExtras = product as Product & { totalQuantity: number; status: string };
                return (
                  <Badge key={product.id} variant="outline" className="bg-white">
                    {product.name} ({product.quantity}/{productWithExtras.totalQuantity})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-border p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Qntd Atual</TableHead>
                <TableHead>Qntd Total</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Venda</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Atualização</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
              filteredProducts.map((product) => {
                const productWithExtras = product as Product & {
                  totalQuantity: number;
                  status: string;
                  createdAt: Date;
                  updatedAt: Date;
                };
                return (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{productWithExtras.totalQuantity}</TableCell>
                    <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStockStatusColor(productWithExtras.status)}
                      >
                        {getStockStatusLabel(productWithExtras.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(productWithExtras.createdAt)}</TableCell>
                    <TableCell>{formatDate(productWithExtras.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsDrawerOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        )}
      </div>

      {/* Dialog para Adicionar Produto */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Resetar formulário quando o dialog fechar
          const form = document.querySelector('form[data-product-form]') as HTMLFormElement;
          if (form) {
            form.reset();
          }
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4" data-product-form>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-[3px]">Nome do Produto *</Label>
                <Input id="name" name="name" required placeholder="Ex: Shampoo Profissional" />
              </div>
              <div>
                <Label htmlFor="category" className="mb-[3px]">Categoria *</Label>
                <Select name="category" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="mb-[3px]">Quantidade Atual *</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="totalQuantity" className="mb-[3px]">Quantidade Total *</Label>
                <Input 
                  id="totalQuantity" 
                  name="totalQuantity" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice" className="mb-[3px]">Preço de Custo *</Label>
                <Input 
                  id="costPrice" 
                  name="costPrice" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="salePrice" className="mb-[3px]">Preço de Venda *</Label>
                <Input 
                  id="salePrice" 
                  name="salePrice" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supplier" className="mb-[3px]">Fornecedor *</Label>
              <Input 
                id="supplier" 
                name="supplier" 
                required 
                placeholder="Nome do fornecedor"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Produto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent className="h-full w-[500px] mt-0">
          <DrawerHeader>
            <DrawerTitle>Editar Produto</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto">
            {editingProduct && (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  try {
                    await updateProduct(editingProduct.id, {
                      name: formData.get("name") as string,
                      category: formData.get("category") as string,
                      quantity: parseFloat(formData.get("quantity") as string),
                      cost_price: parseFloat(formData.get("costPrice") as string),
                      sale_price: parseFloat(formData.get("salePrice") as string),
                      supplier: formData.get("supplier") as string || null,
                      total_quantity: parseFloat(formData.get("totalQuantity") as string),
                    } as any);

                    toast({
                      title: "Sucesso",
                      description: "Produto atualizado com sucesso!",
                    });

                    setIsDrawerOpen(false);
                    setEditingProduct(null);
                    loadProducts();
                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message || "Erro ao atualizar produto",
                      variant: "destructive",
                    });
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="mb-[3px]">Nome do Produto *</Label>
                    <Input 
                      id="edit-name" 
                      name="name" 
                      required 
                      placeholder="Ex: Shampoo Profissional"
                      defaultValue={editingProduct.name}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category" className="mb-[3px]">Categoria *</Label>
                    <Select name="category" required defaultValue={editingProduct.category}>
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-quantity" className="mb-[3px]">Quantidade Atual *</Label>
                    <Input 
                      id="edit-quantity" 
                      name="quantity" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required 
                      placeholder="0"
                      defaultValue={editingProduct.quantity}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-totalQuantity" className="mb-[3px]">Quantidade Total *</Label>
                    <Input 
                      id="edit-totalQuantity" 
                      name="totalQuantity" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required 
                      placeholder="0"
                      defaultValue={(editingProduct as any).totalQuantity || editingProduct.quantity}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-costPrice" className="mb-[3px]">Preço de Custo *</Label>
                    <Input 
                      id="edit-costPrice" 
                      name="costPrice" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required 
                      placeholder="0.00"
                      defaultValue={editingProduct.costPrice}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-salePrice" className="mb-[3px]">Preço de Venda *</Label>
                    <Input 
                      id="edit-salePrice" 
                      name="salePrice" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required 
                      placeholder="0.00"
                      defaultValue={editingProduct.salePrice}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-supplier" className="mb-[3px]">Fornecedor *</Label>
                  <Input 
                    id="edit-supplier" 
                    name="supplier" 
                    required 
                    placeholder="Nome do fornecedor"
                    defaultValue={editingProduct.supplier}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setProductToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (productToDelete) {
                  try {
                    await deleteProduct(productToDelete);
                    toast({
                      title: "Sucesso",
                      description: "Produto excluído com sucesso!",
                    });
                    setIsDeleteDialogOpen(false);
                    setProductToDelete(null);
                    loadProducts();
                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message || "Erro ao excluir produto",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

