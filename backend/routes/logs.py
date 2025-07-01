from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime

router = APIRouter()

@router.get("/user-actions")
def get_user_action_logs():
    log_path = Path("logs/user_actions.log")
    if not log_path.exists():
        raise HTTPException(status_code=404, detail="Fichier log introuvable")

    logs = []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            lines = f.readlines()[-100:]  # Dernières 100 lignes

        for line in lines:
            # Exemple de ligne :
            # [2025-06-26 09:20:12,123] [INFO] user_action: User: admin | Action: Création d’audit | Details: ...
            parts = line.strip().split("] ")
            timestamp_raw = parts[0].replace("[", "")
            message_part = parts[-1]

            if "User:" in message_part and "Action:" in message_part:
                try:
                    # Convertit le timestamp en format ISO 8601
                    dt = datetime.strptime(timestamp_raw, "%Y-%m-%d %H:%M:%S,%f")
                    timestamp_iso = dt.isoformat()
                except ValueError:
                    # fallback si microsecondes absentes
                    dt = datetime.strptime(timestamp_raw, "%Y-%m-%d %H:%M:%S")
                    timestamp_iso = dt.isoformat()

                user = message_part.split("User: ")[1].split(" |")[0].strip()
                action = message_part.split("Action: ")[1].split(" |")[0].strip()

                logs.append({
                    "timestamp": timestamp_iso,
                    "username": user,
                    "action": action
                })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lecture logs: {str(e)}")

    return JSONResponse(content=logs[::-1])
