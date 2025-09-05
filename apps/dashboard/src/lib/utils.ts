import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string, currency: string = "EUR"): string {
  const numAmount = parseFloat(amount)
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: currency,
  }).format(numAmount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-EU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-EU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "text-gray-600 bg-gray-100"
    case "validated":
      return "text-blue-600 bg-blue-100"
    case "submitted":
      return "text-yellow-600 bg-yellow-100"
    case "accepted":
      return "text-green-600 bg-green-100"
    case "rejected":
      return "text-red-600 bg-red-100"
    case "failed":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}
