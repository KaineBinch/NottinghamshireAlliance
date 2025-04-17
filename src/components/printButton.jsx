// PrintButton component
import { Printer } from "lucide-react"
import "./printButton.css"

const PrintButton = ({ contentId }) => {
  const handlePrint = () => {
    const contentToPrint = document.getElementById(contentId)
    if (!contentToPrint) {
      console.error(`Element with id '${contentId}' not found`)
      return
    }

    const originalContent = document.body.innerHTML
    const printContent = contentToPrint.innerHTML

    const printStyles = `
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .event-header {
          margin-bottom: 20px;
        }
        .event-title {
          font-size: 24px;
          font-weight: bold;
        }
        .event-type {
          font-size: 18px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        .event-date {
          font-size: 16px;
        }
        .results-sections {
          page-break-inside: avoid;
        }
        .tab-button, .tabs-navigation, .results-search-filter, 
        .section-divider, .section-title, .read-more-button, .read-less-button {
          display: none !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        /* Fix flex layout for teams in print view */
        .flex.flex-col.md\\:flex-row {
          display: flex !important;
          flex-direction: row !important;
        }
        
        .md\\:flex-1 {
          flex: 1 !important;
          width: 50% !important;
          padding: 0 5px !important;
        }
        
        .md\\:gap-3 {
          gap: 10px !important;
        }
        
        @media print {
          /* Table headers - gray-300 with black text */
          th, tr.bg-\\[\\#214A27\\], .bg-\\[\\#214A27\\] {
            background-color: #e2e8f0 !important; /* gray-300 */
            color: black !important;
            font-weight: bold !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          h3 {
            color: #214A27 !important;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          @page {
            margin: 0.5cm;
          }
          
          body {
            padding: 25px;
          }
          
          table th, table td {
            padding: 4px !important; /* Override any other padding */
          }
          
          .mb-5 {
            margin-bottom: 10px !important;
          }
        }
      </style>
    `

    // Replace body content with just what we want to print
    document.body.innerHTML = printStyles + printContent

    // Print
    window.print()

    // Restore original content
    document.body.innerHTML = originalContent

    // Reload to restore event handlers
    window.location.reload()
  }

  return (
    <button
      onClick={handlePrint}
      className="print-button"
      title="Print Results">
      <Printer size={20} />
      <span>Print Results</span>
    </button>
  )
}

export default PrintButton
