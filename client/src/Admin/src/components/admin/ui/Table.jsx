import styles from "./Table.module.css";

export default function Table({ columns = [], data = [], rowKey = "id", emptyText = "No records found." }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className={styles.empty}>{emptyText}</td></tr>
          ) : data.map((row) => (
            <tr key={row[rowKey] || JSON.stringify(row)}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
