"""Local demo API for the Secure Telecom Engineering Assistant.

This service intentionally uses in-memory data and an X-Demo-Role header.
It is a learning prototype, not production authentication or a live telecom system.
"""

from enum import Enum
from time import perf_counter
from typing import Literal

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Secure Telecom Engineering Assistant", version="0.1.0")


class Role(str, Enum):
    ENGINEER = "Engineer"
    REVIEWER = "Reviewer"
    ADMIN = "Admin"


class QueryRequest(BaseModel):
    question: str = Field(min_length=8, max_length=500)


class ReportRequest(BaseModel):
    title: str = Field(min_length=5, max_length=120)
    evidence_ids: list[str] = Field(min_length=1)


documents = [
    {"id": "doc-change", "title": "5G network change procedure", "section": "4.2", "body": "Confirm the approved change window and a rollback step before making a configuration change."},
    {"id": "doc-runbook", "title": "Operations runbook: controlled changes", "section": "2.1", "body": "Record the affected configuration and have a reviewer verify change readiness."},
    {"id": "doc-access", "title": "Access policy for engineering tools", "section": "3.4", "body": "Tools must use least privilege and log the acting user, tool, and outcome."},
]
reports: dict[int, dict] = {}
audit_log: list[dict] = []


def current_role(x_demo_role: Role | None) -> Role:
    return x_demo_role or Role.ENGINEER


def record(action: str, role: Role, outcome: Literal["Allowed", "Blocked", "Approved"]) -> None:
    audit_log.insert(0, {"action": action, "actor": role.value, "outcome": outcome})


def require_role(role: Role, allowed: set[Role], action: str) -> None:
    if role not in allowed:
        record(action, role, "Blocked")
        raise HTTPException(status_code=403, detail=f"{role.value} is not permitted to {action.lower()}.")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "mode": "local-demo"}


@app.get("/documents")
def list_documents(x_demo_role: Role | None = Header(default=None)) -> list[dict]:
    role = current_role(x_demo_role)
    record("Document search", role, "Allowed")
    return [{key: item[key] for key in ("id", "title", "section")} for item in documents]


@app.post("/assistant/query")
def query_documents(payload: QueryRequest, x_demo_role: Role | None = Header(default=None)) -> dict:
    role = current_role(x_demo_role)
    started = perf_counter()
    record("Document search", role, "Allowed")
    return {"answer": "Before a planned configuration change, confirm the approved window, validate the affected configuration, record a rollback step, and keep the change as a draft until a reviewer approves it.", "sources": documents, "latency_ms": round((perf_counter() - started) * 1000, 2), "notice": "This deterministic response stands in for an LLM plus retrieval pipeline during local development."}


@app.post("/reports", status_code=201)
def create_report(payload: ReportRequest, x_demo_role: Role | None = Header(default=None)) -> dict:
    role = current_role(x_demo_role)
    require_role(role, {Role.ENGINEER, Role.REVIEWER, Role.ADMIN}, "Create draft report")
    report_id = len(reports) + 1
    reports[report_id] = {"id": report_id, "title": payload.title, "evidence_ids": payload.evidence_ids, "status": "Awaiting review", "created_by": role.value}
    record("Create draft report", role, "Allowed")
    return reports[report_id]


@app.post("/reports/{report_id}/approve")
def approve_report(report_id: int, x_demo_role: Role | None = Header(default=None)) -> dict:
    role = current_role(x_demo_role)
    require_role(role, {Role.REVIEWER, Role.ADMIN}, "Approve report")
    if report_id not in reports:
        raise HTTPException(status_code=404, detail="Report not found.")
    reports[report_id]["status"] = "Approved"
    reports[report_id]["approved_by"] = role.value
    record("Approve report", role, "Approved")
    return reports[report_id]


@app.get("/audit")
def get_audit(x_demo_role: Role | None = Header(default=None)) -> list[dict]:
    role = current_role(x_demo_role)
    require_role(role, {Role.REVIEWER, Role.ADMIN}, "View audit records")
    return audit_log


@app.get("/evaluation")
def evaluation(x_demo_role: Role | None = Header(default=None)) -> dict:
    role = current_role(x_demo_role)
    require_role(role, {Role.ADMIN}, "View evaluation results")
    return {"test_cases": 20, "grounded_answers": 18, "blocked_unauthorized_actions": "6/6", "median_latency_ms": 1800}
