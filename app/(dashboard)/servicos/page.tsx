"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/formatters";
import { getServices, createService, updateService, deleteService } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/types";
import type { Database } from "@/types/database";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

const categories = [
  { value: "all", label: "Todos" },
  { value: "hair", label: "Cabelo" },
  { value: "nails", label: "Unhas" },
  { value: "aesthetics", label: "Estética" },
  { value: "makeup", label: "Maquiagem" },
  { value: "massage", label: "Massagem" },
];

const categoryLabels: Record<string, string> = {
  hair: "Cabelo",
  nails: "Unhas",
  aesthetics: "Estética",
  makeup: "Maquiagem",
  massage: "Massagem",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await getServices();
      // Converter dados do Supabase para o formato esperado
      const formattedServices: Service[] = data.map((service: ServiceRow) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        duration: service.duration,
        price: Number(service.price),
        description: service.description || "",
        professionalIds: service.professional_ids || [],
        active: service.active,
      }));
      setServices(formattedServices);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar serviços",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(
    (service) => activeCategory === "all" || service.category === activeCategory
  );

  const handleAddService = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceToDelete.id);
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!",
      });
      loadServices();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir serviço",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const serviceData = {
        name: formData.get("name") as string,
        category: formData.get("category") as Service["category"],
        duration: parseInt(formData.get("duration") as string),
        price: parseFloat(formData.get("price") as string),
        description: formData.get("description") as string || null,
        professional_ids: editingService?.professionalIds || [],
        active: formData.get("active") === "on",
      };

      if (editingService) {
        await updateService(editingService.id, {
          ...serviceData,
          professional_ids: editingService.professionalIds,
        });
        toast({
          title: "Sucesso",
          description: "Serviço atualizado com sucesso!",
        });
      } else {
        await createService(serviceData);
        toast({
          title: "Sucesso",
          description: "Serviço criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingService(null);
      loadServices();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar serviço",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Serviços" actionLabel="Adicionar Serviço" onAction={handleAddService} />

      {/* Category Tabs */}
      <div className="bg-white rounded-xl border border-border p-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Services Table */}
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
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {categoryLabels[service.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDuration(service.duration)}</TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          service.active
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Service Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Adicionar Serviço"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveService} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="mb-[3px]">Nome *</Label>
                <Input id="name" name="name" required defaultValue={editingService?.name} />
              </div>
              <div>
                <Label htmlFor="category" className="mb-[3px]">Categoria *</Label>
                <Select
                  name="category"
                  defaultValue={editingService?.category || "hair"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hair">Cabelo</SelectItem>
                    <SelectItem value="nails">Unhas</SelectItem>
                    <SelectItem value="aesthetics">Estética</SelectItem>
                    <SelectItem value="makeup">Maquiagem</SelectItem>
                    <SelectItem value="massage">Massagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration" className="mb-[3px]">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  required
                  defaultValue={editingService?.duration}
                />
              </div>
              <div>
                <Label htmlFor="price" className="mb-[3px]">Preço (R$) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editingService?.price}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description" className="mb-[3px]">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingService?.description}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  id="active"
                  name="active"
                  defaultChecked={editingService?.active ?? true}
                />
                <Label htmlFor="active">Serviço ativo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Excluir Serviço
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

