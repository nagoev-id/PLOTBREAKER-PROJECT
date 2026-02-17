'use client'

import React, { FC } from 'react'
import { motion } from 'framer-motion'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui'

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Прокручивать к верху при смене страницы */
  scrollToTop?: boolean
}

/**
 * Генерация номеров страниц с эллипсисами.
 */
const getPageNumbers = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)
  return pages
}

/**
 * Универсальный компонент пагинации.
 */
export const PaginationControls: FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  scrollToTop = false,
}) => {
  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    onPageChange(page)
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                if (currentPage > 1) handlePageChange(currentPage - 1)
              }}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {getPageNumbers(currentPage, totalPages).map((pageNum, idx) =>
            pageNum === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === pageNum}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    handlePageChange(pageNum)
                  }}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                if (currentPage < totalPages) handlePageChange(currentPage + 1)
              }}
              className={
                currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  )
}
