"""Generate deterministic synthetic ProofPay documents and transactions."""

from __future__ import annotations

import json
from copy import deepcopy
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


def _rename_documents(transaction: dict[str, Any], suffix: str) -> None:
    """Give a derived scenario unique document IDs while preserving references."""

    transaction["transaction_id"] = f"TXN-{suffix}"
    transaction["po"]["po_id"] = f"PO-{suffix}"
    transaction["invoice"]["invoice_id"] = f"INV-{suffix}"
    transaction["invoice"]["po_ref"] = transaction["po"]["po_id"]
    transaction["grn"]["grn_id"] = f"GRN-{suffix}"
    transaction["grn"]["po_ref"] = transaction["po"]["po_id"]
    transaction["delivery_proof"]["proof_id"] = f"DC-{suffix}"
    transaction["delivery_proof"]["ref_id"] = transaction["invoice"]["invoice_id"]
    if transaction["acceptance_proof"] is not None:
        transaction["acceptance_proof"]["proof_id"] = f"AC-{suffix}"
        transaction["acceptance_proof"]["ref_id"] = transaction["invoice"]["invoice_id"]
    normalized_suffix = suffix.replace("-", "")
    transaction["gst_info"]["gstin"] = f"27{normalized_suffix}ABCDE1234F1Z5"[:15]
    transaction["invoice"]["gstin"] = transaction["gst_info"]["gstin"]


def quantity_mismatch_transaction() -> dict[str, Any]:
    """Return the planned 100 ordered/invoiced versus 92 received scenario."""

    transaction = deepcopy(clean_match_transaction())
    _rename_documents(transaction, "QTY-001")
    transaction["grn"]["line_items"][0]["qty_received"] = 92
    return transaction


def price_mismatch_transaction() -> dict[str, Any]:
    """Return a scenario where the invoice rate is higher than the PO rate."""

    transaction = deepcopy(clean_match_transaction())
    _rename_documents(transaction, "PRICE-001")
    transaction["invoice"]["line_items"][0]["rate"] = 550
    transaction["invoice"]["line_items"][0]["amount"] = 55000
    transaction["invoice"]["total_amount"] = 55000
    return transaction


def date_mismatch_transaction() -> dict[str, Any]:
    """Return a scenario delivered outside the 30-day delivery window."""

    transaction = deepcopy(clean_match_transaction())
    _rename_documents(transaction, "DATE-001")
    transaction["grn"]["date"] = "2026-09-15"
    transaction["delivery_proof"]["date"] = "2026-09-15"
    return transaction


def missing_evidence_transaction() -> dict[str, Any]:
    """Return a clean transaction with customer acceptance evidence absent."""

    transaction = deepcopy(clean_match_transaction())
    _rename_documents(transaction, "MISS-001")
    transaction["acceptance_proof"] = None
    return transaction


SCENARIOS = {
    "clean": clean_match_transaction,
    "qty_mismatch": quantity_mismatch_transaction,
    "price_mismatch": price_mismatch_transaction,
    "date_mismatch": date_mismatch_transaction,
    "missing_evidence": missing_evidence_transaction,
}


def generate_synthetic_docs() -> list[Path]:
    """Write one fixture for every documented synthetic-data category."""

    generated_paths = []
    for category, scenario_builder in SCENARIOS.items():
        output_path = REPOSITORY_ROOT / "data" / "synthetic" / category / "txn_1.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8") as output_file:
            json.dump(scenario_builder(), output_file, indent=2)
            output_file.write("\n")
        generated_paths.append(output_path)
    return generated_paths


def generate_clean_match() -> Path:
    """Write the clean-match transaction and return its path."""

    return generate_synthetic_docs()[0]


if __name__ == "__main__":
    for generated_path in generate_synthetic_docs():
        print(f"Generated {generated_path}")
