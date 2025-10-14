// src/App.tsx
import { useEffect, useState } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';

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

  const onPageChange = (event: DataTablePageEvent) => {
    const nextPage = event.page ? event.page + 1 : 1;
    setPage(nextPage);
  };

  return (
    <div className="table-container">

        <h2>Data Table</h2>

      <div className="table-wrapper">
        <DataTable
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
        >
          <Column field="title" header="Title"  />
          <Column field="place_of_origin" header="Place of Origin"  />
          <Column field="artist_display" header="Artist Display" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start"  />
          <Column field="date_end" header="Date End"  />
        </DataTable>
      </div>
    </div>
  );
}

export default MyDataTable;
