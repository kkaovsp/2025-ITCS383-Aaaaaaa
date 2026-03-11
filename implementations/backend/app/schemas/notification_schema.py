from pydantic import BaseModel

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str
