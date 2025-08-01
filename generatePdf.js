const fs = require('fs');
const { jsPDF } = require('jspdf');
const { default: fetch } = require('node-fetch'); // needed for newer node versions

(async () => {
  try {
    const rawData = fs.readFileSync('incidents.json');
    const parsed = JSON.parse(rawData);
    const incidents = Array.isArray(parsed) ? parsed : parsed.incidents;

    if (!Array.isArray(incidents)) {
      throw new Error("Incidents data is not an array.");
    }

    const doc = new jsPDF();

    incidents.forEach((incident, index) => {
      const y = 10 + index * 60;
      doc.text(`Incident #${index + 1}`, 10, y);
      doc.text(`ID: ${incident.id}`, 10, y + 10);
      doc.text(`Title: ${incident.title}`, 10, y + 20);
      doc.text(`Description: ${incident.description}`, 10, y + 30);
      doc.text(`Severity: ${incident.severity}`, 10, y + 40);
    });

    doc.save('incident_summary.pdf');
    console.log('PDF generated');
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  }
})();
