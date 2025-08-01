// generatePdf.js

const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Configuration, OpenAIApi } = require('openai');

// 1. Read incidents.json
const incidentsData = JSON.parse(fs.readFileSync('incidents.json', 'utf8'));

// 2. Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 3. Create PDF Document
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('incident_summary.pdf'));

(async () => {
  doc.fontSize(20).text('Incident Summary Report', { align: 'center' }).moveDown();

  for (const [index, incident] of incidentsData.entries()) {
    const incidentPrompt = `
You are an ITSM assistant. Summarize this ServiceNow incident in a formal, clear way:
Incident Data:
${JSON.stringify(incident, null, 2)}
`;

    // 4. Call OpenAI API
    let summary = 'Summary not generated.';
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You summarize incident data for IT support teams.' },
          { role: 'user', content: incidentPrompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      summary = response.data.choices[0].message.content.trim();
    } catch (err) {
      console.error('OpenAI Error:', err.message);
    }

    // 5. Add to PDF
    doc.addPage();
    doc.fontSize(16).text(`Incident ${index + 1}`, { underline: true }).moveDown();
    doc.fontSize(12).text(summary);
  }

  // 6. Finalize PDF
  doc.end();
})();
