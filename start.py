"""Railway startup script — reads PORT from environment and launches uvicorn."""
import os
import uvicorn

port = int(os.environ.get("PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(
        "src.web.api.app:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
    )
