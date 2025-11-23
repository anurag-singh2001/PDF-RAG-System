# 🧠 PDF RAG System — Local AI Chat with Ollama, Qdrant & LangChain

A complete **Retrieval-Augmented Generation (RAG)** pipeline that allows you to **upload PDFs**, generate **local embeddings using Ollama**, store them in **Qdrant**, and **chat with your documents** — fully offline and without any deployed LLM.

---

## 📘 Overview

This project enables an **end-to-end local RAG flow** powered by open-source technologies:

- 📄 Upload and process PDFs  
- ✂️ Split and embed chunks locally using **Ollama**  
- 💾 Store embeddings in **Qdrant**  
- 💬 Query and chat with context-aware answers from documents  
- ⚙️ Handle background tasks with **BullMQ (Redis)**  



---

## ⚙️ Tech Stack

| Component | Technology | Description |
|------------|-------------|--------------|
| **Backend Runtime** | 🟦 Node.js (v22+) | Handles API and worker processes |
| **Framework** | ⚡ Express.js | REST layer for upload and chat |
| **Queue System** | 🧩 BullMQ + Redis | Background job handling for PDF ingestion |
| **Embeddings & LLM** | 🦙 Ollama | Local model used for embeddings & chat |
| **Vector Database** | 🧱 Qdrant | Vector similarity search engine |
| **AI Framework** | 🔗 LangChain.js | Orchestrates PDF loading, embedding, and retrieval |
| **Document Loader** | 📚 LangChain PDFLoader | Extracts text from PDFs |
| **Frontend** | ⚛️ React + Tailwind | UI for uploading PDFs and asking questions |

---

## 🏗️ Architecture

```
                   ┌────────────────────────┐
                   │        FRONTEND         │
                   │ React + Tailwind UI     │
                   │ Upload PDF + Ask Query  │
                   └──────────┬──────────────┘
                              │
                              ▼
                   ┌────────────────────────┐
                   │        BACKEND          │
                   │ Express + BullMQ Queue  │
                   │ Handles upload & chat   │
                   └──────────┬──────────────┘
                              │
                     (Job Queued in Redis)
                              │
                              ▼
                   ┌────────────────────────┐
                   │         WORKER          │
                   │ PDFLoader + Splitter    │
                   │ OllamaEmbeddings        │
                   │ QdrantVectorStore       │
                   └──────────┬──────────────┘
                              │
                     (Embeddings Saved)
                              │
                              ▼
                   ┌────────────────────────┐
                   │         QDRANT          │
                   │ Vector DB (local)       │
                   │ Stores embeddings       │
                   └────────────────────────┘
```

---

## 🚀 Installation & Setup

### 1️⃣ Prerequisites

Ensure the following tools are installed:

- [Node.js 22+](https://nodejs.org/)
- [Redis](https://redis.io/docs/install/)
- [Ollama](https://ollama.com/download)
- [Qdrant](https://qdrant.tech/documentation/)

---

### 2️⃣ Start Required Services

**Redis**
```bash
redis-server
```

**Qdrant (via Docker)**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Ollama**
```bash
ollama serve
```

Make sure to pull your desired local model (e.g., `llama2`):
```bash
ollama pull llama2
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Start the Backend

Run both processes in separate terminals:

**Server (handles upload + chat)**
```bash
node --experimental-specifier-resolution=node index.js
```

**Worker (handles embeddings + Qdrant storage)**
```bash
node --experimental-specifier-resolution=node worker.js
```

---

## 💬 Using the System

### 🧾 Step 1: Upload PDF
Use the frontend interface to upload a document.  
It will be queued in **Redis**, processed by the **worker**, split into chunks, embedded locally using **Ollama**, and stored in **Qdrant**.

### 💭 Step 2: Ask Questions
Once uploaded, type your query 

---

## 🧠 How It Works (Behind the Scenes)

1. **File Upload:**  
   The PDF is sent to the server via Express & Multer.

2. **Job Queued:**  
   File metadata is pushed to **BullMQ** (connected to Redis).

3. **Worker Processing:**  
   - Loads the PDF using **LangChain’s PDFLoader**.  
   - Splits text into manageable chunks with **CharacterTextSplitter**.  
   - Generates embeddings locally using **OllamaEmbeddings**.  
   - Stores vectors in **Qdrant**.

4. **Chat Query:**  
   - Retrieves similar chunks from Qdrant.  
   - Combines them into a context prompt.  
   - Sends it to **Ollama LLM (Llama2)** for final answer generation.  

5. **Frontend Display:**  
   Displays the model’s response and references the pages used for context.

---

## 🧩 Technologies Breakdown

| Tool | Purpose | Why Used |
|------|----------|----------|
| **LangChain.js** | Orchestrates RAG pipeline | Easy integration between loaders, embeddings & retrievers |
| **Qdrant** | Vector similarity search | Fast, efficient local vector DB |
| **Ollama** | Local LLM engine | Offline text embedding & chat generation |
| **BullMQ + Redis** | Background processing | Manages async PDF ingestion |
| **Express.js** | REST API layer | Lightweight backend framework |
| **Next.js + Tailwind** | Frontend interface | Simple upload & chat UI |

---

## Screensot
---
<img width="1900" height="944" alt="image" src="https://github.com/user-attachments/assets/3df27f43-8a65-4a89-ad2b-62b41d90cf1c" />


