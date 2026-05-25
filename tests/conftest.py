import pytest
from src.agent.db import ShieldDB


@pytest.fixture
def db():
    db = ShieldDB(db_path=":memory:")
    yield db
    db.close()
