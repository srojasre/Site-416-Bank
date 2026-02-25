from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import uuid4

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    func,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, declarative_base, sessionmaker

app = FastAPI(title="Site-416 Banking API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", "7"))


def build_database_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    if url.startswith("postgresql") and "sslmode=" not in url:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}sslmode=require"
    return url


def connect_args_for(url: str) -> dict:
    if url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


DATABASE_URL = build_database_url()
engine = create_engine(DATABASE_URL, connect_args=connect_args_for(DATABASE_URL))
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=True)
    faction_id = Column(String, nullable=True)


class AccountModel(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True)
    owner_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    balance = Column(Float, nullable=False, default=0.0)
    is_frozen = Column(Boolean, default=False)
    account_number = Column(String, nullable=False)
    last_audit_at = Column(DateTime, nullable=False)
    tax_rate = Column(Float, nullable=False, default=0.0)
    audit_status = Column(String, nullable=False, default="VERIFIED")


class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    source_account_id = Column(String, nullable=True)
    destination_account_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="COMPLETED")


class FactionVaultModel(Base):
    __tablename__ = "faction_vaults"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)


class FactionSignerModel(Base):
    __tablename__ = "faction_signers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    faction_id = Column(String, ForeignKey("faction_vaults.id"), nullable=False)


class AdminActionModel(Base):
    __tablename__ = "admin_actions"

    id = Column(String, primary_key=True)
    action = Column(String, nullable=False)
    target = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)


