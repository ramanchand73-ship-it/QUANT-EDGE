import { jsPDF } from 'jspdf';
import { JournalEntry } from '../types/quant';

export function exportJournalToPDF(entries: JournalEntry[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper for page break checking
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('QuantEdge — NIFTY 50 Qualitative Trade Discipline Journal', margin, 8);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 8, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 10, pageWidth - margin, 10);
  };

  // --- Title & Header ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('QuantEdge Trade Journal & Discipline Audit', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('National Stock Exchange (NSE) Qualitative Reflections & Psychological Audit Report', margin + 6, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(34, 211, 238); // Cyan 400
  doc.text(`Total Logged Trades: ${entries.length}`, pageWidth - margin - 6, y + 16, { align: 'right' });

  y += 29;

  // --- Summary Metrics Box ---
  const totalPnl = entries.reduce((sum, e) => sum + e.pnl, 0);
  const winCount = entries.filter(e => e.pnl > 0).length;
  const winRate = entries.length > 0 ? (winCount / entries.length) * 100 : 0;
  const followedPlanCount = entries.filter(e => e.followedPlan).length;
  const disciplineScore = entries.length > 0 ? (followedPlanCount / entries.length) * 100 : 0;
  const avgRating = entries.length > 0 ? (entries.reduce((sum, e) => sum + e.disciplineRating, 0) / entries.length) : 0;
  const fomoCount = entries.filter(e => e.emotionState === 'FOMO' || e.emotionState === 'Revenge Trade').length;

  doc.setFillColor(248, 250, 252); // Light background
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  const colW = contentWidth / 4;
  
  // Col 1: Total PnL
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL LOGGED P&L', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (totalPnl >= 0) {
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`+INR ${totalPnl.toLocaleString()}`, margin + 4, y + 15);
  } else {
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(`-INR ${Math.abs(totalPnl).toLocaleString()}`, margin + 4, y + 15);
  }

  // Col 2: Discipline Score
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DISCIPLINE SCORE', margin + colW + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(`${disciplineScore.toFixed(0)}% Plan Adherence`, margin + colW + 4, y + 15);

  // Col 3: Win Rate
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('WIN RATE & TRADES', margin + colW * 2 + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${winRate.toFixed(1)}% (${winCount}/${entries.length})`, margin + colW * 2 + 4, y + 15);

  // Col 4: Execution Rating & FOMO
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AVG DISCIPLINE RATING', margin + colW * 3 + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(`${avgRating.toFixed(1)} / 5.0 (${fomoCount} FOMO)`, margin + colW * 3 + 4, y + 15);

  y += 28;

  // Section Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Chronological Trade Reflections & Discipline Audit', margin, y);
  y += 5;

  // --- Render Each Journal Entry ---
  entries.forEach((entry, index) => {
    // Estimate height needed for this card
    const rationaleLines = doc.splitTextToSize(entry.preTradeRationale || 'N/A', contentWidth - 10);
    const reflectionLines = doc.splitTextToSize(entry.postTradeReflection || 'N/A', contentWidth - 10);
    const lessonLines = doc.splitTextToSize(entry.lessonsLearned || 'N/A', contentWidth - 10);

    const cardHeight = 36 + (rationaleLines.length + reflectionLines.length + lessonLines.length) * 4.2;

    checkPageBreak(cardHeight);

    // Card background box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 1.5, 1.5, 'FD');

    // Left color bar indicating PnL
    if (entry.pnl >= 0) {
      doc.setFillColor(16, 185, 129); // Green bar
    } else {
      doc.setFillColor(225, 29, 72); // Red bar
    }
    doc.rect(margin, y, 2.5, cardHeight, 'F');

    // Header within card
    const cardContentX = margin + 5;
    let cardY = y + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. [${entry.tradeType}] ${entry.symbol}`, cardContentX, cardY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${entry.date}  |  ID: ${entry.id}`, cardContentX + 55, cardY);

    // PnL & Plan on Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    if (entry.pnl >= 0) {
      doc.setTextColor(16, 185, 129);
      doc.text(`+INR ${entry.pnl.toLocaleString()}`, pageWidth - margin - 5, cardY, { align: 'right' });
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text(`-INR ${Math.abs(entry.pnl).toLocaleString()}`, pageWidth - margin - 5, cardY, { align: 'right' });
    }

    cardY += 5;

    // Subheader details (Strategy, Prices, Emotion, Quality)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Strategy: ${entry.strategyUsed}`, cardContentX, cardY);
    doc.text(`Entry: INR ${entry.entryPrice}  |  Exit: INR ${entry.exitPrice}  |  Qty: ${entry.quantity}`, cardContentX + 75, cardY);

    cardY += 4.5;

    // Badges line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`Emotion: ${entry.emotionState}`, cardContentX, cardY);

    doc.setTextColor(180, 83, 9); // Amber
    doc.text(`Setup: Grade ${entry.setupQuality}`, cardContentX + 40, cardY);

    if (entry.followedPlan) {
      doc.setTextColor(16, 185, 129);
      doc.text('Plan: Followed (YES)', cardContentX + 75, cardY);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text('Plan: Violated (NO)', cardContentX + 75, cardY);
    }

    doc.setTextColor(217, 119, 6);
    doc.text(`Discipline: ${entry.disciplineRating}/5 Stars`, cardContentX + 115, cardY);

    doc.setTextColor(100, 116, 139);
    doc.text(`Regime: ${entry.marketRegime}`, cardContentX + 150, cardY);

    cardY += 5;

    // Pre-Trade Rationale
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Pre-Trade Rationale & Edge:', cardContentX, cardY);
    cardY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(rationaleLines, cardContentX, cardY);
    cardY += rationaleLines.length * 3.8;

    // Post-Trade Reflection
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Post-Trade Reflection & Psychology:', cardContentX, cardY);
    cardY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(reflectionLines, cardContentX, cardY);
    cardY += reflectionLines.length * 3.8;

    // Key Lessons Learned
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // Amber
    doc.text('Key Discipline Rule / Lesson:', cardContentX, cardY);
    cardY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(lessonLines, cardContentX, cardY);
    cardY += lessonLines.length * 3.8;

    // Tags & Checklist line
    if (entry.tags && entry.tags.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Tags: ${entry.tags.map(t => `#${t}`).join(', ')}  |  Checklist Score: ${entry.checklistItems.filter(c => c.checked).length}/${entry.checklistItems.length}`, cardContentX, cardY);
    }

    y += cardHeight + 4;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'QuantEdge — For educational analysis, model evaluation, and personal trading discipline audit.',
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Save the PDF file
  const filename = `QuantEdge_Trade_Discipline_Journal_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
