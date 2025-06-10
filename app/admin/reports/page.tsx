"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExportMenu } from "@/components/ui/export-menu"
import { Calendar, TrendingUp, Users, FileText } from "lucide-react"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts"

export default function ReportsPage() {
  const user = { name: "ADMINISTRATEUR", role: "admin" }
  const [selectedPeriod, setSelectedPeriod] = useState("2025")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Données simulées pour les rapports
  const monthlyData = [
    { month: "Jan", stagiaires: 12, demandes: 25, validees: 20, refusees: 3 },
    { month: "Fév", stagiaires: 15, demandes: 30, validees: 25, refusees: 2 },
    { month: "Mar", stagiaires: 18, demandes: 35, validees: 28, refusees: 4 },
    { month: "Avr", stagiaires: 22, demandes: 40, validees: 32, refusees: 5 },
    { month: "Mai", stagiaires: 25, demandes: 45, validees: 38, refusees: 2 },
    { month: "Juin", stagiaires: 28, demandes: 50, validees: 42, refusees: 6 },
  ]

  const departmentData = [
    { name: "Développement", value: 45, color: "#0088FE" },
    { name: "Marketing", value: 25, color: "#00C49F" },
    { name: "Finance", value: 15, color: "#FFBB28" },
    { name: "RH", value: 10, color: "#FF8042" },
    { name: "Design", value: 5, color: "#8884d8" },
  ]

  const performanceData = [
    { metric: "Taux d'acceptation", value: 85, target: 80, status: "success" },
    { metric: "Délai moyen de traitement", value: 2.5, target: 3, status: "success", unit: "jours" },
    { metric: "Satisfaction stagiaires", value: 4.2, target: 4.0, status: "success", unit: "/5" },
    { metric: "Taux de prolongation", value: 65, target: 70, status: "warning" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Rapports et analyses</h1>
              <p className="text-muted-foreground">Tableaux de bord et statistiques détaillées</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  <SelectItem value="dev">Développement</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                </SelectContent>
              </Select>
              <ExportMenu type="stagiaires" />
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trends">Tendances</TabsTrigger>
              <TabsTrigger value="detailed">Détaillé</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stagiaires</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Demandes traitées</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">245</div>
                    <p className="text-xs text-muted-foreground">+8% vs mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-xs text-muted-foreground">+2% vs mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Délai moyen</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.5j</div>
                    <p className="text-xs text-muted-foreground">-0.5j vs mois dernier</p>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques principaux */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="stagiaires" fill="#0088FE" name="Stagiaires" />
                          <Bar dataKey="demandes" fill="#00C49F" name="Demandes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par département</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={departmentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {departmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performanceData.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{metric.metric}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold">
                          {metric.value}
                          {metric.unit || "%"}
                        </div>
                        <div
                          className={`text-sm px-2 py-1 rounded ${
                            metric.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          Objectif: {metric.target}
                          {metric.unit || "%"}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.status === "success" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendances sur 6 mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="stagiaires" stroke="#0088FE" strokeWidth={2} name="Stagiaires" />
                        <Line
                          type="monotone"
                          dataKey="validees"
                          stroke="#00C49F"
                          strokeWidth={2}
                          name="Demandes validées"
                        />
                        <Line
                          type="monotone"
                          dataKey="refusees"
                          stroke="#FF8042"
                          strokeWidth={2}
                          name="Demandes refusées"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Écoles partenaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Université Paris Tech", count: 25 },
                        { name: "ESC Paris", count: 18 },
                        { name: "Université Lyon 1", count: 15 },
                        { name: "INSA Toulouse", count: 12 },
                        { name: "Centrale Lille", count: 10 },
                      ].map((school, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{school.name}</span>
                          <span className="text-muted-foreground">{school.count} stagiaires</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Types de demandes populaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: "Stage académique", count: 45, percentage: 40 },
                        { type: "Prolongation", count: 28, percentage: 25 },
                        { type: "Stage professionnel", count: 22, percentage: 20 },
                        { type: "Congé", count: 12, percentage: 10 },
                        { type: "Attestation", count: 6, percentage: 5 },
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.type}</span>
                            <span className="text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Footer />
    </div>
  )
}
