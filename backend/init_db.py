from __future__ import annotations

from dotenv import load_dotenv

load_dotenv()

from main import Base, engine  # noqa: E402


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")


if __name__ == "__main__":
    main()
