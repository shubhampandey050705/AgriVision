# backend/blueprints/fields.py
from flask import Blueprint, request, jsonify, abort
from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from db import SessionLocal
from models import Field as FieldModel

# ⛔️ DO NOT pass strict_slashes here
bp = Blueprint("fields", __name__, url_prefix="/api/fields")

class FieldIn(BaseModel):
    name: str
    area: float | None = None
    soilType: str | None = None
    irrigation: str | None = None
    village: str | None = None

def row_to_dict(row: FieldModel):
    return {
        "id": row.id,
        "name": row.name,
        "area": row.area,
        "soilType": row.soilType,
        "irrigation": row.irrigation,
        "village": row.village,
    }

def _get_or_404(db, field_id: int) -> FieldModel:
    row = db.get(FieldModel, field_id)
    if not row:
        abort(404, description=f"Field {field_id} not found")
    return row

# Accept both /api/fields and /api/fields/
@bp.route("", methods=["GET"])
@bp.route("/", methods=["GET"])
def list_fields():
    with SessionLocal() as db:
        rows = db.execute(select(FieldModel)).scalars().all()
        return jsonify([row_to_dict(r) for r in rows])

@bp.route("", methods=["POST"])
@bp.route("/", methods=["POST"])
def create_field():
    try:
        data = FieldIn.model_validate_json(request.data)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    with SessionLocal() as db:
        m = FieldModel(**data.model_dump())
        db.add(m); db.commit(); db.refresh(m)
        resp = jsonify(row_to_dict(m))
        resp.status_code = 201
        resp.headers["Location"] = f"/api/fields/{m.id}"
        return resp

# Accept both /api/fields/1 and /api/fields/1/
@bp.route("/<int:field_id>", methods=["GET", "PATCH", "DELETE"])
@bp.route("/<int:field_id>/", methods=["GET", "PATCH", "DELETE"])
def field_detail(field_id: int):
    with SessionLocal() as db:
        if request.method == "GET":
            return jsonify(row_to_dict(_get_or_404(db, field_id)))
        if request.method == "PATCH":
            row = _get_or_404(db, field_id)
            payload = request.get_json(silent=True) or {}
            for k in ("name", "area", "soilType", "irrigation", "village"):
                if k in payload:
                    setattr(row, k, payload[k])
            db.commit(); db.refresh(row)
            return jsonify(row_to_dict(row))
        # DELETE
        row = _get_or_404(db, field_id)
        db.delete(row); db.commit()
        return ("", 204)
