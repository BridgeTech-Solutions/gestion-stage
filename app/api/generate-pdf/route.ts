import PDFDocument from "pdfkit"

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    
    // Créer un document PDF
    const doc = new PDFDocument()
    const buffers: Buffer[] = []
    
    // Capturer les données du PDF
    doc.on('data', buffers.push.bind(buffers))
    
    // Ajouter le contenu au PDF
    doc.fontSize(12).text(content)
    
    // Finaliser le PDF
    doc.end()
    
    // Attendre que toutes les données soient capturées
    const pdfData = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers))
      })
    })
