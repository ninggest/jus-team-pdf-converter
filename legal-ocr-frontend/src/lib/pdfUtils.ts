import { PDFDocument } from 'pdf-lib';

/**
 * Splits a PDF file into multiple files if it exceeds the max size.
 * @param file The PDF file to split
 * @param maxSizeMB Threshold in MB (default 20MB to be safe and fast)
 * @returns A promise that resolves to an array of Files
 */
export async function splitLargePdf(file: File, maxSizeMB: number = 50): Promise<File[]> {
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return [file];
    }

    console.log(`Splitting large PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    if (pageCount <= 1) {
        // Single page file too large, nothing we can do but return as is and let API fail or try
        return [file];
    }

    const estimatedPageSize = file.size / pageCount;
    let maxPagesPerChunk = Math.max(1, Math.floor((maxSizeMB * 1024 * 1024 * 0.9) / estimatedPageSize));

    const results: File[] = [];
    let currentStart = 0;
    let partIndex = 1;

    while (currentStart < pageCount) {
        let currentEnd = Math.min(currentStart + maxPagesPerChunk, pageCount);

        // Create new PDF for this chunk
        const subDoc = await PDFDocument.create();
        const pagesToCopy = Array.from({ length: currentEnd - currentStart }, (_, i) => currentStart + i);
        const copiedPages = await subDoc.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach((page) => subDoc.addPage(page));

        const pdfBytes = await subDoc.save();

        // If the saved chunk is still too large, we binary search down
        if (pdfBytes.length > maxSizeMB * 1024 * 1024 && (currentEnd - currentStart) > 1) {
            // Re-adjust for next iteration: half the pages
            console.warn(`Chunk still too large (${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB), shrinking...`);
            // We update the global maxPagesPerChunk to ensure the next iteration (via continue) uses a smaller range
            maxPagesPerChunk = Math.max(1, Math.floor((currentEnd - currentStart) / 2));
            // Re-try with smaller range
            continue;
        }

        const partName = `${file.name.replace(/\.pdf$/i, '')}_part${partIndex}.pdf`;
        results.push(new File([pdfBytes as any], partName, { type: 'application/pdf' }));

        currentStart = currentEnd;
        partIndex++;
    }

    console.log(`PDF split into ${results.length} parts`);
    return results;
}
