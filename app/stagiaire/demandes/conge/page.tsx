"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function DemandeCongeForm() {
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [description, setDescription] = useState("")
  const [preuve, setPreuve] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreuve(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Ici, ajoute la logique d'enregistrement dans la base et upload du fichier si besoin
      toast({
        title: "Succès",
        description: "Votre demande de congé a été soumise.",
      })
      router.push("/stagiaire/demandes")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg border"
      >
        <h1 className="text-2xl font-bold mb-8 text-center">Demande de congé</h1>

        <div className="mb-6">
          <Label htmlFor="date-debut" className="block mb-2">Date de début</Label>
          <Input
            id="date-debut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="date-fin" className="block mb-2">Date de fin</Label>
          <Input
            id="date-fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="description" className="block mb-2">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez la raison de votre congé"
            required
          />
        </div>

        <div className="mb-8">
          <Label htmlFor="preuve" className="block mb-2">Fichier(s) justificatif(s)</Label>
          <Input
            id="preuve"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {preuve && (
            <div className="mt-2 text-green-600 text-sm">
              ✓ {preuve.name}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
          disabled={loading}
        >
          {loading ? "Envoi..." : "Envoyer la demande"}
        </Button>
      </form>
    </div>
  )}