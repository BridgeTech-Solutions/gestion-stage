"use client"

import { CheckCircle, Clock, XCircle, User } from "lucide-react"
import { Badge } from "./badge"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface WorkflowStep {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  assignee?: string
  completedAt?: string
  comment?: string
}

interface WorkflowStatusProps {
  steps: WorkflowStep[]
  currentStep?: string
}

export function WorkflowStatus({ steps, currentStep }: WorkflowStatusProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow de validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    {getStepBadge(step.status)}
                  </div>
                  {step.description && <p className="text-sm text-muted-foreground mt-1">{step.description}</p>}
                  {step.assignee && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      {step.assignee}
                    </div>
                  )}
                  {step.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1">Terminé le {step.completedAt}</p>
                  )}
                  {step.comment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">Commentaire:</p>
                      <p>{step.comment}</p>
                    </div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && <div className="absolute left-2.5 top-8 w-0.5 h-6 bg-gray-200"></div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
