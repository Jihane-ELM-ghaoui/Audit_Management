from logging import getLogger
from datetime import datetime

user_action_logger = getLogger("user_action")

def log_user_action(username: str, action: str, details: str = "") -> dict:
    timestamp = datetime.now().isoformat()
    message = f"User: {username} | Action: {action} | Details: {details}"
    user_action_logger.info(message)
    return {
        "username": username,
        "action": action,
        "details": details,
        "timestamp": timestamp
    }

