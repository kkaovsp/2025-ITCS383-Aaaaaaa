# D3 – AI Usage Log

## 1. AI Tools Used

The team used AI tools to assist with system development, debugging, and code quality improvement.

AI tools used in this project include:

- **ChatGPT** – generating code, explaining solutions, and debugging errors
- **AI coding agent** – generating application structure and backend logic
- **SonarQube** – static code analysis for detecting code quality issues

AI tools were used only as development assistants. All generated outputs were **reviewed and verified manually by the team** before integration into the project.

---

# 2. Prompt Log

## 2.1 Prompt for Generating the Application

The following prompts were used to generate the main structure of the system.

### Prompt Screenshot 1
<img width="886" height="1107" src="https://github.com/user-attachments/assets/3eea4ae7-99e0-4dcd-ae99-219213e70fdf" />

### Prompt Screenshot 2
<img width="438" height="747" src="https://github.com/user-attachments/assets/4a993334-4c64-45ec-8e08-9ffdd350519d" />

### Prompt Screenshot 3
<img width="431" height="594" src="https://github.com/user-attachments/assets/59e33aac-d049-458d-bca6-99ef9a0e2deb" />

### Prompt Screenshot 4
<img width="427" height="599" src="https://github.com/user-attachments/assets/64d04ace-55c5-4408-90c9-c39de782649d" />

### Prompt Screenshot 5
<img width="427" height="714" src="https://github.com/user-attachments/assets/e611b34d-fc9d-4f23-acd1-84602c80efe3" />

### Prompt Screenshot 6
<img width="437" height="639" src="https://github.com/user-attachments/assets/499aca12-453a-410e-bd71-580ec2258f8d" />

### Prompt Screenshot 7
<img width="436" height="690" src="https://github.com/user-attachments/assets/8e8944f2-7677-420e-baf9-4f865016aa82" />

### Prompt Screenshot 8
<img width="435" height="644" src="https://github.com/user-attachments/assets/59311b99-c6bc-4abb-acfb-ebff18b8e42a" />

### Prompt Screenshot 9
<img width="431" height="612" src="https://github.com/user-attachments/assets/25b3550a-84b0-4c4a-bd98-9ad1258b39f3" />

These prompts generated:

- Backend API structure using **FastAPI**
- Database configuration using **SQLite**
- Frontend structure using **React**
- Reservation and booth management logic

### Decision

- **Accepted:** Code that successfully builds and runs
- **Rejected:** Code that produced runtime errors or incorrect behaviour

---

## 2.2 Prompt for Fixing Failed Cases

When the generated code did not work correctly, we prompted the AI agent again to modify the implementation.

### Failed Case Prompt 1
<img width="421" height="618" src="https://github.com/user-attachments/assets/9630af90-5497-45b9-b146-9579f2e7ca87" />

### Failed Case Prompt 2
<img width="432" height="641" src="https://github.com/user-attachments/assets/b3f1d9b9-1ef9-4399-aacd-04c97b3f22a9" />

### Failed Case Prompt 3
<img width="425" height="495" src="https://github.com/user-attachments/assets/a32eb4f3-3c22-443a-98b3-ea631da117a6" />

### Failed Case Prompt 4
<img width="298" height="662" src="https://github.com/user-attachments/assets/c526704a-d133-4bf5-96dc-647d4828d83c" />

### Failed Case Prompt 5
<img width="290" height="639" src="https://github.com/user-attachments/assets/ce0f0422-1086-494a-9de6-afaef747a14e" />

### Failed Case Prompt 6
<img width="286" height="646" src="https://github.com/user-attachments/assets/04ff0f28-c9e4-4a61-ab67-0441be65c28b" />

### Failed Case Prompt 7
<img width="288" height="642" src="https://github.com/user-attachments/assets/444d9933-95b4-41eb-a0dc-50deda1e895c" />

### Example issues

Some problems encountered during development included:

- API endpoint mismatch
- incorrect database queries
- frontend request errors
- missing validation logic

### Decision

- **Rejected:** AI suggestions that still failed test cases
- **Accepted:** revised code that passed verification steps

---

## 2.3 Prompt for Coding Features

AI was used to help implement key system features.

### Coding Prompt 1
<img width="886" height="1107" src="https://github.com/user-attachments/assets/22aebe0b-7fd4-49ca-a1c8-9a51bfa994d3" />

### Coding Prompt 2
<img width="1065" height="952" src="https://github.com/user-attachments/assets/d5c6353e-fdb0-4a59-82dc-a953a97ff271" />

### Coding Prompt 3
<img width="867" height="1128" src="https://github.com/user-attachments/assets/600de9a7-0908-4a8c-8d86-0c7ff6fc4a2b" />

### Coding Prompt 4
<img width="1047" height="868" src="https://github.com/user-attachments/assets/9f2cbe67-badb-499f-8d46-2b75ec19f729" />

### Coding Prompt 5
<img width="1062" height="1065" src="https://github.com/user-attachments/assets/8bb36fc9-f2b7-44ab-9b81-0fac4156809f" />

### Coding Prompt 6
<img width="1035" height="1062" src="https://github.com/user-attachments/assets/df365397-b877-4896-b5e4-7aa8426e26bc" />

### Coding Prompt 7
<img width="1036" height="1050" src="https://github.com/user-attachments/assets/bcd66dff-d2ac-4a48-bf88-956ce81d948c" />

