from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_engineer_can_create_draft_but_cannot_approve() -> None:
    created = client.post("/reports", headers={"X-Demo-Role": "Engineer"}, json={"title": "Change readiness", "evidence_ids": ["doc-change"]})
    assert created.status_code == 201
    response = client.post(f"/reports/{created.json()['id']}/approve", headers={"X-Demo-Role": "Engineer"})
    assert response.status_code == 403


def test_reviewer_can_approve_a_draft() -> None:
    created = client.post("/reports", headers={"X-Demo-Role": "Engineer"}, json={"title": "Reviewer test", "evidence_ids": ["doc-runbook"]})
    response = client.post(f"/reports/{created.json()['id']}/approve", headers={"X-Demo-Role": "Reviewer"})
    assert response.status_code == 200
    assert response.json()["status"] == "Approved"
