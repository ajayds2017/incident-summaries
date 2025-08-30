import fs from 'fs';
import PDFDocument from 'pdfkit';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Read incidents.json
const incidents = fs.readFileSync('incident.json', 'utf-8');

// 2. Ask OpenAI for summary
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are an assistant that summarizes incident logs." },
    { role: "user", content: `Summarize this incidents.json into an executive summary, counts by priority, and list of top 5 incidents:\n${incidents}` }
  ]
});

const summaryText = response.choices[0].message.content;

// 3. Generate PDF
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('incident_summary.pdf'));
doc.fontSize(18).text('Incident Summary Report', { align: 'center' });
doc.moveDown().fontSize(12).text(summaryText);
doc.end();
