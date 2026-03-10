# D1 Design Models and Design Rationale
---

# C4 Context Diagram

<img width="3344" height="1418" alt="C4_Context" src="https://github.com/user-attachments/assets/464c0898-ea69-4725-9e52-86a4506f9277" />

---

# C4 Container Diagram

<img width="3424" height="1542" alt="C4_Container" src="https://github.com/user-attachments/assets/094225f1-dc20-435a-8144-e3f03953f6dc" />

---

# C4 Component Diagram

<img width="3264" height="3418" alt="C4_Component" src="https://github.com/user-attachments/assets/f7890ab1-823e-4fe4-92d5-8e6c91b1e5c0" />

---

# Use Case Diagram

<img width="5863" height="6676" alt="Use_Case" src="https://github.com/user-attachments/assets/0c1787d1-8313-4bf8-af0f-c977cfb0f0c5" />

## Diagram by Mermaid
```mermaid
flowchart LR

%% Primary Actors (Forced to the Left)
GU[General User]
M[Merchant]
BM[Booth Manager]
%% Executive removed: Receives reports outside the system

%% Actor inheritance (Dotted to reduce visual clutter)
M -.->|inherits| GU

%% System Boundary
subgraph Booth_Organizer_System [Booth Management System]
    
    %% General User & Merchant Core
    UC1([Browse Events])
    UC2([Search Booths])
    UC3([View Booth Details])
    UC4([View Announcements])
    UC5([Register Account])
    UC21([Verify Citizen ID])
    
    UC6([Login])
    UC7([Reserve Booth])
    UC8([Make Payment])
    UC9([Upload Payment Slip])
    UC10([View Reservation Status])
    UC11([View Payment Status])

    %% System Level Actions (In-App Notification)
    UC19([Send Notification])
    
    %% Booth Manager Core
    UC20([View Notifications])
    UC12([Manage Events])
    UC13([Manage Booths])
    UC14([Approve Merchant Registration])
    UC15([Verify Payment])
    UC16([Generate Reports])
    UC17([Manage Announcements])
end

%% External Systems (Forced to the Right)
MOI[MOI API]
CC[Credit Card Gateway]
TM[TrueMoney Wallet]
BANK[Banking System]

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

%% External System Connections 
UC21 --> MOI
UC14 --> MOI

UC8 --> CC
UC8 --> TM

UC9 --> BANK
UC15 --> BANK

%% Use Case Relationships (Dotted arrows)
UC7 -.->|"«include»"| UC3
UC8 -.->|"«include»"| UC7
UC9 -.->|"«extend»"| UC8
UC5 -.->|"«include»"| UC21

%% Notification Includes (Triggering the In-App alert)
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
PG[Payment Gateways]
BANK[Bank System]

%% Main Process
SYS((Booth Management System))

%% General User Flows (Updated with Registration)
GU -->|Search Request| SYS
GU -->|Event Request| SYS
GU -->|Registration Data| SYS

SYS -->|Event Information| GU
SYS -->|Booth Information| GU
SYS -->|Announcements| GU
SYS -->|Registration Status| GU

%% Merchant Flows (Registration removed)
M -->|Login Data| SYS
M -->|Reservation Request| SYS
M -->|Payment Data| SYS
M -->|Payment Slip| SYS

SYS -->|Reservation Confirmation| M
SYS -->|Payment Status| M
SYS -->|Booth Availability| M

%% Booth Manager Flows
BM -->|Event Data| SYS
BM -->|Booth Data| SYS
BM -->|Announcement Data| SYS
BM -->|Approval Decisions| SYS
BM -->|Payment Verification| SYS

SYS -->|Registration Requests| BM
SYS -->|Reservation Requests| BM
SYS -->|Payment Requests| BM
SYS -->|Reports| BM
SYS -->|Notifications| BM

%% MOI Verification
SYS -->|Citizen ID| MOI
MOI -->|Verification Result| SYS

%% Payment Gateways (Credit Card / TrueMoney)
SYS -->|Payment Request| PG
PG -->|Payment Result| SYS

%% Bank System (Slip Verification)
SYS -->|Payment Slip Data| BANK
BANK -->|Transfer Verification| SYS
```

