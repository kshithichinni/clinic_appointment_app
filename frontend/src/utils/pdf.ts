import jsPDF from "jspdf";

// Clinic blue: (37, 99, 235), gray for details, light blue for header underline
export function generateAppointmentPDF(appointment: {
  doctorName: string;
  specialization: string;
  dateTime: string;
  reason: string;
  patientName: string;
  appointmentId: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 40;
  let y = 70;

  // --- Title with underline and clinic blue color ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Blue header
  doc.text("Clinic Appointment Slip", left, y);

  y += 9;
  doc.setDrawColor(200, 220, 255); // light blue accent
  doc.setLineWidth(2);
  doc.line(left, y, 385, y);

  y += 30;
  doc.setFontSize(13);

  // --- Details with colored labels for emphasis ---
  const details = [
    ["Appointment ID:", appointment.appointmentId],
    ["Patient Name:", appointment.patientName],
    ["Doctor:", `Dr. ${appointment.doctorName}`],
    ["Specialization:", appointment.specialization],
    ["Date & Time:", appointment.dateTime],
    // Removed Reason from here to handle it inline below
  ];

  // Print all other fields except reason
  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // Clinic blue for labels
    doc.text(`${label}`, left, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59); // Slate/dark gray for value
    doc.text(`${value}`, left + 140, y);
    y += 24;
  });

  // --- Reason for Visit inline with label ---
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Reason for Visit:", left, y);

  doc.setFont("helvetica", "italic");
  doc.setTextColor(30, 41, 59);

  // Clip reason to max 75 characters with ellipsis if too long
  const maxReasonLength = 75;
  const reasonText =
    appointment.reason.length > maxReasonLength
      ? appointment.reason.substring(0, maxReasonLength) + "..."
      : appointment.reason;

  doc.text(reasonText, left + 140, y);

  y += 24;

  // --- Footer with line and clinic info ---
  y += 10;
  doc.setDrawColor(187, 187, 187);
  doc.setLineWidth(1);
  doc.line(left, y, 385, y);

  y += 24;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Please arrive 10 minutes early. For changes, contact the clinic at (555) 123-4567.",
    left,
    y
  );
  y += 18;
  doc.text(
    "Thank you for trusting our clinic. Wishing you good health!",
    left,
    y
  );

  // --- Optional: rounded rectangle border for extra polish ---
  doc.setDrawColor(210, 222, 235); // very light blue border
  doc.roundedRect(10, 40, 575, y - 30, 12, 12, "S");

  // Save PDF
  doc.save(`Appointment_${appointment.appointmentId}.pdf`);
}
