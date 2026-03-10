
# AGENTS.md

This file provides instructions and context for AI coding agents working on this Python project. Adhering to these guidelines helps maintain consistency and ensures smooth collaboration with human developers.

## Project Overview

*   **Tech Stack:** Python 3.11+, `pip` (or `uv`), `venv`, `pytest`, `ruff`
*   **Purpose:** A simple command-line to do list application.
*   **Key Files/Directories:**
    *   `src/`: All application-level code
    *   `tests/`: Unit and integration tests
    *   `docs/`: Human-readable documentation
    *   `requirements.txt` / `pyproject.toml`: Project dependencies

## Environment Setup & Commands

Agents should follow these steps to set up the development environment:

1.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    # On Windows: .venv\Scripts\activate
    ```
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the application/service:**
    ```bash
    python src/main.py
    ```

## Testing Instructions

All code changes **must** pass existing tests.

*   **Run all tests:**
    ```bash
    pytest tests/
    ```
*   **Run tests for a specific module (example):**
    ```bash
    pytest tests/users/test_models.py
    ```
*   **Ensure all quality checks pass before committing:**
    ```bash
    ruff format src/ tests/
    ruff check src/ tests/
    ```

## Coding Style & Standards

*   **Naming Conventions:**
    *   Functions/Methods: `snake_case`
    *   Classes: `PascalCase`
    *   Constants: `UPPER_SNAKE_CASE`
*   **Code Style:**
    *   Follow the [PEP8](https://peps.python.org/pep-0008/) style guide.
    *   Prefer small, focused functions and modules.
    *   Include descriptive docstrings for public APIs.
