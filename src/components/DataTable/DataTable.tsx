// src/App.tsx
import { useEffect, useState } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../../App.css';
import { Button } from 'primereact/button';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function MyDataTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Fetch data
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}page=${page}`);
        const data = await response.json();
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, [page]);

  // Page change handler
  const onPageChange = (event: DataTablePageEvent) => {
    const nextPage = event.page ? event.page + 1 : 1;
    setPage(nextPage);
  };

  // Toggle single row selection
  const toggleRowSelection = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (checked) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  // Check if a row is selected
  const isSelected = (id: number) => selectedIds.has(id);

  // Header checkbox (select all on page)
  const headerCheckboxTemplate = () => {
    const allOnPageSelected =
      artworks.length > 0 && artworks.every((a) => isSelected(a.id));

    return (
      <div style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          aria-label="select-all"
          checked={allOnPageSelected}
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedIds((prev) => {
              const copy = new Set(prev);
              artworks.forEach((a) => {
                if (checked) copy.add(a.id);
                else copy.delete(a.id);
              });
              return copy;
            });
          }}
        />
      </div>
    );
  };

  // Row checkbox
  const rowCheckboxTemplate = (rowData: Artwork) => {
    const checked = isSelected(rowData.id);
    return (
      <div style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => toggleRowSelection(rowData.id, e.target.checked)}
        />
      </div>
    );
  };

  // Debug info
  const selectedList = Array.from(selectedIds).join(', ');

  useEffect(() => {
    console.log('selectedIds', selectedIds);
  }, [selectedIds]);

  return (
    <div className="table-container">
      <h2>🎨 Artworks Table</h2>

      <div className="table-wrapper">
        <DataTable
          key={Array.from(selectedIds).join(',')} // ✅ Forces re-render when selection changes
          value={artworks}
          loading={loading}
          paginator
          rows={12}
          totalRecords={totalRecords}
          lazy
          onPage={onPageChange}
          first={(page - 1) * 12}
          responsiveLayout="scroll"
          className="custom-table"
          dataKey="id"
        >
          <Column
            header={headerCheckboxTemplate}
            body={rowCheckboxTemplate}
            style={{ width: '3rem', textAlign: 'center' }}
          />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist Display" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Selected IDs: {selectedList || 'None'}
      </p>
    </div>
  );
}

export default MyDataTable;
