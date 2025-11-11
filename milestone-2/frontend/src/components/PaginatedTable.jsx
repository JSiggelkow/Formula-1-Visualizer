import { useState } from "react";
import { Table, Pagination, Group, Text, Stack } from "@mantine/core";

const ITEMS_PER_PAGE = 20;

const PaginatedTable = ({
  data = [],
  columns = [],
  striped = true,
  highlightOnHover = true,
  title,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  if (data.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No data available
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {title && (
        <Text size="lg" fw={600}>
          {title}
        </Text>
      )}

      <Table striped={striped} highlightOnHover={highlightOnHover}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column.key}>{column.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {currentData.map((row, rowIndex) => (
            <Table.Tr key={rowIndex}>
              {columns.map((column) => (
                <Table.Td key={`${rowIndex}-${column.key}`}>
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of{" "}
            {data.length} entries
          </Text>

          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            size="sm"
          />
        </Group>
      )}
    </Stack>
  );
};

export default PaginatedTable;
