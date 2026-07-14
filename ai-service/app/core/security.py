import os
import base64
from fastapi import Header, HTTPException
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

async def verify_service_auth(x_service_key: str = Header(...)):
    if x_service_key != settings.service_auth_key.get_secret_value():
        raise HTTPException(status_code=401, detail="Invalid service key")
    return True

def get_aesgcm() -> AESGCM:
    key_bytes = settings.encryption_master_key.get_secret_value().encode("utf-8")
    if len(key_bytes) < 32:
        key_bytes = key_bytes.ljust(32, b'0')
    elif len(key_bytes) > 32:
        key_bytes = key_bytes[:32]
    return AESGCM(key_bytes)

def encrypt_key(plaintext: str) -> str:
    aesgcm = get_aesgcm()
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    return base64.b64encode(nonce + ciphertext).decode('utf-8')

def decrypt_key(encrypted_payload: str) -> str:
    aesgcm = get_aesgcm()
    payload = base64.b64decode(encrypted_payload)
    nonce, ciphertext = payload[:12], payload[12:]
    return aesgcm.decrypt(nonce, ciphertext, None).decode('utf-8')
