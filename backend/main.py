from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Site-416 Banking API", version="0.2.0")

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


class User(BaseModel):
    id: str
    name: str
    role: str = Field(pattern="^(PLAYER|FACTION|ADMIN)$")
    account_id: Optional[str] = None
    faction_id: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


class Account(BaseModel):
    id: str
    owner_name: str
    type: str = Field(pattern="^(PERSONAL|FACTION)$")
    balance: float
    is_frozen: bool
    account_number: str
    last_audit_at: str
    tax_rate: float
    audit_status: str = Field(pattern="^(VERIFIED|PENDING|FAILED)$")


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


class Signer(BaseModel):
    id: str
    name: str
    role: str


class FactionVault(BaseModel):
    id: str
    name: str
    account_id: str
    balance: float
    monthly_transfers: int
    authorized_signers: List[Signer]


class AdminAction(BaseModel):
    id: str
    action: str
    target: str
    reason: str
    status: str
    timestamp: str


class AdminActionCreate(BaseModel):
    action: str
    target: str
    reason: str
    amount: Optional[float] = None


class WatchlistItem(BaseModel):
    account: str
    note: str


class TaxRules(BaseModel):
    personal_rate: float
    faction_rate: float
    updated_at: str


class TaxRulesUpdate(BaseModel):
    personal_rate: float
    faction_rate: float


class ComplianceStats(BaseModel):
    transactions_scanned: int
    flags_opened: int
    resolved_alerts: int


class PublicStats(BaseModel):
    registered_users: int
    active_players: int
    tracked_transfers_percent: int
    personal_accounts: int
    faction_vaults: int
    frozen_accounts: int
    last_audit_sync_minutes: int
    flagged_accounts: int
    tax_policies: int
    admin_actions_today: int


PERSONAL_ACCOUNT = Account(
    id="acc-001",
    owner_name="Operative K-92",
    type="PERSONAL",
    balance=12480.0,
    is_frozen=False,
    account_number="416-00982",
    last_audit_at="2026-02-23T20:10:00Z",
    tax_rate=0.03,
    audit_status="VERIFIED",
)

FACTION_ACCOUNT = Account(
    id="acc-fac-013",
    owner_name="MTF Gamma-13 Vault",
    type="FACTION",
    balance=84200.0,
    is_frozen=False,
    account_number="416-FA-013",
    last_audit_at="2026-02-23T19:00:00Z",
    tax_rate=0.05,
    audit_status="VERIFIED",
)

ADMIN_ACCOUNT = Account(
    id="acc-admin-001",
    owner_name="Site-416 Administration",
    type="PERSONAL",
    balance=2300.0,
    is_frozen=False,
    account_number="416-ADM-001",
    last_audit_at="2026-02-23T18:45:00Z",
    tax_rate=0.0,
    audit_status="VERIFIED",
)

ACCOUNTS: Dict[str, Account] = {
    PERSONAL_ACCOUNT.id: PERSONAL_ACCOUNT,
    FACTION_ACCOUNT.id: FACTION_ACCOUNT,
    ADMIN_ACCOUNT.id: ADMIN_ACCOUNT,
}

PERSONAL_TRANSACTIONS: List[Transaction] = [
    Transaction(
        id="TX-44821",
        source_account_id="acc-payroll",
        destination_account_id=PERSONAL_ACCOUNT.id,
        amount=3400.0,
        type="DEPOSIT",
        timestamp="2026-02-09T08:14:00Z",
        description="Foundation payroll",
        status="COMPLETED",
    ),
    Transaction(
        id="TX-44820",
        source_account_id=PERSONAL_ACCOUNT.id,
        destination_account_id="acc-alpha-19",
        amount=1200.0,
        type="TRANSFER",
        timestamp="2026-02-09T07:42:00Z",
        description="Supplies",
        status="COMPLETED",
    ),
    Transaction(
        id="TX-44819",
        source_account_id=PERSONAL_ACCOUNT.id,
        destination_account_id="acc-treasury",
        amount=120.0,
        type="TAX",
        timestamp="2026-02-08T19:42:00Z",
        description="Automated tax",
        status="COMPLETED",
    ),
]

FACTION_TRANSACTIONS: List[Transaction] = [
    Transaction(
        id="FX-9921",
        source_account_id=FACTION_ACCOUNT.id,
        destination_account_id="acc-supply",
        amount=4500.0,
        type="TRANSFER",
        timestamp="2026-02-11T12:10:00Z",
        description="Containment supply",
        status="COMPLETED",
    ),
    Transaction(
        id="FX-9920",
        source_account_id="acc-council",
        destination_account_id=FACTION_ACCOUNT.id,
        amount=12000.0,
        type="DEPOSIT",
        timestamp="2026-02-10T09:20:00Z",
        description="Council budget",
        status="COMPLETED",
    ),
    Transaction(
        id="FX-9919",
        source_account_id=FACTION_ACCOUNT.id,
        destination_account_id="acc-treasury",
        amount=600.0,
        type="TAX",
        timestamp="2026-02-09T16:05:00Z",
        description="Monthly tax",
        status="COMPLETED",
    ),
]

