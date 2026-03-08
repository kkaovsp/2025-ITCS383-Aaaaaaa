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

(JPEG To be added)
## Diagram by Mermaid
```mermaid
flowchart LR

%% Primary Actors (Forced to the Left)
GU[General User]
M[Merchant]
BM[Booth Manager]
EX[Executive]

%% Actor inheritance (Dotted to reduce visual clutter)
M -.->|inherits| GU

%% System Boundary
subgraph Booth_Organizer_System [Booth Organizer System]
    %% Declaring Use Cases in strict Top-to-Bottom order to prevent line crossing
    
    %% General User & Merchant Core
    UC1([Browse Events])
    UC2([Search Booths])
    UC3([View Booth Details])
    UC4([View Announcements])
    UC5([Register Account])
    
    UC6([Login])
    UC7([Reserve Booth])
    UC8([Make Payment])
    UC9([Upload Payment Slip])
    UC10([View Reservation Status])
    UC11([View Payment Status])

    %% System Level Actions
    UC19([Send Notification])
    
    %% Booth Manager & Executive Core
    UC20([View Notifications])
    UC12([Manage Events])
    UC13([Manage Booths])
    UC14([Approve Merchant Registration])
    UC15([Verify Payment])
    UC16([Generate Reports])
    UC17([Manage Announcements])
    UC18([View Summary Reports])
end

%% External Systems (Forced to the Right)
MOI[MOI]
CC[Credit Card Gateway]
TM[TrueMoney Wallet]
BANK[Banking]

%% Primary Actor Connections (Solid lines, no arrows for strict UML)
GU --- UC1
GU --- UC2
GU --- UC3
GU --- UC4
GU --- UC5

M --- UC6
M --- UC7
M --- UC8
M --- UC9
M --- UC10
M --- UC11

BM --- UC20
BM --- UC12
BM --- UC13
BM --- UC14
BM --- UC15
BM --- UC16
BM --- UC17

EX --- UC18

%% External System Connections 
%% Using standard arrows (-->) here is the secret trick. It forces Mermaid 
%% to push these nodes into a new column on the far right.
UC5 --> MOI
UC14 --> MOI

UC8 --> CC
UC8 --> TM

UC9 --> BANK
UC15 --> BANK

%% Use Case Relationships (Dotted arrows)
UC7 -.->|"«include»"| UC3
UC8 -.->|"«include»"| UC7
UC9 -.->|"«extend»"| UC8

%% Notification Includes
UC5 -.->|"«include»"| UC19
UC7 -.->|"«include»"| UC19
UC9 -.->|"«include»"| UC19
```
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
The system models were developed based on the functional and non-functional requirements of the Booth Organizer System in order to clearly represent the system functionality, architecture, data interactions, and structural design. Each model provides a different perspective of the system and collectively supports key design decisions such as defining system boundaries, assigning responsibilities to system components, and clarifying how different parts of the system interact.

The **Use Case Diagram** represents the system from the user’s perspective and directly reflects the functional requirements identified during requirements analysis. It illustrates how the primary actors, such as General User, Merchant, and Booth Manager, interact with the system to perform tasks such as account registration, booth reservation, payment processing, and event management. By modeling these interactions, the Use Case Diagram helps identify the core system features and clarifies the system boundary by distinguishing between internal system functionality and external services such as the MOI identity verification API and payment gateways.

The **Context Diagram** presents the Booth Organizer System at the highest level and defines the overall system boundary. It shows how external actors, including General Users, Merchants, Booth Managers, and Executives, interact with the system, as well as how the system communicates with external services such as the MOI API, Credit Card Gateway, TrueMoney Wallet API, and the Banking System. This model supports an important design decision by clearly separating internal system responsibilities from external services, ensuring that identity verification and payment processing are handled by dedicated external systems rather than implemented internally.

The **Container Diagram** describes the high-level technical architecture of the system by dividing it into major containers: the Web Application (Frontend), Backend API Server, and Database. The frontend provides the user interface that allows general users, merchants, and booth managers to interact with the system. The backend server implements the core business logic, including authentication, reservation management, payment processing, and report generation. The database stores persistent system data such as user accounts, events, booths, reservations, and payment records. This architectural separation supports key non-functional requirements including scalability, maintainability, and security by separating the presentation layer, application logic, and data storage.

The **Component Diagram** further decomposes the backend system into smaller functional modules, including Authentication, User Management, Event Management, Booth Management, Reservation Management, Payment Processing, and Reporting components. Each component is responsible for a clearly defined part of the system functionality. For example, the Reservation component manages booth booking operations and ensures that booths cannot be double-booked, while the Payment component handles financial transactions and manages integration with external payment gateways. This modular design supports maintainability and scalability by assigning clear responsibilities to each component and enabling loosely coupled interactions between modules.

The **Data Flow Diagram (DFD)** focuses on how information moves through the system. It illustrates how data such as user registration information, reservation details, and payment data flows between external actors, system processes, data stores, and external services. By modeling these data flows, the DFD helps define clear process boundaries and ensures that key workflows such as merchant registration, booth reservation, payment verification, and reservation confirmation follow the required sequence of operations. The DFD also clarifies how the system interacts with external services, including the MOI identity verification API and payment processing systems.

Finally, the **Class Diagram** models the internal structure of the system by defining the main domain entities and their relationships. Key classes include User, Merchant, BoothManager, Event, Booth, Reservation, and Payment. The diagram reflects role-based system functionality through the inheritance relationship between User, Merchant, and BoothManager, allowing shared user attributes to be reused while enabling role-specific behavior. The relationships between Reservation, Booth, and Payment represent the reservation and payment workflow defined in the functional requirements, ensuring that booth bookings and payment transactions are properly linked within the system.

Together, these models provide a comprehensive representation of the Booth Organizer System from multiple perspectives. The Use Case Diagram defines the system functionality, the Context Diagram establishes the system boundary and external interactions, the Data Flow Diagram explains how data moves through the system, the Container and Component diagrams describe the system architecture and internal modular structure, and the Class Diagram represents the internal data model and object relationships. This layered modeling approach supports modularity, scalability, maintainability, and clear separation of responsibilities within the system design.
