from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
from datetime import datetime


class Email(Base):
    __tablename__ = 'emails'

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(100))
    message = Column(Text)
    recipient = Column(String(100))
    sender = Column(String(100))
    status = Column(String(100))
    sent_at = Column(DateTime)
    error_message = Column(Text, nullable=True)
