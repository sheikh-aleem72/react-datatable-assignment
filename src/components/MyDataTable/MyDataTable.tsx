import { useEffect, useRef, useState } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../../App.css';
import { FaChevronDown } from 'react-icons/fa';
import { OverlayPanel } from 'primereact/overlaypanel';

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
  const [rowCount, setRowCount] = useState<number>(0);
  const [autoSelectMap, setAutoSelectMap] = useState<Record<number, number>>({});
  const rowsPerPage = 12;

  const overlayRef = useRef<OverlayPanel>(null);

  //  Fetch Data (Pagination)
  // ---------------------------
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

  // ---------------------------
  //  Handle Page Change
  // ---------------------------
  const onPageChange = (event: DataTablePageEvent) => {
    const nextPage = event.page ? event.page + 1 : 1;
    setPage(nextPage);
  };

  // Row Selection Logic
  // ---------------------------
  const toggleRowSelection = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (checked) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  const isSelected = (id: number) => selectedIds.has(id);

  // Select-All + Overlay Logic
  // ---------------------------
  const handleSelectFirstN = (e: React.FormEvent) => {
    e.preventDefault();
    if (rowCount <= 0) return;

    const newMap: Record<number, number> = {};
    let remaining = rowCount;

    // Calculate how many rows per page should be selected
    for (let p = 1; remaining > 0; p++) {
      const count = Math.min(rowsPerPage, remaining);
      newMap[p] = count;
      remaining -= count;
    }

    setAutoSelectMap(newMap);

    // Reset rowCount value in input field
    setRowCount(0);
    overlayRef.current?.hide();

    //  If current page is part of the selection map, apply immediately
    if (newMap[page]) {
      const rowsToSelect = artworks.slice(0, newMap[page]);
      setSelectedIds((prev) => {
        const copy = new Set(prev);
        rowsToSelect.forEach((r) => copy.add(r.id));
        return copy;
      });

    // remove current page from the autoSelectMap (since job is done)
    setAutoSelectMap((prev) => {
      const copy = { ...prev };
      delete copy[page];
      return copy;
    });      
    }
  };

  // Apply Auto-Selection on Page Load
  // ---------------------------
  useEffect(() => {
    const count = autoSelectMap[page];
    if (!count) return;

    const rowsToSelect = artworks.slice(0, count);

    setSelectedIds((prev) => {
      const copy = new Set(prev);
      rowsToSelect.forEach((r) => copy.add(r.id));
      return copy;
    });

    // remove current page from the autoSelectMap (since job is done)
    setAutoSelectMap((prev) => {
      const copy = { ...prev };
      delete copy[page];
      return copy;
    });

    }, [artworks,]);

    // Header Checkbox Template
    // ---------------------------
    const headerCheckboxTemplate = () => {
    const allOnPageSelected =
      artworks.length > 0 && artworks.every((a) => isSelected(a.id));

    return (
      <div className='header-checkbox' >
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
        <button
          type="button"
          className="btn"
          onClick={(e) => overlayRef.current?.toggle(e)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <FaChevronDown />
        </button>

        <OverlayPanel ref={overlayRef}>
          <form className="row-count-container" onSubmit={handleSelectFirstN}>
            <input
              type="number"
              placeholder="Enter rows to select..."
              value={rowCount || ''}
              onChange={(e) => setRowCount(Number(e.target.value))}
            />
            <button type="submit">Submit</button>
          </form>
        </OverlayPanel>
      </div>
    );
  };

  // ---------------------------
  // Row Checkbox Template
  const rowCheckboxTemplate = (rowData: Artwork) => {
    const checked = isSelected(rowData.id);
    return (
      <div className='row-checkbox' style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => toggleRowSelection(rowData.id, e.target.checked)}
        />
      </div>
    );
  };

  return (
    <div className="table-container">
      <h2>Artworks Table</h2>

      <div className="table-wrapper">
        <DataTable
          key={Array.from(selectedIds).join(',')}
          value={artworks}
          loading={loading}
          paginator
          rows={rowsPerPage}
          totalRecords={totalRecords}
          lazy
          onPage={onPageChange}
          first={(page - 1) * rowsPerPage}
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
    </div>
  );
}

export default MyDataTable;