ADMIN_TRANSACTIONS: List[Transaction] = [
    Transaction(
        id="TX-ADM-1",
        source_account_id="acc-treasury",
        destination_account_id=ADMIN_ACCOUNT.id,
        amount=2300.0,
        type="DEPOSIT",
        timestamp="2026-02-09T10:00:00Z",
        description="Operational budget",
        status="COMPLETED",
    )
]

TRANSACTIONS_BY_ACCOUNT: Dict[str, List[Transaction]] = {
    PERSONAL_ACCOUNT.id: PERSONAL_TRANSACTIONS,
    FACTION_ACCOUNT.id: FACTION_TRANSACTIONS,
    ADMIN_ACCOUNT.id: ADMIN_TRANSACTIONS,
}

FACTION_SIGNERS = [
    Signer(id="signer-iris", name="Commander Iris", role="Primary signer"),
    Signer(id="signer-novak", name="Lt. Novak", role="Co-signer"),
    Signer(id="signer-hana", name="Ops Chief Hana", role="Auditor"),
]

FACTION_VAULT = FactionVault(
    id="faction-gamma-13",
    name="MTF Gamma-13 Vault",
    account_id=FACTION_ACCOUNT.id,
    balance=FACTION_ACCOUNT.balance,
    monthly_transfers=len(FACTION_TRANSACTIONS),
    authorized_signers=FACTION_SIGNERS,
)

ADMIN_ACTIONS: List[AdminAction] = [
    AdminAction(
        id="AD-1209",
        action="Account freeze",
        target="Operative J-14",
        reason="Suspicious transfers",
        status="APPROVED",
        timestamp="2026-02-12T15:15:00Z",
    ),
    AdminAction(
        id="AD-1208",
        action="Balance adjustment",
        target="Gamma-13 Vault",
        reason="Raid reward correction",
        status="APPROVED",
        timestamp="2026-02-12T11:02:00Z",
    ),
    AdminAction(
        id="AD-1207",
        action="Tax rule update",
        target="Faction accounts",
        reason="Inflation control",
        status="PENDING",
        timestamp="2026-02-11T18:33:00Z",
    ),
]

WATCHLIST: List[WatchlistItem] = [
    WatchlistItem(account="Delta-4 Logistics", note="Rapid accumulation"),
    WatchlistItem(account="Operative K-92", note="High outbound volume"),
    WatchlistItem(account="Site-416 Vault", note="Manual review"),
]

TAX_RULES = TaxRules(
    personal_rate=0.03,
    faction_rate=0.05,
    updated_at="2026-02-20T14:40:00Z",
)

COMPLIANCE_STATS = ComplianceStats(
    transactions_scanned=4208,
    flags_opened=6,
    resolved_alerts=4,
)

PUBLIC_STATS = PublicStats(
    registered_users=10000,
    active_players=2000,
    tracked_transfers_percent=100,
    personal_accounts=8462,
    faction_vaults=128,
    frozen_accounts=14,
    last_audit_sync_minutes=3,
    flagged_accounts=6,
    tax_policies=3,
    admin_actions_today=12,
)

USERS = {
    "demo": {
        "password": "demo123",
        "user": User(
            id="user-demo",
            name="Operative K-92",
            role="PLAYER",
            account_id=PERSONAL_ACCOUNT.id,
        ),
    },
    "faction": {
        "password": "faction123",
        "user": User(
            id="user-faction",
            name="Gamma-13 Command",
            role="FACTION",
            account_id=FACTION_ACCOUNT.id,
            faction_id=FACTION_VAULT.id,
        ),
    },
    "admin": {
        "password": "admin123",
        "user": User(
            id="user-admin",
            name="Site-416 Oversight",
            role="ADMIN",
            account_id=ADMIN_ACCOUNT.id,
        ),
    },
}

TOKEN_INDEX: Dict[str, str] = {}


def issue_token(username: str) -> str:
    token = f"token-{username}"
    TOKEN_INDEX[token] = username
    return token


def require_user(authorization: Optional[str] = Header(None)) -> User:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    username = TOKEN_INDEX.get(token)
    if not username or username not in USERS:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return USERS[username]["user"]


def require_faction(user: User = Depends(require_user)) -> User:
    if user.role != "FACTION":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faction role required")
    return user


def require_admin(user: User = Depends(require_user)) -> User:
    if user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user


