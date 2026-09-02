"""Regression tests for the deterministic synthetic reconciliation scenarios."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from types import SimpleNamespace
import unittest

from app.reconciliation.rules import reconcile_documents
from app.services.acceptance_pack import build_acceptance_pack
from app.services.draft_message import build_draft_message


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


def _as_namespace(value):
    document = dict(value)
    if "date" in document:
        document["date"] = date.fromisoformat(document["date"])
    return SimpleNamespace(**document)


def _load_transaction(category: str):
    path = REPOSITORY_ROOT / "data" / "synthetic" / category / "txn_1.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    return SimpleNamespace(
        transaction_id=data["transaction_id"],
        po=_as_namespace(data["po"]),
        invoice=_as_namespace(data["invoice"]),
        grn=_as_namespace(data["grn"]),
        delivery_proof=(
            _as_namespace(data["delivery_proof"])
            if data["delivery_proof"] is not None
            else None
        ),
        acceptance_proof=(
            _as_namespace(data["acceptance_proof"])
            if data["acceptance_proof"] is not None
            else None
        ),
        gst_info=(_as_namespace(data["gst_info"]) if data["gst_info"] is not None else None),
    )


class ReconciliationScenarioTests(unittest.TestCase):
    def test_clean_match_is_verified(self):
        result = reconcile_documents(_load_transaction("clean"))

        self.assertEqual(result["verdict"], "verified")
        self.assertEqual(result["readiness_score"], 100)
        self.assertEqual(result["flags"], [])
        self.assertEqual(result["missing_evidence"], [])
        self.assertIsNone(result["draft_message"])

    def test_quantity_mismatch_is_source_linked_and_scores_92(self):
        result = reconcile_documents(_load_transaction("qty_mismatch"))

        self.assertEqual(result["verdict"], "risk")
        self.assertEqual(result["readiness_score"], 92)
        self.assertEqual(result["flags"], [{
            "field": "quantity",
            "po_value": 100,
            "grn_value": 92,
            "invoice_value": 100,
            "discrepancy_type": "quantity_mismatch",
            "amount_at_risk": 4000,
            "source_docs": ["GRN-QTY-001", "INV-QTY-001"],
        }])

    def test_price_mismatch_is_flagged(self):
        result = reconcile_documents(_load_transaction("price_mismatch"))

        self.assertEqual(result["verdict"], "risk")
        self.assertEqual(result["readiness_score"], 90)
        self.assertEqual(result["flags"][0]["field"], "price")
        self.assertEqual(result["flags"][0]["amount_at_risk"], 5000)
        self.assertEqual(result["flags"][0]["source_docs"], ["PO-PRICE-001", "INV-PRICE-001"])

    def test_date_mismatch_is_flagged(self):
        result = reconcile_documents(_load_transaction("date_mismatch"))

        self.assertEqual(result["verdict"], "risk")
        self.assertEqual(len(result["flags"]), 2)
        self.assertTrue(all(flag["field"] == "date" for flag in result["flags"]))
        self.assertTrue(all(flag["source_docs"] for flag in result["flags"]))

    def test_missing_acceptance_is_partial(self):
        result = reconcile_documents(_load_transaction("missing_evidence"))

        self.assertEqual(result["verdict"], "partial")
        self.assertEqual(result["readiness_score"], 85)
        self.assertEqual(result["missing_evidence"], ["customer_acceptance"])
        self.assertIsNotNone(result["draft_message"])

    def test_acceptance_pack_preserves_reconciliation_output(self):
        result = reconcile_documents(_load_transaction("clean"))

        pack = build_acceptance_pack(result)

        self.assertEqual(
            pack,
            {
                "transaction_id": "TXN-001",
                "summary": {"verdict": "verified", "readiness_score": 100},
                "flags": [],
                "missing_evidence": [],
                "recommended_action": result["recommended_action"],
                "draft_message": None,
            },
        )

    def test_draft_message_can_be_regenerated_for_a_recipient(self):
        result = reconcile_documents(_load_transaction("qty_mismatch"))

        message = build_draft_message(result, "Accounts Payable")

        self.assertIn("Dear Accounts Payable,", message)
        self.assertIn("quantity mismatch (PO 100, GRN 92, invoice 100)", message)
        self.assertIn("TXN-QTY-001", message)


if __name__ == "__main__":
    unittest.main()
