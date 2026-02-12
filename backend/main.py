from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Site-416 Banking API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class Account(BaseModel):
    id: str
    owner_name: str
    type: str = Field(pattern="^(PERSONAL|FACTION)$")
    balance: float
    is_frozen: bool
    account_number: str


class Transaction(BaseModel):
    id: str
    source_account_id: Optional[str]
    destination_account_id: str
    amount: float
    type: str
    timestamp: str
    description: Optional[str] = None
    status: str = "COMPLETED"


class CreateTransaction(BaseModel):
    destination_account_id: str
    amount: float
    type: str = "TRANSFER"
    description: Optional[str] = None


DEMO_TOKEN = "demo"

ACCOUNT = Account(
    id="acc-001",
    owner_name="Operative K-92",
    type="PERSONAL",
    balance=12480.0,
    is_frozen=False,
    account_number="416-00982",
)

TRANSACTIONS: List[Transaction] = [
    Transaction(
        id="TX-44821",
        source_account_id="acc-payroll",
        destination_account_id=ACCOUNT.id,
        amount=3400.0,
        type="DEPOSIT",
        timestamp="2026-02-09T08:14:00Z",
        description="Foundation payroll",
        status="COMPLETED",
    ),
    Transaction(
        id="TX-44820",
        source_account_id=ACCOUNT.id,
        destination_account_id="acc-alpha-19",
        amount=1200.0,
        type="TRANSFER",
        timestamp="2026-02-09T07:42:00Z",
        description="Supplies",
        status="COMPLETED",
    ),
    Transaction(
        id="TX-44819",
        source_account_id=ACCOUNT.id,
        destination_account_id="acc-treasury",
        amount=120.0,
        type="TAX",
        timestamp="2026-02-08T19:42:00Z",
        description="Automated tax",
        status="COMPLETED",
    ),
]


def require_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != DEMO_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return token


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    if payload.username != "demo" or payload.password != "demo123":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return LoginResponse(
        access_token=DEMO_TOKEN,
        user={"id": "user-demo", "name": "Operative K-92"},
    )


@app.get("/api/accounts/me", response_model=Account)
def get_account_me(_: str = Depends(require_token)) -> Account:
    return ACCOUNT


@app.get("/api/transactions/me", response_model=List[Transaction])
def get_transactions_me(_: str = Depends(require_token)) -> List[Transaction]:
    return TRANSACTIONS


@app.post("/api/transactions", response_model=Transaction)
def create_transaction(
    payload: CreateTransaction, _: str = Depends(require_token)
) -> Transaction:
    if ACCOUNT.is_frozen:
        raise HTTPException(status_code=403, detail="Account is frozen")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if payload.amount > ACCOUNT.balance:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    ACCOUNT.balance -= payload.amount
    new_tx = Transaction(
        id=f"TX-{uuid4().hex[:6].upper()}",
        source_account_id=ACCOUNT.id,
        destination_account_id=payload.destination_account_id,
        amount=payload.amount,
        type=payload.type,
        timestamp=datetime.now(timezone.utc).isoformat(),
        description=payload.description,
        status="COMPLETED",
    )
    TRANSACTIONS.insert(0, new_tx)
    return new_tx
