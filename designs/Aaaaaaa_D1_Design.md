# D1 Design Models and Design Rationale
---

# C4 Context Diagram

<img width="1229" height="661" alt="C4_Context" src="https://github.com/user-attachments/assets/bc51945b-0e41-4ea6-b214-af0ec6e9c527" />

---

# C4 Container Diagram

<img width="1401" height="711" alt="C4_Container" src="https://github.com/user-attachments/assets/feb9fbb9-2f40-4ed7-b0ad-abd7abd0ea09" />

---

# C4 Component Diagram

<img width="625" height="827" alt="C4_Component" src="https://github.com/user-attachments/assets/081da7f0-b71e-441a-a87e-ecb5f1cbae87" />

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

## DFD Level 1
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
```

# Design Rationale
The system models were created based on the functional and non-functional requirements of the Booth Organizer System to clearly represent the system structure, responsibilities, interactions, and system boundaries.

The Use Case Model represents the system from the user perspective and directly reflects the functional requirements. It shows how the main actors—General User, Merchant, and Booth Manager—interact with the system to perform tasks such as registration, booth reservation, payment, and event management. This model helps identify the core system features and clarifies system boundaries by distinguishing between internal system functions and external services such as the MOI API and payment gateways.

The Context Diagram presents the system at a high level and defines the system boundary between the Booth Organizer System and external entities. It shows how actors such as General Users, Merchants, Booth Managers, and Executives interact with the system, as well as how the system communicates with external services including the MOI API, Credit Card Gateway, TrueMoney Wallet API, and Banking System. This model ensures that external responsibilities such as identity verification and payment processing are clearly separated from the internal system.

The Data Flow Diagram (DFD) focuses on how data moves through the system. It illustrates how information such as user registration data, reservation details, and payment information flows between users, system processes, databases, and external services. The DFD supports design decisions by defining clear process boundaries and showing how the system communicates with external services like the MOI identity verification API and payment systems. It also ensures that key processes such as payment validation and reservation confirmation follow the required workflow.

The Container Diagram describes the high-level technical architecture of the system by dividing it into major containers: the Web Application (Frontend), Backend API Server, and Database. The frontend provides the user interface for general users, merchants, and booth managers, while the backend handles the core business logic such as authentication, reservation management, payment processing, and reporting. The database stores persistent data including users, booths, reservations, and payment records. This separation supports important non-functional requirements such as scalability, maintainability, and security.

The Component Diagram further decomposes the backend into smaller functional components, including Authentication, User Management, Event Management, Booth Management, Reservation, Payment, Notification, and Reporting components. Each component is responsible for a specific part of the system functionality. For example, the Reservation component handles booth booking and prevents double booking, while the Payment component manages financial transactions and integrates with external payment services. This modular structure supports maintainability and scalability by assigning clear responsibilities to each component and enabling loosely coupled interactions between modules.

Finally, the Class Diagram models the internal structure of the system by defining key entities such as User, Merchant, BoothManager, Event, Booth, Reservation, and Payment. The model shows how these entities relate to each other and supports system design decisions by assigning clear responsibilities to each class. For example, the inheritance relationship between User, Merchant, and BoothManager reflects role-based functionality, while the relationships between Reservation, Booth, and Payment represent the reservation and payment workflow defined in the requirements.
Together, these models provide a comprehensive view of the Booth Organizer System. The Use Case Diagram defines system functionality, the Context Diagram defines system boundaries, the DFD explains data flow and interactions, the Container and Component diagrams describe the system architecture, and the Class Diagram represents the internal system structure. This layered modeling approach supports modularity, scalability, maintainability, and clear responsibility separation within the system design.
