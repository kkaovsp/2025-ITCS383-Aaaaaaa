# Booth Organizer System

A **Booth Organizer** is a web application designed to help event organizers manage booth inventory, merchant registrations, reservations, and payments. Merchants can sign up and reserve temporary or fixed booths for events; booth managers create events and approve merchants, reservations and payments. The platform includes notification support and role-based access control.

This repository contains a FastAPI backend and React frontend for the system, created as a university class project.  It demonstrates a full-stack architecture with a SQLite database, JWT authentication, and a simple React UI.

## Setup Instructions

### Initial Setup (For Docker)

1. Run this command in terminal:
    ```bash
    sudo apt update
    sudo apt install python3-pip
    pip install pytest-cov
    ```

### Backend Setup
1. Navigate to backend folder:
    ```bash
    cd implementations/backend
    ```
    
3. Install dependencies:
    ```bash
	pip install -r requirements.txt
    ```
    
5. Start the development server:
    ```bash
	uvicorn app.main:app --reload --env-file .env
    ```
    Open the Codespaces Ports tab, the backend will be available at Port 8000.

### Frontend Setup
Do Step 1-4 if using Docker in Codespace. Can Skip to Step 5 if download and run on windows:
1. Open new terminal Install Node Version Manager
    ```bash
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```

2. Reload your shell
    ```bash
	source ~/.bashrc
    ```

3. Install Node
    ```bash
	nvm install --lts
	nvm use --lts
    ```

4. Check version
    ```bash
	node -v
	npm -v
    ```
    You should see something like:
    ```bash
	v24.14.0
	11.9.0
    ```
    Some older version of node doesn't work with our code.

5. Change to frontend directory:
    ```bash
	cd implementations/frontend
    ```

6. Install Node dependencies:
    ```bash
	npm install
    ```

7. Start development server:
    ```bash
	npm start
    ```

8. Open Frontend in a browser
    - Open the Codespaces Ports tab, locate port 3000, then select Open in Browser.


### Testing
- Pytest: Open new terminal then run
    ```bash
	cd implementations/backend
	pytest --cov=app --cov-report=xml
    ```

- Register a BOOTH_MANAGER (Codespace)
    ```bash
	cd implementations/
	python3 register_booth_manager_api.py
    ```
    
- Register a BOOTH_MANAGER (Windows)
    ```bash
	cd implementations/
	python register_booth_manager_api.py
    ```
    
    Login with
    ```bash
	Username: boothManager
	Password: boothManager123
    ```

### SonarQube Setup 
1. Open new terminal Pull the latest SonarQube Community Build image
    ```bash
	docker pull sonarqube:community
    ```

3. Remove any old SonarQube container
    ```bash
	docker stop sonarqube 2>/dev/null || true
	docker rm sonarqube 2>/dev/null || true
    ```

5. Start SonarQube
    ```bash
	docker run -d --name sonarqube \
  		-p 9000:9000 \
  		-e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  		sonarqube:community
    ```
    Wait 1-3 minutes

7. Open SonarQube in a browser
    - Open the Codespaces Ports tab, locate port 9000, then select Open in Browser.

8. Sign in to SonarQube
    ```bash
	Username admin
	Password admin
    ```
    Change the password when prompted.

10. Create a local project in SonarQube
    Create a local project:
    ```bash
	Project display name: Booth-Organizer-System
	Project key: Booth-Organizer-System
	branch name: YOUR-CURRENT-BRANCH
    ```
    Set up new code for project:
    ```
	Follows the instance's default
    ```

7. Setup Analysis Method
    - In Analysis Method choose Locally then type codespace-token and generate token<br>
    - Token name
    ```bash
	codespace-token
    ```
    Copy the token
    ```bash
	codespace-token: YOUR_TOKEN
    ```

9. Install SonarScanner CLI in Codespaces
    Run this command in your terminal in codespace
    ```bash
	wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
	unzip sonar-scanner-cli-5.0.1.3006-linux.zip
	sudo mv sonar-scanner-5.0.1.3006-linux /opt/sonarscanner
	sudo ln -s /opt/sonarscanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
    ```

11. Run the analysis scan
    ```bash
	sonar-scanner \
		-Dsonar.host.url=http://localhost:9000 \
		-Dsonar.login=YOUR_TOKEN
    ```

---

## Maintenance Phase Progress

This section records the current Phase 2 Part 2 maintenance work completed by the receiving team.

| Area | Current Status |
|---|---|
| Cloud database | Supabase PostgreSQL project connected and initial schema migration applied |
| Backend migration | Supabase Edge Function API foundation deployed at `https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api` |
| Backend endpoints done | `/health`, `/events`, `/events/:event_id/booths`, auth/profile, reservations, payments |
| Backend endpoints next | merchant approval, notifications, reports, full slip storage |
| Web frontend | React app still uses existing UI; API base URL can be configured with `REACT_APP_API_URL` |
| Android app | Required feature; implementation starts after backend/web behavior is stable |
| Quality | GitHub Actions and SonarCloud baseline are configured; final D2 scan will be updated after all changes |

Current backend API base:

```txt
https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api
```

For detailed cloud database and API notes, see:

```txt
docs/CLOUD_DATABASE_GUIDE.md
docs/WORK_LOG.md
```

