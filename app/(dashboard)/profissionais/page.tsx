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
import { Edit, Trash2, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfessionals, createProfessional, updateProfessional, deleteProfessional } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/database";

type Professional = Database["public"]["Tables"]["professionals"]["Row"];

const especialidades = [
  "Cabelo",
  "Barba",
  "Manicure",
  "Estética",
  "Maquiagem",
  "Massagem",
];

const coresPredefinidas = [
  "#FF6B6B", // Vermelho
  "#4ECDC4", // Turquesa
  "#FFD93D", // Amarelo
  "#A8E6CF", // Verde claro
  "#9B59B6", // Roxo
  "#E74C3C", // Vermelho escuro
  "#3498DB", // Azul
  "#F39C12", // Laranja
  "#1ABC9C", // Verde água
  "#E67E22", // Laranja escuro
  "#34495E", // Azul acinzentado
  "#16A085", // Verde esmeralda
];

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Professional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Professional | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formCor, setFormCor] = useState("#FF6B6B");
  const [formEspecialidade, setFormEspecialidade] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const data = await getProfessionals();
      setProfissionais(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar profissionais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfissionais = profissionais.filter((prof) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prof.specialties && prof.specialties.some((esp: string) => esp.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleAddProfissional = () => {
    setEditingProfissional(null);
    setFormCor("#FF6B6B");
    setFormEspecialidade("");
    setIsDialogOpen(true);
  };

  const handleEditProfissional = (profissional: Professional) => {
    setEditingProfissional(profissional);
    setFormCor(profissional.color || "#FF6B6B");
    setFormEspecialidade(profissional.specialties && profissional.specialties.length > 0 ? profissional.specialties[0] : "");
    setIsDialogOpen(true);
  };

  const handleDeleteProfissional = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProfissional = async () => {
    if (!professionalToDelete) return;

    try {
      await deleteProfessional(professionalToDelete.id);
      toast({
        title: "Sucesso",
        description: "Profissional excluído com sucesso!",
      });
      loadProfessionals();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir profissional",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProfessionalToDelete(null);
    }
  };

  const handleSaveProfissional = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Previne submissão dupla
    if (isSubmitting) return;
    
    const formData = new FormData(e.currentTarget);

    if (!formEspecialidade) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma especialidade",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingProfissional) {
        await updateProfessional(editingProfissional.id, {
          name: formData.get("nome") as string,
          color: formCor,
          specialties: [formEspecialidade],
          phone: formData.get("phone") as string || null,
          email: formData.get("email") as string || null,
        });
        toast({
          title: "Sucesso",
          description: "Profissional atualizado com sucesso!",
        });
      } else {
        await createProfessional({
          name: formData.get("nome") as string,
          color: formCor,
          specialties: [formEspecialidade],
          phone: formData.get("phone") as string || null,
          email: formData.get("email") as string || null,
          active: true,
        });
        toast({
          title: "Sucesso",
          description: "Profissional criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingProfissional(null);
      setFormCor("#FF6B6B");
      setFormEspecialidade("");
      loadProfessionals();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar profissional",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Profissionais"
        actionLabel="Adicionar Profissional"
        onAction={handleAddProfissional}
      />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou especialidade..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Professionals Table */}
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
                <TableHead>Cor</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfissionais.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum profissional encontrado. Adicione o primeiro profissional.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfissionais.map((profissional) => (
                  <TableRow key={profissional.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{profissional.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{ backgroundColor: profissional.color || "#FF6B6B" }}
                        />
                        <span className="text-sm text-muted-foreground">{profissional.color || "#FF6B6B"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profissional.specialties && profissional.specialties.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {profissional.specialties.map((esp, idx) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {esp}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sem especialidade</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditProfissional(profissional)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProfissional(profissional)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProfissional ? "Editar Profissional" : "Adicionar Profissional"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProfissional} className="space-y-4">
            <div>
              <Label htmlFor="nome" className="mb-[3px]">Nome *</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={editingProfissional?.name}
                required
                placeholder="Nome completo do profissional"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="mb-[3px]">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingProfissional?.phone || ""}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-[3px]">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingProfissional?.email || ""}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="especialidade" className="mb-[3px]">Especialidade *</Label>
              <Select
                value={formEspecialidade}
                onValueChange={setFormEspecialidade}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cor" className="mb-[3px]">Cor de Identificação *</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {coresPredefinidas.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setFormCor(cor)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      formCor === cor
                        ? "border-foreground ring-2 ring-offset-2"
                        : "border-transparent hover:border-border"
                    )}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={formCor}
                onChange={(e) => setFormCor(e.target.value)}
                className="mt-2 h-12"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProfissional(null);
                  setFormCor("#FF6B6B");
                  setFormEspecialidade("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {editingProfissional ? "Atualizar" : "Adicionar"} Profissional
                  </>
                )}
              </Button>
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
              Tem certeza que deseja excluir o profissional <strong>{professionalToDelete?.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProfissional}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Excluir Profissional
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

