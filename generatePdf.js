const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { PDFDocument, rgb } = require('pdf-lib');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Set this in GitHub Secrets
});

async function generateSummaryPDF() {
  const incidentsPath = path.join(__dirname, 'incidents.json');
  const incidentsData = fs.readFileSync(incidentsPath, 'utf-8');
  const incidents = JSON.parse(incidentsData);

  let allSummaries = '';

  for (const incident of incidents) {
    const prompt = `Summarize the following ServiceNow incident:\n\n${JSON.stringify(incident, null, 2)}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = response.choices[0].message.content;
    allSummaries += `Incident ID: ${incident.id}\nSummary: ${summary}\n\n`;
  }

  // Create a PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const fontSize = 12;
  const { width, height } = page.getSize();
  page.drawText(allSummaries.slice(0, 4000), {
    x: 50,
    y: height - 50,
    size: fontSize,
    color: rgb(0, 0, 0),
    lineHeight: 16
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(__dirname, 'incident_summaries.pdf'), pdfBytes);
  console.log('✅ PDF Generated: incident_summaries.pdf');
}

generateSummaryPDF().catch(console.error);
