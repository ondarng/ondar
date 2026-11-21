"use client";

import React, { useState, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";

interface ParsedProductRow {
  name: string;
  category?: string;
  priceNaira: number;
  costNaira?: number;
  stockQuantity: number;
  description?: string;
  imageUrls?: string;
  isValid: boolean;
  validationError?: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProducts: any[]) => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'name,category,price_naira,cost_naira,stock_quantity,description,image_urls\n' +
      '"Classic Cotton Oversized T-Shirt","Clothing & Fashion",14500,8000,30,"100% combed cotton comfortable everyday tee","https://images.unsplash.com/photo-1521572267360-ee0c2909d518"\n' +
      '"Premium Leather Crossbody Bag","Bags & Accessories",35000,20000,12,"Handcrafted genuine leather minimalist bag","https://images.unsplash.com/photo-1548036328-c9fa89d128fa"\n' +
      '"Matte Black Ceramic Mug","Home & Living",6500,3500,50,"350ml heat-resistant ceramic coffee mug",""';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ondar_products_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. CSV Parser
  const parseCSVText = (text: string): ParsedProductRow[] => {
    const lines: string[] = [];
    let currentLine = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = "";
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    if (lines.length <= 1) {
      return [];
    }

    // Helper to parse individual CSV line respecting quotes
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = [];
      let cur = "";
      let inQuote = false;

      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuote = !inQuote;
        } else if (c === "," && !inQuote) {
          values.push(cur.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
          cur = "";
        } else {
          cur += c;
        }
      }
      values.push(cur.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      return values;
    };

    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    // Map column indices
    const nameIdx = header.findIndex((h) => h.includes("name") || h.includes("title"));
    const catIdx = header.findIndex((h) => h.includes("category"));
    const priceIdx = header.findIndex(
      (h) => h.includes("price") && !h.includes("cost")
    );
    const costIdx = header.findIndex((h) => h.includes("cost"));
    const stockIdx = header.findIndex(
      (h) => h.includes("stock") || h.includes("quantity") || h.includes("qty")
    );
    const descIdx = header.findIndex((h) => h.includes("desc"));
    const imgIdx = header.findIndex(
      (h) => h.includes("image") || h.includes("photo") || h.includes("url")
    );

    const rows: ParsedProductRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.every((v) => !v)) continue; // skip blank line

      const rawName = nameIdx !== -1 ? values[nameIdx] || "" : values[0] || "";
      const rawPrice = priceIdx !== -1 ? values[priceIdx] || "" : values[2] || "";
      const rawCategory = catIdx !== -1 ? values[catIdx] : values[1];
      const rawCost = costIdx !== -1 ? values[costIdx] : undefined;
      const rawStock = stockIdx !== -1 ? values[stockIdx] : values[4];
      const rawDesc = descIdx !== -1 ? values[descIdx] : undefined;
      const rawImg = imgIdx !== -1 ? values[imgIdx] : undefined;

      const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, ""));
      const cleanCost = rawCost ? parseFloat(rawCost.replace(/[^0-9.]/g, "")) : undefined;
      const cleanStock = rawStock ? parseInt(rawStock.replace(/[^0-9]/g, ""), 10) : 0;

      let isValid = true;
      let validationError: string | undefined = undefined;

      if (!rawName.trim()) {
        isValid = false;
        validationError = "Missing product name";
      } else if (isNaN(cleanPrice) || cleanPrice <= 0) {
        isValid = false;
        validationError = "Invalid price (must be > ₦0)";
      }

      rows.push({
        name: rawName.trim(),
        category: rawCategory?.trim() || undefined,
        priceNaira: isNaN(cleanPrice) ? 0 : cleanPrice,
        costNaira: isNaN(cleanCost || NaN) ? undefined : cleanCost,
        stockQuantity: isNaN(cleanStock) ? 0 : cleanStock,
        description: rawDesc?.trim() || undefined,
        imageUrls: rawImg?.trim() || undefined,
        isValid,
        validationError,
      });
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".csv") && !selected.name.endsWith(".txt")) {
      setErrorMessage("Please upload a .csv file.");
      return;
    }

    setFile(selected);
    const text = await selected.text();
    const rows = parseCSVText(text);

    if (rows.length === 0) {
      setErrorMessage("Could not find any product rows in this file. Please check the format.");
      setParsedRows([]);
      return;
    }

    setParsedRows(rows);
  };

  // 3. Submit Validated Rows
  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage("No valid products to import. Please fix the highlighted errors.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: validRows.map((r) => ({
            name: r.name,
            category: r.category,
            priceNaira: r.priceNaira,
            costNaira: r.costNaira,
            stockQuantity: r.stockQuantity,
            description: r.description,
            imageUrls: r.imageUrls,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Bulk import failed.");
      }

      onSuccess(data.createdProducts || []);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while importing products.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859]">
              <FileSpreadsheet className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900">Bulk Product Upload</h2>
              <p className="text-xs text-neutral-500">Add multiple products via CSV spreadsheet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Download Sample Template Banner */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-900">Need the standard spreadsheet format?</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Download our ready-made CSV template with sample data.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-800 transition-colors shadow-2xs cursor-pointer flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#00A859]" />
              <span>Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-200 hover:border-[#00A859] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAFCFB]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00A859] mx-auto flex items-center justify-center mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-neutral-900">
              {file ? file.name : "Click to select or drag your CSV file here"}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Supports UTF-8 CSV with headers</p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Validation Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-700">Preview ({parsedRows.length} items found)</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px]">
                    ✓ {validCount} valid
                  </span>
                  {errorCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-[10px]">
                      ⚠ {errorCount} errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                {parsedRows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center justify-between text-xs ${
                      row.isValid ? "bg-white" : "bg-red-50/50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-neutral-900 truncate">
                        {row.name || "<No name>"}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {row.category || "Uncategorized"} · {row.stockQuantity} in stock
                      </p>
                      {row.validationError && (
                        <p className="text-[10px] font-bold text-red-600 mt-0.5">
                          {row.validationError}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-neutral-900">
                        ₦{row.priceNaira.toLocaleString()}
                      </p>
                      {row.isValid ? (
                        <span className="text-[10px] text-[#00A859] font-bold">Ready</span>
                      ) : (
                        <span className="text-[10px] text-red-600 font-bold">Fix</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || validCount === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white shadow-2xs transition-all ${
              validCount > 0 && !isSubmitting
                ? "bg-[#00A859] hover:bg-[#00964E] cursor-pointer"
                : "bg-neutral-300 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Import {validCount > 0 ? `${validCount} Products` : "Products"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
