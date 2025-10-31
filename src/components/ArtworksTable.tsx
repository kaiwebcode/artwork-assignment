import { useCallback, useEffect, useRef, useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ChevronDownIcon } from "lucide-react";
import type { Artwork } from "../types/type";

const API_BASE = "https://api.artic.edu/api/v1/artworks";

export default function ArtworksTable() {
  // Table state
  const [rows, setRows] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(12);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectCount, setSelectCount] = useState<number>(0);

  // Overlay refs
  const overlayRef = useRef<OverlayPanel>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const currentPageSelection = rows.filter((r) => selectedIds.has(r.id));

  /** 🔄 Handle pagination changes */
  const onPage = (event: DataTablePageEvent) => {
    setPage(event.page! + 1);
    setRowsPerPage(event.rows!);
  };

  /** 📦 Fetch a specific page from API */
  const fetchPage = useCallback(async (pageNum: number, perPage: number) => {
    setLoading(true);

    try {
      const url = `${API_BASE}?page=${pageNum}&limit=${perPage}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`;
      const response = await fetch(url);
      const json = await response.json();

      const dataArr = (json.data ?? []) as Partial<Artwork>[];
      const total =
        json.pagination?.total ??
        (json.pagination?.total_pages
          ? json.pagination.total_pages * perPage
          : 0);

      const pageRows: Artwork[] = dataArr.map((item) => ({
        id: item.id ?? 0,
        title: item.title ?? "Untitled",
        place_of_origin: item.place_of_origin ?? "-",
        artist_display: item.artist_display ?? "-",
        inscriptions: item.inscriptions ?? "-",
        date_start: item.date_start ?? null,
        date_end: item.date_end ?? null,
      }));

      setRows(pageRows);
      setTotalRecords(total || pageRows.length);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page, rowsPerPage);
  }, [fetchPage, page, rowsPerPage]);

  /** ✅ Handle selecting a custom number of rows dynamically */
  const handleSelectRows = async () => {
    if (!selectCount || selectCount <= 0) {
      overlayRef.current?.hide();
      return;
    }

    const totalNeeded = selectCount;
    const selected = new Set<number>(selectedIds);
    let needed = totalNeeded - selected.size;
    let currentPage = 1;

    // Auto-select rows from multiple pages until count reached
    while (needed > 0) {
      const res = await fetch(
        `${API_BASE}?page=${currentPage}&limit=${rowsPerPage}&fields=id,title`
      );
      const json = await res.json();
      const dataArr = json.data ?? [];

      for (const item of dataArr) {
        if (!selected.has(item.id)) {
          selected.add(item.id);
          needed--;
          if (needed <= 0) break;
        }
      }

      if (
        !json.pagination?.total_pages ||
        currentPage >= json.pagination.total_pages
      )
        break;

      currentPage++;
    }

    setSelectedIds(selected);
    overlayRef.current?.hide();
  };

  /** 🟦 Manage selection toggle per row */
  const onSelectionChange = (newSelectionRows: Artwork[]) => {
    const newSet = new Set(selectedIds);
    rows.forEach((r) => {
      if (newSelectionRows.find((n) => n.id === r.id)) newSet.add(r.id);
      else newSet.delete(r.id);
    });
    setSelectedIds(newSet);
  };

  /** 🎨 "ID" header with dropdown to choose number of rows */
  const idHeaderWithDropdown = (
    <div
      className="flex items-center gap-1 relative"
      ref={iconRef}
    >
      <span className="text-gray-200 font-medium">ID</span>

      <div className="relative flex items-center">
        <ChevronDownIcon
          size={16}
          className="ml-1 cursor-pointer text-blue-400 hover:text-blue-500 transition-transform hover:rotate-180 duration-200"
          onClick={(e) => overlayRef.current?.toggle(e)}
        />

        <OverlayPanel
          ref={overlayRef}
          appendTo={document.body}
          dismissable
          showCloseIcon={false}
          style={{
            borderRadius: "0.6rem",
            background: "#1f2937",
            color: "white",
            padding: "1rem",
            minWidth: "220px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            marginTop: "8px",
          }}
        >
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-200 font-medium">
              Select number of rows:
            </label>

            <InputNumber
              value={selectCount}
              onValueChange={(e) => setSelectCount(e.value ?? 0)}
              placeholder="Enter number..."
              min={1}
              inputStyle={{
                width: "100%",
                background: "#374151",
                color: "white",
                border: "1px solid #4b5563",
                borderRadius: "0.4rem",
                padding: "0.4rem 0.6rem",
              }}
            />

            <Button
              label="Submit"
              onClick={handleSelectRows}
              size="small"
              className="w-full text-sm py-2 rounded-md"
              style={{ background: "#3B82F6", border: "none" }}
            />
          </div>
        </OverlayPanel>
      </div>
    </div>
  );

  return (
    // <div className="min-h-auto bg-gray-900 text-white flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-7xl bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <DataTable
          value={rows}
          paginator
          lazy
          rows={rowsPerPage}
          totalRecords={totalRecords}
          paginatorPosition="bottom"
          onPage={onPage}
          first={(page - 1) * rowsPerPage}
          loading={loading}
          selection={currentPageSelection}
          onSelectionChange={(e) => onSelectionChange(e.value)}
          selectionMode="multiple"
          dataKey="id"
          scrollHeight="480px"
          header={`Page ${page} — ${totalRecords} total (Server-side)`}
          className="text-gray-200"
        >
          <Column selectionMode="multiple" headerStyle={{ width: "4rem" }} />
          <Column field="id" header={idHeaderWithDropdown} style={{ minWidth: "5rem" }} />
          <Column field="title" header="Title" style={{ minWidth: "12rem" }} />
          <Column field="place_of_origin" header="Place" style={{ minWidth: "8rem" }} />
          <Column field="artist_display" header="Artist" style={{ minWidth: "10rem" }} />
          <Column field="inscriptions" header="Inscriptions" style={{ minWidth: "8rem" }} />
          <Column field="date_start" header="Date Start" style={{ minWidth: "8rem" }} />
          <Column field="date_end" header="Date End" style={{ minWidth: "8rem" }} />
        </DataTable>
      </div>
    // </div>
  );
}
