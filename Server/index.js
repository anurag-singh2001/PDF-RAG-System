import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from "bullmq";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { QdrantVectorStore } from "@langchain/qdrant";


const VECTOR_SIZE = 4096;

const queue = new Queue("file-upload-queue", {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(cors());

app.get('/', (req, res) => {
  return res.json({ status: 'Server is running' });
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await queue.add('file-ready', JSON.stringify({
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
  }))
  return res.json({ message: 'File uploaded successfully' });
});

app.get('/chat', async (req, res) => {
  try {
    const userQuery = req.query.message;
    console.log("User query:", userQuery);

    // 1️⃣ Use the same embeddings model as in worker.js
    const embeddings = new OllamaEmbeddings({
      model: "llama2", // or whatever model you used during upload
      baseUrl: "http://localhost:11434", // default Ollama endpoint
    });

    // 2️⃣ Connect to Qdrant collection (same name as worker)
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: "http://localhost:6333",
      collectionName: "langchainjs-testing",
      vectorSize: VECTOR_SIZE,
    });

    // 3️⃣ Retrieve relevant chunks
    const retriever = vectorStore.asRetriever({ k: 3 });
    const result = await retriever.invoke(userQuery);


    if (!result || result.length === 0) {
      console.warn("⚠️ No relevant context found in Qdrant");
      return res.json({
        answer: "I could not find that in the provided PDF context.",
        sources: [],
        contextUsed: "",
        rawModelResponse: null
      });
    }

    const contextText = result.map(r => r.pageContent).join("\n\n");

    const sources = result.map((r, idx) => ({
      index: idx + 1,
      source: r.metadata?.source || "unknown.pdf",
      page: r.metadata?.loc?.pageNumber || "N/A",
      preview: r.pageContent?.slice(0, 300) || ""
    }));

    // 4️⃣ Create a prompt for the LLM
    const SYSTEM_PROMPT = `
    You are a domain-specific assistant that answers questions based strictly on the PDF content below. 
    Do NOT say you don't know if the answer is in the context. 
    Use only information found in the provided text. 
    If it's not there at all, say exactly: "I could not find that in the provided PDF context."

    Instructions:
    1. Read the provided context carefully.
    2. Summarize the answer clearly and concisely.
    3. Include references to page numbers or documents if possible.

    Context (from uploaded PDFs):
    ${contextText}

    User Question: ${userQuery}
    `;

    // 5️⃣ Run local LLM (like llama3, mistral, etc.)
    const llm = new Ollama({
      model: "llama2", // or your preferred local model
      baseUrl: "http://localhost:11434",
      config: {
        timeout: 60000 // 60 seconds
      }
    });

    const chatResult = await llm.invoke(SYSTEM_PROMPT);
    console.log("🤖 Model response:\n", chatResult);
    console.log("📚 Sources used:\n", sources);
    // 6️⃣ Return response
    return res.json({
      answer: chatResult,        // processed model response
      rawModelResponse: chatResult, // raw text as-is from LLM
      sources: sources,          // detailed info about each chunk
      contextUsed: contextText   // full combined context
    });



  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(8000, () => console.log(`Server started on port: ${8000}`));