### Coding Prompt 8
<img width="1072" height="1130" src="https://github.com/user-attachments/assets/e0b38c1a-1c2e-478c-b0b1-d146bd1f8afa" />

### Coding Prompt 9
<img width="1062" height="1117" src="https://github.com/user-attachments/assets/c595f9a4-f569-4d67-bcfa-5cf1f41b309d" />

### Coding Prompt 10
<img width="1093" height="1043" src="https://github.com/user-attachments/assets/93284305-0702-420e-9414-c84cddf69238" />

### Coding Prompt 11
<img width="1067" height="1096" src="https://github.com/user-attachments/assets/c9d68627-a5e6-48b3-a5c0-62374a6165c8" />

### Coding Prompt 12
<img width="1062" height="1127" src="https://github.com/user-attachments/assets/44d9b95b-95ae-4a9c-9114-ae3aa6061911" />

### Coding Prompt 13
<img width="1066" height="1087" src="https://github.com/user-attachments/assets/7bd55bfd-1db5-4dfc-9d8d-2eb496749721" />

### Coding Prompt 14
<img width="1046" height="1035" src="https://github.com/user-attachments/assets/24600f16-454d-48eb-a181-12a107b329a5" />

Examples include:

- User authentication
- Event creation
- Booth management
- Reservation workflows
- Payment handling

The generated code was **reviewed manually before integration into the repository**.

---

# 3. Static Analysis (SonarQube)

To ensure code quality, we ran **SonarQube static analysis**.

Links to discussions used during debugging:

- https://chatgpt.com/share/69b15748-a584-800b-9b54-af543f8dcfe8  
- https://chatgpt.com/share/69b15765-d968-800b-818f-d649ca25914f  
- https://chatgpt.com/share/69b15773-3b60-800b-b9eb-2b4b1089eb05  
- https://chatgpt.com/share/69b15781-18a4-800b-a0ea-c2b47a00e412  

### Decision Rule

- **Accepted:** Code that passed `pytest` and had **no blocker or high severity issues** in SonarQube
- **Rejected:** Code that failed `pytest` or had **blocker/high severity issues**

---

# 4. Verification Process

To ensure correctness of AI-generated code, the team performed several verification steps.

---

## 4.1 Run the System

The system was executed to confirm that the application builds and runs correctly.

- Backend: **FastAPI with Uvicorn**
- Frontend: **React**

This confirmed that the application starts successfully without runtime errors.

---

## 4.2 Feature Testing (Manual Test)

We manually tested major system functions, including:

- User registration
- User login
- Event creation
- Booth management
- Booth reservation
- Payment workflow

These tests confirmed that the system behaves as expected.

---

## 4.3 API Verification

We verified that API endpoints work correctly by checking that:

- requests from the frontend are received by the backend
- responses are returned correctly
- data formats match the expected API design

---

## 4.4 Debugging and Error Fixing

When errors occurred (for example **CORS configuration problems** or **API request issues**), we:

1. inspected browser console messages
2. checked backend server logs
3. updated the code
4. reran the system and repeated the tests

---

## 4.5 Database Verification

We verified that the **SQLite database** functions correctly.

We confirmed that the following data were stored correctly:

- user accounts
- events
- booths
- reservations
- payment records

---

## 4.6 UI Verification

We confirmed that the user interface updates correctly after actions such as:

- user login
- booth reservation
- payment confirmation

This ensured correct integration between the frontend and backend systems.

---

# 5. AI Usage Log Table

| Step | Purpose | Prompt Summary | Accepted Result | Rejected Result | Verification Method |
|-----|------|------|------|------|------|
| 1 | Generate project structure | Prompted AI to generate backend (FastAPI), frontend (React), and SQLite structure | Project builds and runs successfully | Initial version with dependency errors | Run backend with Uvicorn and frontend dev server |
| 2 | Implement authentication | Asked AI to create login and registration APIs | Working login and registration functionality | Version with incorrect validation | Manual login test |
| 3 | Implement event creation | Prompted AI to create event management APIs | Event successfully stored in database | Version that failed to insert data | Verified using SQLite database |
| 4 | Booth management | Asked AI to generate booth management logic | Booths displayed correctly | API response errors | Manual UI testing |
| 5 | Reservation workflow | Prompted AI to implement reservation logic | Reservation stored successfully | Incorrect reservation status logic | Manual system testing |
| 6 | Payment workflow | Asked AI to generate payment confirmation logic | Payment status updates correctly | Incorrect database update | Database verification |
| 7 | Debugging | Asked AI to analyze errors such as CORS issues | Correct configuration implemented | Incorrect configuration suggestion | Browser console and backend logs |
| 8 | Code quality improvement | Asked AI to analyze SonarQube issues | Code improved and warnings reduced | Suggestions that did not fix issues | SonarQube static analysis |
| 9 | Final validation | Asked AI to review integration | Final code passed system tests | Versions that failed pytest | pytest and manual testing |

---

# 6. Summary

AI tools were used to assist in generating code, debugging problems, and improving the implementation of backend and frontend features.

However, all AI-generated outputs were **reviewed and validated manually by the development team**.

The team only accepted code that:

- passed **pytest testing**
- passed **SonarQube static analysis**
- worked correctly during **manual system testing**

This verification process ensured that the final system functions correctly and meets the project requirements.
