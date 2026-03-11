## AI Usage Log
<img width="886" height="1107" alt="image" src="https://github.com/user-attachments/assets/3eea4ae7-99e0-4dcd-ae99-219213e70fdf" />
<img width="438" height="747" alt="image" src="https://github.com/user-attachments/assets/4a993334-4c64-45ec-8e08-9ffdd350519d" />

<img width="431" height="594" alt="image" src="https://github.com/user-attachments/assets/59e33aac-d049-458d-bca6-99ef9a0e2deb" />

<img width="427" height="599" alt="image" src="https://github.com/user-attachments/assets/64d04ace-55c5-4408-90c9-c39de782649d" />

<img width="427" height="714" alt="image" src="https://github.com/user-attachments/assets/e611b34d-fc9d-4f23-acd1-84602c80efe3" />

<img width="437" height="639" alt="image" src="https://github.com/user-attachments/assets/499aca12-453a-410e-bd71-580ec2258f8d" />

<img width="436" height="690" alt="image" src="https://github.com/user-attachments/assets/8e8944f2-7677-420e-baf9-4f865016aa82" />

<img width="435" height="644" alt="image" src="https://github.com/user-attachments/assets/59311b99-c6bc-4abb-acfb-ebff18b8e42a" />

<img width="431" height="612" alt="image" src="https://github.com/user-attachments/assets/25b3550a-84b0-4c4a-bd98-9ad1258b39f3" />

These are the prompt for generating the application.
Verify by running the manual test. We reject the failed test case and ask AI agent to modify again 

---
### Prompt for failed case

<img width="421" height="618" alt="image" src="https://github.com/user-attachments/assets/9630af90-5497-45b9-b146-9579f2e7ca87" />

<img width="432" height="641" alt="image" src="https://github.com/user-attachments/assets/b3f1d9b9-1ef9-4399-aacd-04c97b3f22a9" />

<img width="425" height="495" alt="image" src="https://github.com/user-attachments/assets/a32eb4f3-3c22-443a-98b3-ea631da117a6" />

<img width="298" height="662" alt="image" src="https://github.com/user-attachments/assets/c526704a-d133-4bf5-96dc-647d4828d83c" />

<img width="290" height="639" alt="image" src="https://github.com/user-attachments/assets/ce0f0422-1086-494a-9de6-afaef747a14e" />

<img width="286" height="646" alt="image" src="https://github.com/user-attachments/assets/04ff0f28-c9e4-4a61-ab67-0441be65c28b" />

<img width="288" height="642" alt="image" src="https://github.com/user-attachments/assets/444d9933-95b4-41eb-a0dc-50deda1e895c" />

Verify by running the manual test

---
### Prompt for Coding
<img width="886" height="1107" alt="image" src="https://github.com/user-attachments/assets/22aebe0b-7fd4-49ca-a1c8-9a51bfa994d3" />
<img width="1065" height="952" alt="image" src="https://github.com/user-attachments/assets/d5c6353e-fdb0-4a59-82dc-a953a97ff271" />
<img width="867" height="1128" alt="image" src="https://github.com/user-attachments/assets/600de9a7-0908-4a8c-8d86-0c7ff6fc4a2b" />
<img width="1047" height="868" alt="image" src="https://github.com/user-attachments/assets/9f2cbe67-badb-499f-8d46-2b75ec19f729" />
<img width="1062" height="1065" alt="image" src="https://github.com/user-attachments/assets/8bb36fc9-f2b7-44ab-9b81-0fac4156809f" />
<img width="1035" height="1062" alt="image" src="https://github.com/user-attachments/assets/df365397-b877-4896-b5e4-7aa8426e26bc" />
<img width="1036" height="1050" alt="image" src="https://github.com/user-attachments/assets/bcd66dff-d2ac-4a48-bf88-956ce81d948c" />
<img width="1072" height="1130" alt="image" src="https://github.com/user-attachments/assets/e0b38c1a-1c2e-478c-b0b1-d146bd1f8afa" />
<img width="1062" height="1117" alt="image" src="https://github.com/user-attachments/assets/c595f9a4-f569-4d67-bcfa-5cf1f41b309d" />
<img width="1093" height="1043" alt="image" src="https://github.com/user-attachments/assets/93284305-0702-420e-9414-c84cddf69238" />
<img width="1067" height="1096" alt="image" src="https://github.com/user-attachments/assets/c9d68627-a5e6-48b3-a5c0-62374a6165c8" />
<img width="1062" height="1127" alt="image" src="https://github.com/user-attachments/assets/44d9b95b-95ae-4a9c-9114-ae3aa6061911" />
<img width="1066" height="1087" alt="image" src="https://github.com/user-attachments/assets/7bd55bfd-1db5-4dfc-9d8d-2eb496749721" />
<img width="1046" height="1035" alt="image" src="https://github.com/user-attachments/assets/24600f16-454d-48eb-a181-12a107b329a5" />


---
### SonaQube Analysis: Issues

https://chatgpt.com/share/69b15748-a584-800b-9b54-af543f8dcfe8 <br>
https://chatgpt.com/share/69b15765-d968-800b-818f-d649ca25914f <br>
https://chatgpt.com/share/69b15773-3b60-800b-b9eb-2b4b1089eb05 <br>
https://chatgpt.com/share/69b15781-18a4-800b-a0ea-c2b47a00e412

We accept the code that passes pytest and the static analysis output of SonaQube and reject code that fails pytest and has issues (blocker/high severity) in the static analysis output of SonaQube.

## Verification Steps

### 1. Run the system
We started the backend (**FastAPI with Uvicorn**) and the frontend (**React**) to confirm the project builds successfully and runs without runtime errors.

### 2. Test system features
We manually tested major features such as:
- User registration
- Login
- Event creation
- Booth management
- Reservations
- Payment workflows

This confirmed that the functions behave as expected.

### 3. Check API functionality
We verified that API endpoints respond correctly and that requests from the frontend are processed properly by the backend.

### 4. Debug and fix errors
When errors occurred (such as **CORS issues** or incorrect API configuration), we inspected browser console messages and backend logs, then updated the code and retested the system.

### 5. Verify database operations
We confirmed that the **SQLite database** was created correctly and that operations such as creating users, events, booths, and reservations were saved and updated in the database.

### 6. Confirm UI behavior
We checked that the user interface updates correctly after actions such as login, reservation, and payment approval.

These verification steps ensured that the AI-generated code works correctly and integrates properly with the system.

## Summary

AI tools were used to assist in generating code, debugging issues, and implementing features such as database configuration, reservation management, and payment workflows. The generated outputs were carefully reviewed before integration into the project.

Some suggestions from AI were accepted directly, while others were modified or rejected to better match the system design and requirements.

To verify the correctness of AI-generated code, we ran the system, tested major features through the frontend and API endpoints, reviewed the code manually, and confirmed that database operations and workflows function correctly. Static analysis using SonarQube was also checked to ensure the code meets quality standards.

