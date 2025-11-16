'use client'

import { Button } from '@/components/ui/Button'

interface CSVExportButtonProps {
  data: Array<Record<string, any>>
  filename: string
  headers: string[]
}

export function CSVExportButton({ data, filename, headers }: CSVExportButtonProps) {
  const exportToCSV = () => {
    const csvContent = [
      headers.join(','),
      ...data.map((item, index) => {
        const values = [
          index + 1,
          ...headers.slice(1).map((header) => {
            const key = header.toLowerCase().replace(' ', '')
            return item[key] || item[header] || ''
          }),
        ]
        return values.map((v) => `"${v}"`).join(',')
      }),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" size="sm" onClick={exportToCSV}>
      Export CSV
    </Button>
  )
}