## DFD Level 1
```mermaid
flowchart LR

%% External Entities
GU[General User]
M[Merchant]
BM[Booth Manager]
MOI[MOI System]
PG[Payment Gateways]
BANK[Bank System]

%% Processes
P1((1. User Management))
P2((2. Event & Booth Management))
P3((3. Reservation Management))
P4((4. Payment Management))
P5((5. Reporting))
P6((6. Notification Management))

%% Data Stores
D1[(D1 User Database)]
D2[(D2 Event Database)]
D3[(D3 Booth Database)]
D4[(D4 Reservation Database)]
D5[(D5 Payment Database)]
D6[(D6 Notification Database)]

%% --------------------
%% Process 1 User Management
GU -->|Registration Data| P1
P1 -->|Registration Status| GU

M -->|Login Data| P1
P1 -->|Login Result| M

P1 -->|Registration Requests| BM
BM -->|Approval Decisions| P1

P1 -->|Citizen ID| MOI
MOI -->|Verification Result| P1

P1 -->|User Record| D1
D1 -->|User Data| P1

P1 -->|Registration Event| P6

%% --------------------
%% Process 2 Event & Booth
GU -->|Search Request| P2
GU -->|Event Request| P2

BM -->|Event Data| P2
BM -->|Booth Data| P2
BM -->|Announcement Data| P2

P2 -->|Event Information| GU
P2 -->|Booth Information| GU
P2 -->|Announcements| GU

P2 -->|Event Record| D2
D2 -->|Event Data| P2

P2 -->|Booth Record| D3
D3 -->|Booth Data| P2

%% --------------------
%% Process 3 Reservation
M -->|Reservation Request| P3

P3 -->|Reservation Confirmation| M
P3 -->|Booth Availability| M

P3 -->|Reservation Requests| BM

P3 -->|Booth Availability Request| D3
D3 -->|Booth Availability Data| P3

P3 -->|Reservation Record| D4
D4 -->|Reservation Data| P3

P3 -->|Reservation Event| P6

%% --------------------
%% Process 4 Payment
M -->|Payment Data| P4
M -->|Payment Slip| P4

P4 -->|Payment Status| M

P4 -->|Payment Requests| BM
BM -->|Payment Verification| P4

P4 -->|Payment Request| PG
PG -->|Payment Result| P4

P4 -->|Payment Slip Data| BANK
BANK -->|Transfer Verification| P4

P4 -->|Payment Record| D5
D5 -->|Payment Data| P4

P4 -->|Payment Slip Event| P6

%% --------------------
%% Process 5 Reporting
BM -->|Report Request| P5
P5 -->|Generated Reports| BM

D1 -->|User Data| P5
D2 -->|Event Data| P5
D4 -->|Reservation Data| P5
D5 -->|Payment Data| P5

%% --------------------
%% Process 6 Notification Management

P6 -->|Notification Record| D6
D6 -->|Notification Data| P6

P6 -->|Notifications| BM
```

---

# Class Diagram

```mermaid
classDiagram

%% Base User

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

%% General User

class GeneralUser {
  +browseEvents()
  +searchBooths()
  +viewBoothDetails()
  +viewAnnouncements()
  +registerAccount()
}

%% Merchant

class Merchant {
  +string citizenId
  +string productDescription
  +string approvalStatus
  +reserveBooth()
  +makePayment()
  +uploadSlip()
  +viewReservationStatus()
}

%% Booth Manager

class BoothManager {
  +createEvent()
  +updateEvent()
  +approveMerchant()
  +verifyPayment()
  +generateReport()
  +viewNotifications()
}

%% Inheritance

User <|-- GeneralUser
GeneralUser <|-- Merchant
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

%% Notification System

class Notification {
  +int notificationId
  +string message
  +dateTime createdAt
  +string type
  +string status
  +sendNotification()
}

BoothManager "1" --> "many" Notification

%% Reporting

class Report {
  +int reportId
  +string reportType
  +date generatedDate
}

BoothManager "1" --> "many" Report
```
---

# System Architecture and Design Rationale

The system models were developed based on the requirements of the Booth Organizer System to clearly show how the system works, how it is built, and how data moves through it. Each model gives a different view of the project and helps explain our key design choices, such as deciding what is built inside the system versus what uses external services.

The **Use Case Diagram** shows the system from the user’s point of view. It highlights how the active users, such as General Users, Merchants, and Booth Managers, interact with the system to perform tasks including registering, booking booths, paying, and managing events. This diagram helps clearly draw the line between our system's internal features (such as generating in-app notifications) and the external APIs we connect to.

The **Context Diagram** shows the big picture of the Booth Organizer System. It maps out all the human actorsincluding Executives, who act as stakeholders receiving reports from the Booth Manager outside the main software and the external systems we rely on. A major design decision shown here is keeping the MOI API, Credit Card Gateway, TrueMoney Wallet, and the Bank System as external services, while choosing to handle notifications internally rather than relying on a third-party messaging app.

The **Container Diagram** breaks down the high-level technical setup into three main parts: the Web Application (Frontend), Backend API Server, and Database. The frontend gives users their interface, while the backend API handles the core logic, including login security, booking workflows, payment processing, and creating in-app alerts. The database stores all persistent information, such as user accounts, events, and payment records. This standard three-tier setup makes the system secure, easy to maintain, and ready to grow.

The **Component Diagram** zooms in on the backend API and breaks it down into smaller, focused modules: Authentication, User, Event, Booth, Reservation, Payment, Reporting, and Notification components. Each part has a specific job. For example, the Reservation Component makes sure a booth cannot be double-booked, the Payment Component talks to the external gateways, and the Notification Component handles alerts for the Booth Manager. Breaking the code down this way keeps the system organized and easier for developers to update.

The **Data Flow Diagram (DFD)** shows exactly how information travels. It maps out how a General User submits registration data to become a Merchant, and how booking details and payment data flow between users, the database, and external services. The DFD makes sure our core workflows, particularly separating automated gateway payments from manual bank transfer verifications, follow a logical, step-by-step path.

Finally, the **Class Diagram** maps out the database structure by defining the main entities (including User, Merchant, BoothManager, Event, Booth, Reservation, and Payment) and how they connect. It uses inheritance to show that Merchants and Booth Managers are specialized types of Users. The links between Reservations, Booths, and Payments directly match our business rules, making sure every booking is properly tied to a financial transaction.

Together, these models give a complete, multi-layered view of the Booth Organizer System. From defining the user goals in the Use Case Diagram to mapping the code structure in the Component Diagram, this approach proves our system is well-organized, scalable, and has clearly separated responsibilities.
