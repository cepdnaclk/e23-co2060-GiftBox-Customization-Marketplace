---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e23-co2060-GiftBox-Customization-Marketplace
title: GiftBox-Customization-Marketplace
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

# 🎁 Giftora — Personalized Gift Box Marketplace

> A centralized multi-vendor platform where customers can browse products from multiple independent vendors, assemble fully customized gift boxes, and have the selected items quality-checked, professionally packaged, and delivered as a single, cohesive parcel.

![React](https://img.shields.io/badge/React-v18+-61DAFB?style=flat-square&logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-v3+-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-v8+-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)
![Azure](https://img.shields.io/badge/Azure-App%20Service-0089D6?style=flat-square&logo=microsoftazure&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)
![Aiven](https://img.shields.io/badge/Aiven-MySQL-FF3554?style=flat-square&logo=aiven&logoColor=white)

---

## 📌 Table of Contents
1. [Team Details](#-team-details)
2. [Background & Motivation](#-background--motivation)
3. [Our Solution](#-our-solution)
4. [System Architecture & Methodology](#-system-architecture--methodology)
5. [Technology Stack](#-technology-stack)
6. [Software Design & Roles](#-software-design--roles)
7. [Implementation & Challenges](#-implementation--challenges)
8. [Testing Strategy](#-testing-strategy)
9. [API Endpoints](#-api-endpoints)
10. [Individual Contributions](#-individual-contributions)
11. [Project Timeline & Future Work](#-project-timeline--future-work)
12. [Links](#-links)

---

## 👥 Team Details

**Group No:** E23 GR33  
**Module:** CO2060 — Software Systems Design Project  
**Department:** Computer Engineering, University of Peradeniya  
**Year:** 2026  

| Student ID | Name | Email |
|------------|------|-------|
| **E/23/167** | Karunarathna A. V. P. J. P. | [e23167@eng.pdn.ac.lk](mailto:e23167@eng.pdn.ac.lk) |
| **E/23/351** | Sanjuna K. D. | [e23351@eng.pdn.ac.lk](mailto:e23351@eng.pdn.ac.lk) |
| **E/23/412** | Vidanya A. P. S. | [e23412@eng.pdn.ac.lk](mailto:e23412@eng.pdn.ac.lk) |
| **E/23/416** | Vishwaka A. G. S. | [e23416@eng.pdn.ac.lk](mailto:e23416@eng.pdn.ac.lk) |

---

## 🚩 Background & Motivation

### The Problem
Online gift-giving remains a fragmented experience. A customer who wants to send a multi-item, personalized gift is typically forced to place separate orders on different vendor websites, coordinate delivery timing manually, and hope that each item arrives in acceptable packaging. 

Existing local platforms such as Wishque and RealGift provide curated gift catalogues, but they largely operate on a single-seller or drop-shipping model rather than allowing genuine multi-vendor customization at the item level. Furthermore, existing platforms use rigid, one-size-fits-all product forms that cannot capture attributes specific to a gift category (e.g., box size or occasion).

---

## 💡 Our Solution

Giftora introduces a **centralized assembly workflow** supported by an **Entity–Attribute–Value (EAV)** inspired schema that allows category-specific product attributes without rigid database tables. 

### The End-to-End Workflow:
1. **Browse**: Customers browse a unified catalogue aggregating products from all registered vendors.
2. **Assemble**: Customers assemble a custom gift box, selecting slots and items in a single session and placing a single order.
3. **Split Order**: The platform's order-splitting logic automatically generates per-vendor sub-orders from the single customer order.
4. **Dispatch**: Vendors dispatch their portion of the order to a centralized assembly point.
5. **Quality Check**: Items are quality-checked and professionally packaged into one unified gift box before final dispatch.
6. **Track**: The customer tracks the entire order, including component-level status, through a single interface.

---

## 🏗️ System Architecture & Methodology

The project follows an iterative, **Agile-inspired development process** organized into short, weekly sprints. Continuous integration is enforced through Git and GitHub Actions.

### Deployment Architecture
- **Frontend (Client)**: Hosted on **Vercel** with auto-deployments linked to the repository.
- **Backend (API)**: Hosted on **Azure App Service** utilizing the GitHub Student Developer Pack.
- **Database**: Managed **Aiven MySQL** instance, secured with TLS-encrypted connections.
- **CI/CD Pipeline**: A dedicated GitHub Actions workflow synchronizes the organization's `develop` branch with a personal fork's deployment branch, triggering redeployment across environments seamlessly.

```text
[React.js Frontend (Vercel)]  ←→  [Spring Boot REST API (Azure)]  ←→  [MySQL Database (Aiven)]
             ↕                                   ↕
   [Customer / Vendor GUI]       [JWT Auth | RBAC | Order Splitting Engine]
```

---

## 🛠️ Technology Stack

| Layer | Technology / Tool |
|-------|-----------|
| **Frontend UI** | React.js (v18+), CSS3 |
| **Backend API** | Spring Boot (Java 17, Maven) |
| **Database** | MySQL (v8+) |
| **Authentication** | JWT (JSON Web Tokens), BCrypt Hashing |
| **Hosting & CI/CD**| Vercel, Azure App Service, Aiven, GitHub Actions |
| **Testing** | JUnit (Backend), Jest (Frontend), Postman (API) |

---

## 📐 Software Design & Roles

### User Roles & Access Levels
Access is enforced through **Role-Based Access Control (RBAC)** implemented via JWT claims.
- **Customer**: Browses products, builds gift boxes, places orders, and tracks order status.
- **Vendor**: Lists and manages products; views and fulfils incoming sub-orders. Restricted to their own catalogue.
- **Admin**: Top-level access to approve vendor registrations, monitor system health, and oversee platform operations.
- **Assembler** *(Future Phase)*: Verifies incoming vendor items at the centralized assembly point, checks quality, and confirms packaging.

### Core Modules
1. **User Management**: Stateless JWT auth, BCrypt hashing, and strict RBAC enforced at API and UI layers.
2. **Gift Box Customization Engine**: An interactive canvas allowing customers to add cross-vendor items, view real-time totals, and save drafts. Backed by an EAV database schema for flexible attributes.
3. **Vendor & Item Management**: Vendor portal to manage stock and listings.
4. **Order Management & Splitting**: Master order record creation instantly splitting into sub-orders for vendors.
5. **Milestone-Based Tracking**: Customers see a clear timeline: *Order Placed → Vendor Processing → Dispatched to Hub → Quality Inspection → Out for Delivery*.

---

## 📈 Implementation & Challenges

### Milestones Achieved
- ✅ Secure user authentication and RBAC (JWT, BCrypt).
- ✅ Multi-vendor product catalogue with images, highlights, and reviews.
- 🟡 Gift box builder with category-specific attributes (Partially Implemented).
- 🟡 Order splitting engine (Partially Implemented).

### Technical Challenges Resolved
1. **Hibernate `LazyInitializationException`**: Prevented 500 errors by restructuring entity fetch strategies, executing schema migrations, and introducing DTO-based projections to avoid lazy-loading outside active sessions.
2. **CORS Configuration**: Explicit allowed-origin configuration was required to permit cross-domain API requests between the Vercel-hosted frontend and Azure-hosted backend.
3. **Security Remediation**: Initial hardcoded SMTP credentials were mitigated by rotating keys and migrating to environment-variable-driven configuration.
4. **Deployment Blocking**: An expired OAuth token blocked Vercel redeployment. Resolved by reconnecting a personal fork and reconfiguring the sync workflow.

---

## 🧪 Testing Strategy

The system is verified across four strategies:
- **Unit Tests**: Backend service methods tested with JUnit; frontend components tested with Jest.
- **Integration Tests**: API endpoints verified against SRS requirements using Postman collections.
- **System Tests**: End-to-end user journeys simulated on the deployed staging environment.
- **Security Tests**: JWT validation, RBAC enforcement, and input sanitisation verified through targeted API tests.

---

## 🔌 API Endpoints

### Authentication & Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/customer/profile` | Get customer profile |
| POST | `/api/cart/add` | Add customized box to cart |
| GET | `/api/orders/customer` | Get all customer orders |

### Vendor (Seller)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/items` | Get seller's listed items |
| POST | `/api/seller/items` | Add new item |
| PUT | `/api/seller/items/{id}` | Update item |
| GET | `/api/seller/orders` | Get vendor-specific sub-orders |

---

## 👨‍💻 Individual Contributions

| Name (Index No) | Assigned Area & Completed Work |
|-----------------|--------------------------------|
| **Karunarathna A. V. P. J. P.**<br>(E/23/167) | **Vendor Module Frontend & Customer Portal UI/UX:**<br>Designed and implemented the complete Vendor module frontend (`SellerDashboard`, `AddItems`, `MyItems`, `Settings`). Connected vendor components to the backend REST API for product CRUD. Contributed to Customer portal frontend (`CartPage`, `GiftCustomizer`), assisting in integrating cart and order placement functionality. |
| **Vishwaka A. G. S.**<br>(E/23/416) | **Authentication, Vendor App UI/UX & DB Management:**<br>Implemented the complete customer login and auth system. Engineered the JWT authentication pipeline (token generation, signing, stateless validation via custom filter). Developed Vendor application UI/UX and managed the MySQL DB design for authentication and vendor-related modules. |
| **Vidanya A. P. S.**<br>(E/23/412) | **Landing Page & Customer Page UI/UX:**<br>Designed and developed all pages of the public-facing Landing Page (`HomePage`, `AboutUsPage`, `ProductsPage`). Connected components to enable dynamic product catalogue rendering via `/api/items`. Implemented shared UI components (`Header`, `Footer`, `CartBadge`). Maintained overall layout consistency. |
| **Sanjuna K. D.**<br>(E/23/351) | **Admin Module UI/UX, Full Backend & Database Implementation:**<br>Implemented the complete Admin role UI/UX (`Dashboard`, `Customers`, `Partners`, `StaffManagement`). Designed, implemented, and managed the MySQL relational database including Flyway schema migrations and entity-mapping fixes (e.g. `StaleObjectStateException`). Built all Spring Boot backend implementation including controllers, repositories, and service logic. |

---

## 🗓️ Project Timeline & Future Work

### Past Phases (Completed)
- **Phase 1 (Weeks 1-5):** System Design, Database Modeling, User Auth, and Vendor Registration.
- **Phase 2 (Weeks 6-10):** Core Marketplace Browsing, Vendor Dashboard, Filtering, and basic Cart integration.

### Future Work (Weeks 11-14)
The final phase focuses on implementing advanced multi-vendor gifting mechanics and preparing for production launch:
1. **Upgrade Gift Box Mechanics**: Enhancing the core gift box builder logic to ensure customers experience a seamless and intuitive process when customizing multi-vendor items.
2. **Implement Assembler System**: Developing the backend assembler interface for operations staff to efficiently manage order splitting and coordinate the physical aggregation of boxes.
3. **Delivery & Tracking System**: Building out the unified tracking logistics to ensure customers receive consolidated, real-time updates for multi-item orders.
4. **Integration Testing & Deployment**: Comprehensive end-to-end integration testing across all developed modules (frontend, backend, DB) before the final production deployment in Week 14.

---

## 🔗 Links
- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name }}/){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)