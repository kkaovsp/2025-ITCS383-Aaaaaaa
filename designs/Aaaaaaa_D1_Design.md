# D1 Design Models and Design Rationale
---

# C4 Context Diagram

(To be added)

---

# C4 Container Diagram

(To be added)

---

# C4 Component Diagram

(To be added)

---

# Use Case Diagram

(To be added)

---

# Data Flow Diagram (DFD)

## DFD Level 0
```mermaid
flowchart LR

%% External Entities
GU[General User]
M[Merchant]
BM[Booth Manager]
MOI[MOI System]
PAY[Payment Gateway]

%% Main Process
SYS((Booth Organizer System))

%% General User Flows
GU -->|Search Request| SYS
GU -->|Event Request| SYS

SYS -->|Event Information| GU
SYS -->|Booth Information| GU
SYS -->|Announcements| GU

%% Merchant Flows
M -->|Registration Data| SYS
M -->|Login Data| SYS
M -->|Reservation Request| SYS
M -->|Payment Data| SYS
M -->|Payment Slip| SYS

SYS -->|Registration Status| M
SYS -->|Reservation Confirmation| M
SYS -->|Payment Status| M
SYS -->|Booth Availability| M

%% Booth Manager Flows
BM -->|Event Data| SYS
BM -->|Booth Data| SYS
BM -->|Approval Decisions| SYS
BM -->|Payment Verification| SYS

SYS -->|Registration Requests| BM
SYS -->|Reservation Requests| BM
SYS -->|Payment Requests| BM
SYS -->|Reports| BM

%% MOI Verification
SYS -->|Citizen ID| MOI
MOI -->|Verification Result| SYS

%% Payment Gateway
SYS -->|Payment Request| PAY
PAY -->|Payment Result| SYS

SYS -->|Payment Slip Data| PAY
PAY -->|Transfer Verification| SYS
```

##DFD Level 1
```mermaid
flowchart LR

%% External Entities
GU[General User]
MERCHANT[Merchant]
BM[Booth Manager]
MOI[MOI System]
PAY[Payment Gateway]

%% Processes
P1((1. User Management))
P2((2. Event & Booth Management))
P3((3. Reservation Management))
P4((4. Payment Management))
P5((5. Reporting))

%% Data Stores
D1[(D1 User Database)]
D2[(D2 Event Database)]
D3[(D3 Booth Database)]
D4[(D4 Reservation Database)]
D5[(D5 Payment Database)]

%% --------------------
%% Process 1 User Management
MERCHANT -->|Registration Data| P1
MERCHANT -->|Login Data| P1
BM -->|Approval Decision| P1

P1 -->|Registration Status| MERCHANT
P1 -->|Login Result| MERCHANT

P1 -->|Citizen ID| MOI
MOI -->|Verification Result| P1

P1 -->|User Record| D1
D1 -->|User Data| P1

%% --------------------
%% Process 2 Event & Booth
BM -->|Event Data| P2
BM -->|Booth Data| P2

P2 -->|Event Information| GU
P2 -->|Booth Information| GU

P2 -->|Event Record| D2
D2 -->|Event Data| P2

P2 -->|Booth Record| D3
D3 -->|Booth Data| P2

%% --------------------
%% Process 3 Reservation
MERCHANT -->|Reservation Request| P3

P3 -->|Reservation Confirmation| MERCHANT
P3 -->|Reservation List| BM

P3 -->|Booth Availability Request| D3
D3 -->|Booth Availability Data| P3

P3 -->|Reservation Record| D4
D4 -->|Reservation Data| P3

%% --------------------
%% Process 4 Payment
MERCHANT -->|Payment Data| P4
MERCHANT -->|Payment Slip| P4

BM -->|Payment Approval| P4

P4 -->|Payment Status| MERCHANT

P4 -->|Payment Request| PAY
PAY -->|Payment Result| P4

P4 -->|Transfer Verification Request| PAY
PAY -->|Transfer Verification Result| P4

P4 -->|Payment Record| D5
D5 -->|Payment Data| P4

%% --------------------
%% Process 5 Reporting
BM -->|Report Request| P5
P5 -->|Generated Reports| BM

D1 -->|User Data| P5
D2 -->|Event Data| P5
D4 -->|Reservation Data| P5
D5 -->|Payment Data| P5
```

---

# Class Diagram

```mermaid
classDiagram

%% Base User, Inheritance

class User {
  <<abstract>>
  +int userId
  +string name
  +string email
  +string phone
  +string password
  +login()
  +logout()
  +updateProfile()
}

%% Merchant (Verified User)

class Merchant {
  +string citizenId
  +string productDescription
  +string approvalStatus
  +register()
  +reserveBooth()
  +makePayment()
  +uploadSlip()
  +viewReservationStatus()
}

%% Booth Manager (Staff)

class BoothManager {
  +createEvent()
  +updateEvent()
  +approveMerchant()
  +verifyPayment()
  +generateReport()
}

User <|-- Merchant
User <|-- BoothManager

%% Event & Booth

class Event {
  +int eventId
  +string eventName
  +string location
  +date startDate
  +date endDate
  +string description
}

class Booth {
  +int boothId
  +double price
  +string size
  +string boothType
  +string durationType
  +string status
  +checkAvailability()
}

class BoothFacility {
  +int facilityId
  +boolean electricity
  +int outletCount
  +boolean waterSupply
}

Event "1" --> "many" Booth
Booth "1" --> "1" BoothFacility

%% Reservation & Payment

class Reservation {
  +int reservationId
  +date reservationDate
  +string status
  +createReservation()
  +cancelReservation()
}

class Payment {
  +int paymentId
  +double amount
  +date paymentDate
  +string paymentMethod
  +string status
  +processPayment()
}

class PaymentSlip {
  +int slipId
  +string imagePath
  +date uploadDate
  +string verificationStatus
}

Merchant "1" --> "many" Reservation
Reservation "many" --> "1" Booth
Reservation "1" --> "1" Payment
Payment "1" --> "0..1" PaymentSlip

%% Reporting

class Report {
  +int reportId
  +string reportType
  +date generatedDate
}

BoothManager "1" --> "many" Report
