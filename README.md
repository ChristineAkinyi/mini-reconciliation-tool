# Mini Reconciliation Tool

A React app to compare transaction data from your internal system and payment provider CSV exports — highlighting matches, mismatches, and missing transactions.

## Features

- Upload two CSV files (Internal & Provider)  
- Compare transactions by `transaction_reference`  
- Highlight mismatches in amount and status  
- Categorize transactions as matched, internal-only, or provider-only  
- Export comparison results as CSV files  
- Responsive UI with loading indicators

## How to Use

1. Upload the **Internal System Export** CSV file  
2. Upload the **Provider Statement** CSV file  
3. Click **Compare Transactions**  
4. View the categorized results with highlighted mismatches  
5. Optionally, export any category as a CSV

## Assumptions

- Input CSVs contain headers: `transaction_reference`, `amount`, `status`  
- Files are small enough to parse client-side  
- Modern browser required (for file API and React support)

## Tech Stack

- React (functional components + hooks)  
- PapaParse for CSV parsing  
- react-csv for CSV export

## Possible Improvements

- Backend integration for larger files and persistence  
- Authentication and user management  
- Support for Excel files and other formats  
- Advanced filtering and sorting
