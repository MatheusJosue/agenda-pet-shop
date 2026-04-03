"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Eye, Plus, PawPrint } from "lucide-react";
import { getPets, createPet, deletePet } from "@/lib/actions/pets";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SIZE_LABELS, SIZE_COLORS } from "@/lib/types/service-prices";
import { HAIR_TYPE_LABELS } from "@/lib/types/pets";
import type { PetWithClient } from "@/lib/types/pets";
import type { SizeCategory } from "@/lib/types/service-prices";
import type { HairType } from "@/lib/types/pets";

interface ClientPetsSectionProps {
  clientId: string;
}

const SIZE_OPTIONS: Array<{ value: SizeCategory; label: string }> = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
  { value: 'giant', label: 'Gigante' }
]

const PET_EMOJIS: Record<SizeCategory, string> = {
  tiny: '🐭',
  small: '🐱',
  medium: '🐕',
  large: '🦮',
  giant: '🐕‍🦺'
}

export function ClientPetsSection({ clientId }: ClientPetsSectionProps) {
  const [pets, setPets] = useState<PetWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petIdToDelete, setPetIdToDelete] = useState<string | null>(null);
  const [petNameToDelete, setPetNameToDelete] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    size: "medium" as SizeCategory,
    hairType: "PC" as HairType,
    notes: "",
  });

  useEffect(() => {
    loadPets();
  }, [clientId]);

  const loadPets = async () => {
    setLoading(true);
    const result = await getPets(clientId);
    if (result.error) {
      setError(result.error);
    } else {
      setPets(result.data || []);
    }
    setLoading(false);
  };

  const handleCreatePet = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const result = await createPet({
        clientId,
        name: formData.name.trim(),
        breed: formData.breed.trim() || undefined,
        size: formData.size,
        hairType: formData.hairType,
        notes: formData.notes.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        await loadPets();
        setShowAddForm(false);
        setFormData({ name: "", breed: "", size: "medium", hairType: "PC", notes: "" });
      }
    } catch (err) {
      setError("Erro ao criar pet");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePet = async (petId: string, petName: string) => {
    setPetIdToDelete(petId);
    setPetNameToDelete(petName);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePet = async () => {
    if (!petIdToDelete) return;

    setSaving(true);
    const deleteResult = await deletePet(petIdToDelete);
    if (deleteResult.error) {
      setError(deleteResult.error);
    } else {
      await loadPets();
    }
    setSaving(false);
    setShowDeleteConfirm(false);
    setPetIdToDelete(null);
    setPetNameToDelete("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
            <PawPrint size={20} className="text-[#f183ff]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Pets</h2>
            <p className="text-white/50 text-sm">{pets.length} cadastrado{pets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 rounded-xl"
        >
          {showAddForm ? (
            <>Cancelar</>
          ) : (
            <>
              <Plus size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <GlassCard
          variant="default"
          className="p-4 bg-red-500/10 border-red-500/30"
        >
          <p className="text-red-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {error}
          </p>
        </GlassCard>
      )}

      {/* Add Form */}
      {showAddForm && (
        <GlassCard variant="elevated" className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            Novo Pet
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Nome *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Rex, Mimi, Bob..."
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Raça
              </label>
              <Input
                type="text"
                value={formData.breed}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                placeholder="Ex: Poodle, Vira-lata..."
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-3">
                Porte *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: option.value })}
                    className={`px-2 py-2.5 rounded-xl border transition-all text-xs font-medium ${
                      formData.size === option.value
                        ? "bg-gradient-to-br from-[#f183ff] to-[#d946ef] border-[#f183ff] text-white shadow-lg shadow-[#f183ff]/20"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-lg mb-1">{PET_EMOJIS[option.value]}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-3">
                Tipo de Pelo *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(HAIR_TYPE_LABELS) as [HairType, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, hairType: value })}
                    className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                      formData.hairType === value
                        ? "bg-gradient-to-br from-[#f183ff] to-[#d946ef] border-[#f183ff] text-white shadow-lg shadow-[#f183ff]/20"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Ex: Alérgico a certos alimentos, prefere banho rápido..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleCreatePet}
                disabled={saving || !formData.name.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)]"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    name: "",
                    breed: "",
                    size: "medium",
                    hairType: "PC",
                    notes: "",
                  });
                }}
                className="rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#f183ff]/20 border-t-[#f183ff] rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-[#d946ef]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
        </div>
      ) : pets.length === 0 ? (
        /* Empty State */
        <GlassCard variant="elevated" className="p-10 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/10 flex items-center justify-center border border-[#f183ff]/20">
              <PawPrint size={32} className="text-[#f183ff]/60" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-[#f183ff]/10 animate-ping" />
          </div>
          <p className="text-white/60 font-medium">Nenhum pet cadastrado</p>
          <p className="text-white/40 text-sm mt-2">
            Clique em "Adicionar" para cadastrar o primeiro pet deste cliente.
          </p>
        </GlassCard>
      ) : (
        /* Pet List */
        <div className="grid gap-3">
          {pets.map((pet, index) => (
            <GlassCard
              key={pet.id}
              variant="elevated"
              className="p-4 hover:scale-[1.01] transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <div className="flex justify-between items-start gap-4">
                <Link
                  href={`/app/clientes/${clientId}/pets/${pet.id}`}
                  className="flex-1 hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center text-2xl border-2 border-[#f183ff]/20 shadow-lg shadow-[#f183ff]/10">
                      {PET_EMOJIS[pet.size] || '🐾'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#f183ff] transition-colors">
                        {pet.name}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${SIZE_COLORS[pet.size]}`}
                      >
                        {SIZE_LABELS[pet.size]}
                      </span>
                    </div>
                  </div>
                  {pet.breed && (
                    <p className="text-white/60 text-sm flex items-center gap-1.5 ml-[4.5rem]">
                      <span className="text-base">🐕</span>
                      <span>Raça: <span className="text-white/80">{pet.breed}</span></span>
                    </p>
                  )}
                  {pet.notes && (
                    <p className="text-white/50 text-sm mt-2 ml-[4.5rem] line-clamp-2">
                      📝 {pet.notes}
                    </p>
                  )}
                </Link>
                <div className="flex gap-2">
                  <Link href={`/app/clientes/${clientId}/pets/${pet.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Ver detalhes"
                      className="rounded-xl"
                    >
                      <Eye size={16} />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePet(pet.id, pet.name)}
                    disabled={saving}
                    title="Excluir"
                    className="rounded-xl shadow-[0_0_15px_rgba(255,77,77,0.4)] hover:shadow-[0_0_20px_rgba(255,77,77,0.6)] transition-shadow"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDeletePet}
        title="Excluir pet?"
        description={petNameToDelete ? `Você tem certeza que deseja excluir ${petNameToDelete}? Esta ação não pode ser desfeita.` : 'Esta ação não pode ser desfeita!'}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        icon="trash"
        loading={saving}
      />
    </div>
  );
}
