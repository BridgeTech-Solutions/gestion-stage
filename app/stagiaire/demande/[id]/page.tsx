"use client"

import type React from "react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { mockDemandes } from "@/lib/mock-data"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, FileText, MessageSquare, User } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function DemandeDetailPage() {
  const user = { name: "Lucas Bernard", role: "stagiaire" }
  const params = useParams()
  const router = useRouter()
  const demandeId = params.id as string

  const [commentaire, setCommentaire] = useState("")

  // Trouver la demande correspondante
  const demande = mockDemandes.find((d) => d.id === demandeId)

  if (!demande) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar role="stagiaire" />
          <main className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Demande non trouvée</h1>
              <Link href="/stagiaire/demandes">
                <Button>Retour à la liste</Button>
              </Link>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulation d'ajout de commentaire
    setCommentaire("")
    // Redirection avec message de succès
    router.push(`/stagiaire/demande/${demandeId}?success=comment`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="stagiaire" />

        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Détails de la demande</h1>
              <p className="text-gray-600">Suivi et informations sur votre demande</p>
            </div>
            <div className="flex gap-2">
              <Link href="/stagiaire/demandes">
                <Button variant="outline">Retour à la liste</Button>
              </Link>
              {demande.statut === "En attente" && (
                <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50">
                  Annuler la demande
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Demande de {demande.type.replace("_", " ")}</CardTitle>
                  <Badge
                    className={`${
                      demande.statut === "Validé"
                        ? "bg-green-100 text-green-800"
                        : demande.statut === "Refusé"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {demande.statut}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date de la demande</p>
                        <p className="text-base">{demande.date}</p>
                      </div>
                    </div>

                    {demande.dateDebut && demande.dateFin && (
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Période demandée</p>
                          <p className="text-base">
                            Du {demande.dateDebut} au {demande.dateFin}
                          </p>
                        </div>
                      </div>
                    )}

                    {demande.duree && (
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Durée</p>
                          <p className="text-base">{demande.duree}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Demandeur</p>
                        <p className="text-base">{demande.stagiaire}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-medium mb-2">Détails de la demande</h3>
                    <p className="text-gray-700">{demande.details}</p>
                  </div>

                  {demande.documents && demande.documents.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-base font-medium mb-2">Documents joints</h3>
                      <div className="space-y-2">
                        {demande.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Télécharger
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Commentaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {demande.commentaires && demande.commentaires.length > 0 ? (
                    <div className="space-y-4">
                      {demande.commentaires.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{comment.userName}</p>
                                <p className="text-xs text-gray-500">{comment.userRole}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <p className="text-gray-700">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun commentaire pour le moment</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmitComment} className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-medium mb-2">Ajouter un commentaire</h3>
                    <Textarea
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      placeholder="Écrivez votre commentaire ici..."
                      className="mb-3"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!commentaire.trim()}>
                        Envoyer
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Statut de la demande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            demande.statut !== "En attente"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span className="text-sm">1</span>
                        </div>
                        <span>Soumission</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Complété</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            demande.tuteurDecision === "Validé"
                              ? "bg-green-100 text-green-600"
                              : demande.tuteurDecision === "Refusé"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span className="text-sm">2</span>
                        </div>
                        <span>Validation tuteur</span>
                      </div>
                      <Badge
                        className={`${
                          demande.tuteurDecision === "Validé"
                            ? "bg-green-100 text-green-800"
                            : demande.tuteurDecision === "Refusé"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {demande.tuteurDecision || "En attente"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            demande.rhDecision === "Validé"
                              ? "bg-green-100 text-green-600"
                              : demande.rhDecision === "Refusé"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span className="text-sm">3</span>
                        </div>
                        <span>Validation RH</span>
                      </div>
                      <Badge
                        className={`${
                          demande.rhDecision === "Validé"
                            ? "bg-green-100 text-green-800"
                            : demande.rhDecision === "Refusé"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {demande.rhDecision || "En attente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-medium mb-2">Délai de traitement</h3>
                    <p className="text-sm text-gray-600">
                      Les demandes sont généralement traitées dans un délai de 48 heures ouvrables.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-medium mb-2">Besoin d'aide ?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Si vous avez des questions concernant votre demande, n'hésitez pas à contacter votre tuteur ou le
                      service RH.
                    </p>
                    <Button variant="outline" className="w-full">
                      Contacter le support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
