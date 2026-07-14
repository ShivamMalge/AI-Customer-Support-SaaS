from fastapi import HTTPException

class CreditExhaustedException(HTTPException):
    def __init__(self, detail: str = "Daily credit limit exhausted"):
        super().__init__(status_code=402, detail=detail)

class KeyInvalidException(HTTPException):
    def __init__(self, detail: str = "Provider key is invalid"):
        super().__init__(status_code=424, detail=detail)
