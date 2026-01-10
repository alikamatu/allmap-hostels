import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param columns Optional column mapping (key: data key, label: display name)
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  columns?: Array<{ key: string; label: string }>
) => {
  try {
    // Format data if columns are provided
    const formattedData = columns
      ? data.map(item => {
          const formattedItem: Record<string, any> = {};
          columns.forEach(col => {
            // Handle nested properties (e.g., 'hostel.name')
            const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
            formattedItem[col.label] = value ?? '';
          });
          return formattedItem;
        })
      : data;

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`, {
      bookType: 'xlsx',
      type: 'array',
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};