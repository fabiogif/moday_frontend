'use client'

import { useState, useCallback } from 'react'
import { ReviewStatCards } from './components/review-stat-cards'
import { ReviewsDataTable } from './components/reviews-data-table'
import { useAuthenticatedReviews, useAuthenticatedReviewStats, useMutation } from '@/hooks/use-authenticated-api'
import { endpoints } from '@/lib/api-client'
import { PageLoading } from '@/components/ui/loading-progress'
import { toast } from 'sonner'

export interface Review {
  uuid: string
  rating: number
  comment: string | null
  customer_name: string
  customer_email?: string
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  created_at: string
  created_at_human: string
  order?: {
    id: number
    identify: string
  }
  moderator?: {
    name: string
    moderated_at: string
  }
  moderation_reason?: string
}

export interface ReviewStats {
  total: number
  average_rating: number
  pending_count: number
  approved_count: number
  rejected_count: number
  featured_count: number
}

export default function ReviewsPage() {
  // Filtro de status
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Dados autenticados
  const { data: reviewsData, loading: loadingReviews, error: errorReviews, refetch, isAuthenticated } = useAuthenticatedReviews(statusFilter)
  const { data: statsData, loading: loadingStats } = useAuthenticatedReviewStats()
  const { mutate: approveReview } = useMutation()
  const { mutate: rejectReview } = useMutation()
  const { mutate: toggleFeatured } = useMutation()
  const { mutate: deleteReview } = useMutation()

  const reviews = Array.isArray(reviewsData) ? reviewsData : []
  const stats = statsData as ReviewStats | null

  const handleApprove = useCallback(async (uuid: string) => {
    // console.log('🔵 handleApprove chamado com uuid:', uuid)
    try {
      // console.log('🔵 Chamando approveReview...')
      await approveReview(endpoints.reviews.approve(uuid), 'POST', {})
      // console.log('🔵 approveReview concluído')
      toast.success('Avaliação aprovada!')
      refetch()
    } catch (error: any) {
      console.error('🔴 Erro no handleApprove:', error)
      toast.error(error.message || 'Erro ao aprovar avaliação')
    }
  }, [approveReview, refetch])

  const handleReject = useCallback(async (uuid: string, reason: string) => {
    try {
      await rejectReview(endpoints.reviews.reject(uuid), 'POST', {
        reason: reason || 'Conteúdo inadequado'
      })
      toast.success('Avaliação rejeitada')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar avaliação')
    }
  }, [rejectReview, refetch])

  const handleToggleFeatured = useCallback(async (uuid: string) => {
    try {
      await toggleFeatured(endpoints.reviews.toggleFeatured(uuid), 'POST', {})
      toast.success('Status de destaque atualizado')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar destaque')
    }
  }, [toggleFeatured, refetch])

  const handleDelete = useCallback(async (uuid: string) => {
    try {
      await deleteReview(endpoints.reviews.delete(uuid), 'DELETE')
      toast.success('Avaliação removida')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar avaliação')
    }
  }, [deleteReview, refetch])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">Usuário não autenticado. Faça login para continuar.</div>
      </div>
    )
  }

  if (loadingReviews || loadingStats) {
    return (
      <PageLoading 
        isLoading={true}
        message="Carregando avaliações..."
      />
    )
  }

  if (errorReviews) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">Erro ao carregar avaliações: {errorReviews}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <ReviewStatCards stats={stats} />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <ReviewsDataTable 
          reviews={reviews}
          onApprove={handleApprove}
          onReject={handleReject}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDelete}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>
    </div>
  )
}
