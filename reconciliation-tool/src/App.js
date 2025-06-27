
import React, { useState } from "react";
import Papa from "papaparse";
import { CSVLink } from "react-csv";

function App() {
  const [internalData, setInternalData] = useState([]);
  const [providerData, setProviderData] = useState([]);
  const [comparison, setComparison] = useState({
    matched: [],
    internalOnly: [],
    providerOnly: [],
  });
  const [isComparing, setIsComparing] = useState(false);

  const handleFileUpload = (e, setData) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // Remove extra spaces
      complete: (results) => {
        console.log('CSV Headers:', results.meta.fields);
        console.log('First few rows:', results.data.slice(0, 3));
        setData(results.data);
      },
    });
  };

  const clearUpload = (setData, inputId) => {
    setData([]);
    setComparison({
      matched: [],
      internalOnly: [],
      providerOnly: [],
    });
    // Clear the file input
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const compareTransactions = () => {
    if (internalData.length === 0 || providerData.length === 0) {
      alert("Please upload both CSV files first before comparing.");
      return;
    }
    
    setIsComparing(true);
    const internalMap = new Map(
      internalData.map((tx) => [tx.transaction_reference, tx]),
    );
    const providerMap = new Map(
      providerData.map((tx) => [tx.transaction_reference, tx]),
    );

    const matched = [];
    const internalOnly = [];
    const providerOnly = [];

    internalMap.forEach((internalTx, ref) => {
      const providerTx = providerMap.get(ref);
      if (providerTx) {
        const mismatchAmount = internalTx.amount !== providerTx.amount;
        const mismatchStatus = internalTx.status !== providerTx.status;

        matched.push({
          transaction_reference: ref,
          internalTx,
          providerTx,
          mismatchAmount,
          mismatchStatus,
        });
        providerMap.delete(ref);
      } else {
        internalOnly.push(internalTx);
      }
    });

    providerMap.forEach((providerTx) => {
      providerOnly.push(providerTx);
    });

    setComparison({ matched, internalOnly, providerOnly });
    setIsComparing(false);
    
    // Show completion message
    setTimeout(() => {
      alert(`Comparison completed!\n\n✅ Matched: ${matched.length}\n⚠️ Internal Only: ${internalOnly.length}\n❌ Provider Only: ${providerOnly.length}`);
    }, 100);
  };

  const renderMatchedTransactions = () =>
    comparison.matched.map(
      ({
        transaction_reference,
        internalTx,
        providerTx,
        mismatchAmount,
        mismatchStatus,
      }) => (
        <tr
          key={transaction_reference}
          style={{
            backgroundColor:
              mismatchAmount || mismatchStatus ? "#fff3cd" : "transparent",
          }}
        >
          <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{transaction_reference || '-'}</td>
          <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{internalTx?.amount || '-'}</td>
          <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{internalTx?.status || '-'}</td>
          <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{providerTx?.amount || '-'}</td>
          <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{providerTx?.status || '-'}</td>
          <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>
            {mismatchAmount && (
              <span style={{ color: "#dc3545", fontWeight: "600" }}>Amount mismatch</span>
            )}
            {mismatchStatus && (
              <span style={{ color: "#dc3545", marginLeft: 8, fontWeight: "600" }}>
                Status mismatch
              </span>
            )}
            {!mismatchAmount && !mismatchStatus && <span style={{ color: "#28a745", fontWeight: "600" }}>✓ OK</span>}
          </td>
        </tr>
      ),
    );

  const renderSimpleRows = (data) =>
    data.map((tx, i) => (
      <tr key={tx.transaction_reference || i}>
        <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{tx.transaction_reference || '-'}</td>
        <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{tx.amount || '-'}</td>
        <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>{tx.status || '-'}</td>
      </tr>
    ));

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e9ecef"
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)"
  };

  const inputStyle = {
    padding: "8px 12px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "14px",
    marginLeft: "8px",
    transition: "border-color 0.2s"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  };

  const headerStyle = {
    backgroundColor: "#f8f9fa",
    fontWeight: "600",
    textAlign: "left",
    padding: "16px 12px",
    borderBottom: "2px solid #dee2e6"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={cardStyle}>
          <h1 style={{ 
            color: "#343a40", 
            marginBottom: "8px", 
            fontSize: "32px",
            fontWeight: "700"
          }}>
            📊 Mini Reconciliation Tool
          </h1>
          <p style={{ color: "#6c757d", marginBottom: "24px", fontSize: "16px" }}>
            Upload and compare transaction data from internal systems and provider statements
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", color: "#495057", marginBottom: "8px" }}>
                Internal System Export CSV
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  id="internal-file-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, setInternalData)}
                  style={inputStyle}
                />
                {internalData.length > 0 && (
                  <button
                    onClick={() => clearUpload(setInternalData, 'internal-file-input')}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {internalData.length > 0 && (
                <div style={{ color: "#28a745", fontSize: "14px", marginTop: "4px" }}>
                  ✓ {internalData.length} transactions loaded
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", color: "#495057", marginBottom: "8px" }}>
                Provider Statement CSV
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  id="provider-file-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, setProviderData)}
                  style={inputStyle}
                />
                {providerData.length > 0 && (
                  <button
                    onClick={() => clearUpload(setProviderData, 'provider-file-input')}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {providerData.length > 0 && (
                <div style={{ color: "#28a745", fontSize: "14px", marginTop: "4px" }}>
                  ✓ {providerData.length} transactions loaded
                </div>
              )}
            </div>
          </div>

          <button
            onClick={compareTransactions}
            disabled={isComparing}
            style={{
              ...buttonStyle,
              backgroundColor: isComparing ? "#6c757d" : "#007bff",
              cursor: isComparing ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => {
              if (!isComparing) e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseOut={(e) => {
              if (!isComparing) e.target.style.backgroundColor = "#007bff";
            }}
          >
            {isComparing ? "🔄 Comparing..." : "🔍 Compare Transactions"}
          </button>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: "#28a745", marginBottom: "16px", fontSize: "24px", fontWeight: "600" }}>
            ✅ Matched Transactions ({comparison.matched.length})
          </h2>
          {comparison.matched.length > 0 ? (
            <>
              <CSVLink
                data={comparison.matched.map(
                  ({ transaction_reference, internalTx, providerTx }) => ({
                    transaction_reference,
                    internal_amount: internalTx.amount,
                    internal_status: internalTx.status,
                    provider_amount: providerTx.amount,
                    provider_status: providerTx.status,
                  }),
                )}
                filename={"matched_transactions.csv"}
                style={{ 
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "16px", 
                  display: "inline-block" 
                }}
              >
                📥 Export as CSV
              </CSVLink>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerStyle}>Transaction Ref</th>
                    <th style={headerStyle}>Internal Amount</th>
                    <th style={headerStyle}>Internal Status</th>
                    <th style={headerStyle}>Provider Amount</th>
                    <th style={headerStyle}>Provider Status</th>
                    <th style={headerStyle}>Remarks</th>
                  </tr>
                </thead>
                <tbody>{renderMatchedTransactions()}</tbody>
              </table>
            </>
          ) : (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>No matched transactions yet.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: "#ffc107", marginBottom: "16px", fontSize: "24px", fontWeight: "600" }}>
            ⚠️ Present only in Internal file ({comparison.internalOnly.length})
          </h2>
          {comparison.internalOnly.length > 0 ? (
            <>
              <CSVLink
                data={comparison.internalOnly}
                filename={"internal_only_transactions.csv"}
                style={{ 
                  backgroundColor: "#ffc107",
                  color: "#212529",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "16px", 
                  display: "inline-block" 
                }}
              >
                📥 Export as CSV
              </CSVLink>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerStyle}>Transaction Ref</th>
                    <th style={headerStyle}>Amount</th>
                    <th style={headerStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>{renderSimpleRows(comparison.internalOnly)}</tbody>
              </table>
            </>
          ) : (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>No internal-only transactions.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: "#dc3545", marginBottom: "16px", fontSize: "24px", fontWeight: "600" }}>
            ❌ Present only in Provider file ({comparison.providerOnly.length})
          </h2>
          {comparison.providerOnly.length > 0 ? (
            <>
              <CSVLink
                data={comparison.providerOnly}
                filename={"provider_only_transactions.csv"}
                style={{ 
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "16px", 
                  display: "inline-block" 
                }}
              >
                📥 Export as CSV
              </CSVLink>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerStyle}>Transaction Ref</th>
                    <th style={headerStyle}>Amount</th>
                    <th style={headerStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>{renderSimpleRows(comparison.providerOnly)}</tbody>
              </table>
            </>
          ) : (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>No provider-only transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