def execute_transaction(account_id: str, payload: CreateTransaction) -> Transaction:
    account = ACCOUNTS.get(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.is_frozen:
        raise HTTPException(status_code=403, detail="Account is frozen")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if payload.amount > account.balance:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    account.balance -= payload.amount
    new_tx = Transaction(
        id=f"TX-{uuid4().hex[:6].upper()}",
        source_account_id=account.id,
        destination_account_id=payload.destination_account_id,
        amount=payload.amount,
        type=payload.type,
        timestamp=datetime.now(timezone.utc).isoformat(),
        description=payload.description,
        status="COMPLETED",
    )
    TRANSACTIONS_BY_ACCOUNT.setdefault(account.id, []).insert(0, new_tx)
    return new_tx


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/stats", response_model=PublicStats)
def get_public_stats() -> PublicStats:
    return PUBLIC_STATS


@app.post("/api/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    record = USERS.get(payload.username)
    if not record or record["password"] != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = issue_token(payload.username)
    return LoginResponse(access_token=token, user=record["user"])


@app.get("/api/me", response_model=User)
def get_me(user: User = Depends(require_user)) -> User:
    return user


@app.get("/api/accounts/me", response_model=Account)
def get_account_me(user: User = Depends(require_user)) -> Account:
    if not user.account_id or user.account_id not in ACCOUNTS:
        raise HTTPException(status_code=404, detail="Account not found")
    return ACCOUNTS[user.account_id]


@app.get("/api/transactions/me", response_model=List[Transaction])
def get_transactions_me(user: User = Depends(require_user)) -> List[Transaction]:
    if not user.account_id:
        return []
    return TRANSACTIONS_BY_ACCOUNT.get(user.account_id, [])


@app.post("/api/transactions", response_model=Transaction)
def create_transaction(
    payload: CreateTransaction, user: User = Depends(require_user)
) -> Transaction:
    if not user.account_id:
        raise HTTPException(status_code=404, detail="Account not found")
    return execute_transaction(user.account_id, payload)


@app.get("/api/factions/me", response_model=FactionVault)
def get_faction_me(_: User = Depends(require_faction)) -> FactionVault:
    FACTION_VAULT.balance = ACCOUNTS[FACTION_ACCOUNT.id].balance
    FACTION_VAULT.monthly_transfers = len(TRANSACTIONS_BY_ACCOUNT.get(FACTION_ACCOUNT.id, []))
    return FACTION_VAULT


@app.get("/api/factions/me/transactions", response_model=List[Transaction])
def get_faction_transactions_me(_: User = Depends(require_faction)) -> List[Transaction]:
    return TRANSACTIONS_BY_ACCOUNT.get(FACTION_ACCOUNT.id, [])


@app.post("/api/factions/transactions", response_model=Transaction)
def create_faction_transaction(
    payload: CreateTransaction, _: User = Depends(require_faction)
) -> Transaction:
    return execute_transaction(FACTION_ACCOUNT.id, payload)


@app.get("/api/admin/actions", response_model=List[AdminAction])
def get_admin_actions(_: User = Depends(require_admin)) -> List[AdminAction]:
    return ADMIN_ACTIONS


@app.post("/api/admin/actions", response_model=AdminAction)
def create_admin_action(
    payload: AdminActionCreate, _: User = Depends(require_admin)
) -> AdminAction:
    reason = payload.reason
    if payload.amount is not None:
        reason = f"{reason} (Amount: {payload.amount})"
    new_action = AdminAction(
        id=f"AD-{uuid4().hex[:4].upper()}",
        action=payload.action,
        target=payload.target,
        reason=reason,
        status="PENDING",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    ADMIN_ACTIONS.insert(0, new_action)
    return new_action


@app.get("/api/admin/watchlist", response_model=List[WatchlistItem])
def get_watchlist(_: User = Depends(require_admin)) -> List[WatchlistItem]:
    return WATCHLIST


@app.get("/api/admin/tax-rules", response_model=TaxRules)
def get_tax_rules(_: User = Depends(require_admin)) -> TaxRules:
    return TAX_RULES


@app.put("/api/admin/tax-rules", response_model=TaxRules)
def update_tax_rules(
    payload: TaxRulesUpdate, _: User = Depends(require_admin)
) -> TaxRules:
    TAX_RULES.personal_rate = payload.personal_rate
    TAX_RULES.faction_rate = payload.faction_rate
    TAX_RULES.updated_at = datetime.now(timezone.utc).isoformat()
    return TAX_RULES


@app.get("/api/admin/compliance", response_model=ComplianceStats)
def get_compliance_stats(_: User = Depends(require_admin)) -> ComplianceStats:
    return COMPLIANCE_STATS
