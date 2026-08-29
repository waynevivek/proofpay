"""Generate deterministic synthetic ProofPay documents and transactions."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = REPOSITORY_ROOT / "data" / "synthetic" / "clean" / "txn_1.json"


def clean_match_transaction() -> dict[str, Any]:
    """Return one complete, internally consistent clean-match transaction."""

    return {
        "transaction_id": "TXN-001",
        "po": {
            "po_id": "PO-2208",
            "date": "2026-08-01",
            "buyer": "Acme Manufacturing Pvt Ltd",
            "supplier": "SteelWorks India Pvt Ltd",
            "line_items": [
                {
                    "item": "Steel rods",
                    "qty": 100,
                    "rate": 500,
                    "amount": 50000,
                }
            ],
            "total_amount": 50000,
        },
        "invoice": {
            "invoice_id": "INV-9911",
            "po_ref": "PO-2208",
            "date": "2026-08-11",
            "gstin": "27ABCDE1234F1Z5",
            "line_items": [
                {
                    "item": "Steel rods",
                    "qty": 100,
                    "rate": 500,
                    "amount": 50000,
                }
            ],
            "total_amount": 50000,
        },
        "grn": {
            "grn_id": "GRN-4471",
            "po_ref": "PO-2208",
            "date": "2026-08-10",
            "line_items": [
                {
                    "item": "Steel rods",
                    "qty_received": 100,
                }
            ],
            "receiving_party": "Acme Manufacturing Warehouse",
        },
        "delivery_proof": {
            "proof_id": "DC-1187",
            "ref_id": "INV-9911",
            "type": "delivery",
            "date": "2026-08-10",
            "signed_by": "Ravi Kumar",
            "status": "present",
        },
        "acceptance_proof": {
            "proof_id": "AC-1187",
            "ref_id": "INV-9911",
            "type": "acceptance",
            "date": "2026-08-11",
            "signed_by": "Neha Sharma",
            "status": "present",
        },
        "gst_info": {
            "gstin": "27ABCDE1234F1Z5",
            "validity_status": "valid",
        },
        "status": "uploaded",
    }


def generate_clean_match() -> Path:
    """Write the clean-match transaction and return its path."""

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as output_file:
        json.dump(clean_match_transaction(), output_file, indent=2)
        output_file.write("\n")
    return OUTPUT_PATH


if __name__ == "__main__":
    print(f"Generated {generate_clean_match()}")
