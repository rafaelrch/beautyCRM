"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { storage, initializeStorage } from "@/lib/storage";
import { mockClients, mockServices, mockTransactions, mockAppointments, mockProducts, mockMovements, mockSalonConfig } from "@/data";
import { mockProfissionais } from "@/data/professionals";

interface Profissional {
  id: string;
  nome: string;
  cor: string;
  especialidade: string;
}

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
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formCor, setFormCor] = useState("#FF6B6B");
  const [formEspecialidade, setFormEspecialidade] = useState("");

  useEffect(() => {
    initializeStorage({
      clients: mockClients,
      services: mockServices,
      transactions: mockTransactions,
      products: mockProducts,
      appointments: mockAppointments,
      movements: mockMovements,
      salonConfig: mockSalonConfig,
    });
    
    // Carregar profissionais do localStorage ou usar mock
    const stored = storage.get<Profissional>("professionals");
    if (stored.length === 0) {
      storage.set("professionals", mockProfissionais);
      setProfissionais(mockProfissionais);
    } else {
      setProfissionais(stored);
    }
  }, []);

  const filteredProfissionais = profissionais.filter((prof) =>
    prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProfissional = () => {
    setEditingProfissional(null);
    setFormCor("#FF6B6B");
    setFormEspecialidade("");
    setIsDialogOpen(true);
  };

  const handleEditProfissional = (profissional: Profissional) => {
    setEditingProfissional(profissional);
    setFormCor(profissional.cor);
    setFormEspecialidade(profissional.especialidade);
    setIsDialogOpen(true);
  };

  const handleDeleteProfissional = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este profissional?")) {
      storage.delete<Profissional>("professionals", id);
      setProfissionais(storage.get<Profissional>("professionals"));
    }
  };

  const handleSaveProfissional = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const profissionalData: Omit<Profissional, "id"> = {
      nome: formData.get("nome") as string,
      cor: formCor,
      especialidade: formEspecialidade,
    };

    if (editingProfissional) {
      storage.update<Profissional>("professionals", editingProfissional.id, profissionalData);
    } else {
      storage.add<Profissional>("professionals", {
        ...profissionalData,
        id: `prof${Date.now()}`,
      });
    }

    setProfissionais(storage.get<Profissional>("professionals"));
    setIsDialogOpen(false);
    setEditingProfissional(null);
    setFormCor("#FF6B6B");
    setFormEspecialidade("");
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
                  <TableCell className="font-medium">{profissional.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ backgroundColor: profissional.cor }}
                      />
                      <span className="text-sm text-muted-foreground">{profissional.cor}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {profissional.especialidade}
                    </Badge>
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
                        onClick={() => handleDeleteProfissional(profissional.id)}
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
                defaultValue={editingProfissional?.nome}
                required
                placeholder="Nome completo do profissional"
              />
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
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProfissional(null);
                  setFormCor("#FF6B6B");
                  setFormEspecialidade("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingProfissional ? "Atualizar" : "Adicionar"} Profissional
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