class WatchlistItemModel(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account = Column(String, nullable=False)
    note = Column(String, nullable=False)


class TaxRulesModel(Base):
    __tablename__ = "tax_rules"

    id = Column(Integer, primary_key=True)
    personal_rate = Column(Float, nullable=False)
    faction_rate = Column(Float, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class ComplianceStatsModel(Base):
    __tablename__ = "compliance_stats"

    id = Column(Integer, primary_key=True)
    transactions_scanned = Column(Integer, nullable=False)
    flags_opened = Column(Integer, nullable=False)
    resolved_alerts = Column(Integer, nullable=False)


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str


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


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def to_user_schema(user: UserModel) -> User:
    return User(
        id=user.id,
        name=user.name,
        role=user.role,
        account_id=user.account_id,
        faction_id=user.faction_id,
    )


def to_account_schema(account: AccountModel) -> Account:
    return Account(
        id=account.id,
        owner_name=account.owner_name,
        type=account.type,
        balance=account.balance,
        is_frozen=account.is_frozen,
        account_number=account.account_number,
        last_audit_at=account.last_audit_at.replace(tzinfo=timezone.utc).isoformat(),
        tax_rate=account.tax_rate,
        audit_status=account.audit_status,
    )


def to_transaction_schema(tx: TransactionModel) -> Transaction:
    return Transaction(
        id=tx.id,
        source_account_id=tx.source_account_id,
        destination_account_id=tx.destination_account_id,
        amount=tx.amount,
        type=tx.type,
        timestamp=tx.timestamp.replace(tzinfo=timezone.utc).isoformat(),
        description=tx.description,
        status=tx.status,
    )


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> UserModel:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


def require_faction(user: UserModel = Depends(require_user)) -> UserModel:
    if user.role != "FACTION":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faction role required")
    return user


def require_admin(user: UserModel = Depends(require_user)) -> UserModel:
    if user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user


def execute_transaction(db: Session, account: AccountModel, payload: CreateTransaction) -> TransactionModel:
    if account.is_frozen:
        raise HTTPException(status_code=403, detail="Account is frozen")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if payload.amount > account.balance:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    account.balance -= payload.amount
    new_tx = TransactionModel(
        id=f"TX-{uuid4().hex[:6].upper()}",
        source_account_id=account.id,
        destination_account_id=payload.destination_account_id,
        amount=payload.amount,
        type=payload.type,
        timestamp=datetime.now(timezone.utc),
        description=payload.description,
        status="COMPLETED",
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx


def seed_data(db: Session):
    if db.query(UserModel).first():
        return

    personal_account = AccountModel(
        id="acc-001",
        owner_name="Operative K-92",
        type="PERSONAL",
        balance=12480.0,
        is_frozen=False,
        account_number="416-00982",
        last_audit_at=datetime(2026, 2, 23, 20, 10, tzinfo=timezone.utc),
        tax_rate=0.03,
        audit_status="VERIFIED",
    )
    faction_account = AccountModel(
        id="acc-fac-013",
        owner_name="MTF Gamma-13 Vault",
        type="FACTION",
        balance=84200.0,
        is_frozen=False,
        account_number="416-FA-013",
        last_audit_at=datetime(2026, 2, 23, 19, 0, tzinfo=timezone.utc),
        tax_rate=0.05,
        audit_status="VERIFIED",
    )
    admin_account = AccountModel(
        id="acc-admin-001",
        owner_name="Site-416 Administration",
        type="PERSONAL",
        balance=2300.0,
        is_frozen=False,
        account_number="416-ADM-001",
        last_audit_at=datetime(2026, 2, 23, 18, 45, tzinfo=timezone.utc),
        tax_rate=0.0,
        audit_status="VERIFIED",
    )

    db.add_all([personal_account, faction_account, admin_account])

    users = [
        UserModel(
            id="user-demo",
            username="demo",
            password="demo123",
            name="Operative K-92",
            role="PLAYER",
            account_id=personal_account.id,
        ),
        UserModel(
            id="user-faction",
            username="faction",
            password="faction123",
            name="Gamma-13 Command",
            role="FACTION",
            account_id=faction_account.id,
            faction_id="faction-gamma-13",
        ),
        UserModel(
            id="user-admin",
            username="admin",
            password="admin123",
            name="Site-416 Oversight",
            role="ADMIN",
            account_id=admin_account.id,
        ),
    ]
    db.add_all(users)

    db.add_all(
        [
            TransactionModel(
                id="TX-44821",
                source_account_id="acc-payroll",
                destination_account_id=personal_account.id,
                amount=3400.0,
                type="DEPOSIT",
                timestamp=datetime(2026, 2, 9, 8, 14, tzinfo=timezone.utc),
                description="Foundation payroll",
                status="COMPLETED",
            ),
            TransactionModel(
                id="TX-44820",
                source_account_id=personal_account.id,
                destination_account_id="acc-alpha-19",
                amount=1200.0,
                type="TRANSFER",
                timestamp=datetime(2026, 2, 9, 7, 42, tzinfo=timezone.utc),
                description="Supplies",
                status="COMPLETED",
            ),
            TransactionModel(
                id="TX-44819",
                source_account_id=personal_account.id,
                destination_account_id="acc-treasury",
                amount=120.0,
                type="TAX",
                timestamp=datetime(2026, 2, 8, 19, 42, tzinfo=timezone.utc),
                description="Automated tax",
                status="COMPLETED",
            ),
            TransactionModel(
                id="FX-9921",
                source_account_id=faction_account.id,
                destination_account_id="acc-supply",
                amount=4500.0,
                type="TRANSFER",
                timestamp=datetime(2026, 2, 11, 12, 10, tzinfo=timezone.utc),
                description="Containment supply",
                status="COMPLETED",
            ),
            TransactionModel(
                id="FX-9920",
                source_account_id="acc-council",
                destination_account_id=faction_account.id,
                amount=12000.0,
                type="DEPOSIT",
                timestamp=datetime(2026, 2, 10, 9, 20, tzinfo=timezone.utc),
                description="Council budget",
                status="COMPLETED",
            ),
            TransactionModel(
                id="FX-9919",
                source_account_id=faction_account.id,
                destination_account_id="acc-treasury",
                amount=600.0,
                type="TAX",
                timestamp=datetime(2026, 2, 9, 16, 5, tzinfo=timezone.utc),
                description="Monthly tax",
                status="COMPLETED",
            ),
            TransactionModel(
                id="TX-ADM-1",
                source_account_id="acc-treasury",
                destination_account_id=admin_account.id,
                amount=2300.0,
                type="DEPOSIT",
                timestamp=datetime(2026, 2, 9, 10, 0, tzinfo=timezone.utc),
                description="Operational budget",
                status="COMPLETED",
            ),
        ]
    )

    faction_vault = FactionVaultModel(
        id="faction-gamma-13",
        name="MTF Gamma-13 Vault",
        account_id=faction_account.id,
    )
    db.add(faction_vault)

    db.add_all(
        [
            FactionSignerModel(
                id="signer-iris", name="Commander Iris", role="Primary signer", faction_id=faction_vault.id
            ),
            FactionSignerModel(
                id="signer-novak", name="Lt. Novak", role="Co-signer", faction_id=faction_vault.id
            ),
            FactionSignerModel(
                id="signer-hana", name="Ops Chief Hana", role="Auditor", faction_id=faction_vault.id
            ),
        ]
    )

    db.add_all(
        [
            AdminActionModel(
                id="AD-1209",
                action="Account freeze",
                target="Operative J-14",
                reason="Suspicious transfers",
                status="APPROVED",
                timestamp=datetime(2026, 2, 12, 15, 15, tzinfo=timezone.utc),
            ),
            AdminActionModel(
                id="AD-1208",
                action="Balance adjustment",
                target="Gamma-13 Vault",
                reason="Raid reward correction",
                status="APPROVED",
                timestamp=datetime(2026, 2, 12, 11, 2, tzinfo=timezone.utc),
            ),
            AdminActionModel(
                id="AD-1207",
                action="Tax rule update",
                target="Faction accounts",
                reason="Inflation control",
                status="PENDING",
                timestamp=datetime(2026, 2, 11, 18, 33, tzinfo=timezone.utc),
            ),
        ]
    )

    db.add_all(
        [
            WatchlistItemModel(account="Delta-4 Logistics", note="Rapid accumulation"),
            WatchlistItemModel(account="Operative K-92", note="High outbound volume"),
            WatchlistItemModel(account="Site-416 Vault", note="Manual review"),
        ]
    )

    db.add(
        TaxRulesModel(
            id=1, personal_rate=0.03, faction_rate=0.05, updated_at=datetime(2026, 2, 20, 14, 40, tzinfo=timezone.utc)
        )
    )
    db.add(
        ComplianceStatsModel(
            id=1, transactions_scanned=4208, flags_opened=6, resolved_alerts=4
        )
    )

    db.commit()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_data(db)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    record = db.query(UserModel).filter(UserModel.username == payload.username).first()
    if not record or record.password != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(record.id)
    return LoginResponse(access_token=token, user=to_user_schema(record))


@app.post("/api/register", response_model=LoginResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> LoginResponse:
    username = payload.username.strip().lower()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    account_id = f"acc-{uuid4().hex[:6]}"
    account_number = f"416-{uuid4().hex[:5].upper()}"
    tax_rules = db.query(TaxRulesModel).filter(TaxRulesModel.id == 1).first()
    personal_rate = tax_rules.personal_rate if tax_rules else 0.03

    account = AccountModel(
        id=account_id,
        owner_name=payload.name.strip() or username,
        type="PERSONAL",
        balance=0.0,
        is_frozen=False,
        account_number=account_number,
        last_audit_at=datetime.now(timezone.utc),
        tax_rate=personal_rate,
        audit_status="VERIFIED",
    )
    user = UserModel(
        id=f"user-{uuid4().hex[:6]}",
        username=username,
        password=payload.password,
        name=account.owner_name,
        role="PLAYER",
        account_id=account_id,
    )

    db.add(account)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username already exists")

    token = create_access_token(user.id)
    return LoginResponse(access_token=token, user=to_user_schema(user))


@app.get("/api/me", response_model=User)
def get_me(user: UserModel = Depends(require_user)) -> User:
    return to_user_schema(user)


@app.get("/api/accounts/me", response_model=Account)
def get_account_me(user: UserModel = Depends(require_user), db: Session = Depends(get_db)) -> Account:
    if not user.account_id:
        raise HTTPException(status_code=404, detail="Account not found")
    account = db.query(AccountModel).filter(AccountModel.id == user.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return to_account_schema(account)


@app.get("/api/transactions/me", response_model=List[Transaction])
def get_transactions_me(user: UserModel = Depends(require_user), db: Session = Depends(get_db)) -> List[Transaction]:
    if not user.account_id:
        return []
    rows = (
        db.query(TransactionModel)
        .filter(
            (TransactionModel.source_account_id == user.account_id)
            | (TransactionModel.destination_account_id == user.account_id)
        )
        .order_by(TransactionModel.timestamp.desc())
        .all()
    )
    return [to_transaction_schema(tx) for tx in rows]


@app.post("/api/transactions", response_model=Transaction)
def create_transaction(
    payload: CreateTransaction,
    user: UserModel = Depends(require_user),
    db: Session = Depends(get_db),
) -> Transaction:
    if not user.account_id:
        raise HTTPException(status_code=404, detail="Account not found")
    account = db.query(AccountModel).filter(AccountModel.id == user.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    tx = execute_transaction(db, account, payload)
    return to_transaction_schema(tx)


@app.get("/api/factions/me", response_model=FactionVault)
def get_faction_me(
    user: UserModel = Depends(require_faction), db: Session = Depends(get_db)
) -> FactionVault:
    if not user.faction_id:
        raise HTTPException(status_code=404, detail="Faction not found")
    vault = db.query(FactionVaultModel).filter(FactionVaultModel.id == user.faction_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Faction not found")

    account = db.query(AccountModel).filter(AccountModel.id == vault.account_id).first()
    signers = db.query(FactionSignerModel).filter(FactionSignerModel.faction_id == vault.id).all()

    monthly_transfers = (
        db.query(TransactionModel)
        .filter(TransactionModel.source_account_id == vault.account_id)
        .count()
    )

    return FactionVault(
        id=vault.id,
        name=vault.name,
        account_id=vault.account_id,
        balance=account.balance if account else 0.0,
        monthly_transfers=monthly_transfers,
        authorized_signers=[Signer(id=s.id, name=s.name, role=s.role) for s in signers],
    )


@app.get("/api/factions/me/transactions", response_model=List[Transaction])
def get_faction_transactions_me(
    user: UserModel = Depends(require_faction), db: Session = Depends(get_db)
) -> List[Transaction]:
    if not user.faction_id:
        return []
    vault = db.query(FactionVaultModel).filter(FactionVaultModel.id == user.faction_id).first()
    if not vault:
        return []
    rows = (
        db.query(TransactionModel)
        .filter(
            (TransactionModel.source_account_id == vault.account_id)
            | (TransactionModel.destination_account_id == vault.account_id)
        )
        .order_by(TransactionModel.timestamp.desc())
        .all()
    )
    return [to_transaction_schema(tx) for tx in rows]


@app.post("/api/factions/transactions", response_model=Transaction)
def create_faction_transaction(
    payload: CreateTransaction,
    user: UserModel = Depends(require_faction),
    db: Session = Depends(get_db),
) -> Transaction:
    if not user.faction_id:
        raise HTTPException(status_code=404, detail="Faction not found")
    vault = db.query(FactionVaultModel).filter(FactionVaultModel.id == user.faction_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Faction not found")
    account = db.query(AccountModel).filter(AccountModel.id == vault.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    tx = execute_transaction(db, account, payload)
    return to_transaction_schema(tx)


@app.get("/api/admin/actions", response_model=List[AdminAction])
def get_admin_actions(
    _: UserModel = Depends(require_admin), db: Session = Depends(get_db)
) -> List[AdminAction]:
    actions = db.query(AdminActionModel).order_by(AdminActionModel.timestamp.desc()).all()
    return [
        AdminAction(
            id=item.id,
            action=item.action,
            target=item.target,
            reason=item.reason,
            status=item.status,
            timestamp=item.timestamp.replace(tzinfo=timezone.utc).isoformat(),
        )
        for item in actions
    ]


@app.post("/api/admin/actions", response_model=AdminAction)
def create_admin_action(
    payload: AdminActionCreate,
    _: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminAction:
    reason = payload.reason
    if payload.amount is not None:
        reason = f"{reason} (Amount: {payload.amount})"
    new_action = AdminActionModel(
        id=f"AD-{uuid4().hex[:4].upper()}",
        action=payload.action,
        target=payload.target,
        reason=reason,
        status="PENDING",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(new_action)
    db.commit()
    db.refresh(new_action)
    return AdminAction(
        id=new_action.id,
        action=new_action.action,
        target=new_action.target,
        reason=new_action.reason,
        status=new_action.status,
        timestamp=new_action.timestamp.replace(tzinfo=timezone.utc).isoformat(),
    )


@app.get("/api/admin/watchlist", response_model=List[WatchlistItem])
def get_watchlist(
    _: UserModel = Depends(require_admin), db: Session = Depends(get_db)
) -> List[WatchlistItem]:
    items = db.query(WatchlistItemModel).all()
    return [WatchlistItem(account=item.account, note=item.note) for item in items]


@app.get("/api/admin/tax-rules", response_model=TaxRules)
def get_tax_rules(
    _: UserModel = Depends(require_admin), db: Session = Depends(get_db)
) -> TaxRules:
    rules = db.query(TaxRulesModel).filter(TaxRulesModel.id == 1).first()
    if not rules:
        raise HTTPException(status_code=404, detail="Tax rules not found")
    return TaxRules(
        personal_rate=rules.personal_rate,
        faction_rate=rules.faction_rate,
        updated_at=rules.updated_at.replace(tzinfo=timezone.utc).isoformat(),
    )


@app.put("/api/admin/tax-rules", response_model=TaxRules)
def update_tax_rules(
    payload: TaxRulesUpdate, _: UserModel = Depends(require_admin), db: Session = Depends(get_db)
) -> TaxRules:
    rules = db.query(TaxRulesModel).filter(TaxRulesModel.id == 1).first()
    if not rules:
        rules = TaxRulesModel(
            id=1,
            personal_rate=payload.personal_rate,
            faction_rate=payload.faction_rate,
            updated_at=datetime.now(timezone.utc),
        )
        db.add(rules)
    else:
        rules.personal_rate = payload.personal_rate
        rules.faction_rate = payload.faction_rate
        rules.updated_at = datetime.now(timezone.utc)
    db.commit()
    return TaxRules(
        personal_rate=rules.personal_rate,
        faction_rate=rules.faction_rate,
        updated_at=rules.updated_at.replace(tzinfo=timezone.utc).isoformat(),
    )


@app.get("/api/admin/compliance", response_model=ComplianceStats)
def get_compliance_stats(
    _: UserModel = Depends(require_admin), db: Session = Depends(get_db)
) -> ComplianceStats:
    stats = db.query(ComplianceStatsModel).filter(ComplianceStatsModel.id == 1).first()
    if not stats:
        stats = ComplianceStatsModel(id=1, transactions_scanned=0, flags_opened=0, resolved_alerts=0)
        db.add(stats)
        db.commit()
    return ComplianceStats(
        transactions_scanned=stats.transactions_scanned,
        flags_opened=stats.flags_opened,
        resolved_alerts=stats.resolved_alerts,
    )


@app.get("/api/stats", response_model=PublicStats)
def get_public_stats(db: Session = Depends(get_db)) -> PublicStats:
    registered_users = db.query(func.count(UserModel.id)).scalar() or 0
    active_players = db.query(func.count(UserModel.id)).filter(UserModel.role == "PLAYER").scalar() or 0
    personal_accounts = db.query(func.count(AccountModel.id)).filter(AccountModel.type == "PERSONAL").scalar() or 0
    faction_vaults = db.query(func.count(AccountModel.id)).filter(AccountModel.type == "FACTION").scalar() or 0
    frozen_accounts = db.query(func.count(AccountModel.id)).filter(AccountModel.is_frozen.is_(True)).scalar() or 0
    flagged_accounts = db.query(func.count(WatchlistItemModel.id)).scalar() or 0

    today = datetime.now(timezone.utc).date()
    admin_actions_today = (
        db.query(func.count(AdminActionModel.id))
        .filter(func.date(AdminActionModel.timestamp) == today)
        .scalar()
        or 0
    )

    latest_audit = db.query(func.max(AccountModel.last_audit_at)).scalar()
    if latest_audit:
        minutes = int((datetime.now(timezone.utc) - latest_audit.replace(tzinfo=timezone.utc)).total_seconds() // 60)
    else:
        minutes = 0

    return PublicStats(
        registered_users=registered_users,
        active_players=active_players,
        tracked_transfers_percent=100,
        personal_accounts=personal_accounts,
        faction_vaults=faction_vaults,
        frozen_accounts=frozen_accounts,
        last_audit_sync_minutes=minutes,
        flagged_accounts=flagged_accounts,
        tax_policies=1,
        admin_actions_today=admin_actions_today,
    )
