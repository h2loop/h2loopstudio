// PdfViewer.js
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PdfViewer = ({ pdfData }: { pdfData: any }) => {
  const [pages, setPages] = useState(0)
  return (
    <div
      style={{ height: '75vh', width: '100%', overflow: 'auto', scale: 0.7 }}
    >
      <Document
        file={pdfData}
        onLoadSuccess={({ numPages }) => {
          setPages(numPages)
        }}
      >
        {Array.from(new Array(pages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  )
}

export default PdfViewer
