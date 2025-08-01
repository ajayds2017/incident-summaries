const fs = require('fs');
const { jsPDF } = require('jspdf');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require("openai");

async function generatePDF() {
  try {
    const rawData = fs.readFileSync('incidents.json');
    const parsed = JSON.parse(rawData);
    const incidents = Array.isArray(parsed) ? parsed : parsed.incidents;

    const doc = new jsPDF();

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    for (let i = 0; i < incidents.length; i++) {
      const incident = incidents[i];

      const summaryResponse = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Summarize this IT incident in plain language.",
          },
          {
            role: "user",
            content: `${incident.title}: ${incident.description}`,
          }
        ],
        temperature: 0.3
      });

      const summary = summaryResponse.data.choices[0].message.content;

      const y = 10 + i * 60;
      doc.text(`Incident #${i + 1}`, 10, y);
      doc.text(`ID: ${incident.id}`, 10, y + 10);
      doc.text(`Title: ${incident.title}`, 10, y + 20);
      doc.text(`Severity: ${incident.severity}`, 10, y + 30);
      doc.text(`Summary: ${summary}`, 10, y + 40);
    }

    doc.save('incident_summary.pdf');
    console.log("PDF generated.");
  } catch (err) {
    console.error("PDF generation failed:", err.message);
    process.exit(1);
  }
}

generatePDF(); // ← Don't forget to actually run the function
