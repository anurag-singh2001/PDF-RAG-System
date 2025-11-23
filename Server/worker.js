import { Worker } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CharacterTextSplitter } from '@langchain/textsplitters';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
// Initialize BullMQ worker

const VECTOR_SIZE = 4096;

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    try {
      console.log('🚀 Job received:', job.data);

      const data = JSON.parse(job.data);
      if (!data.path) {
        console.error('❌ No file path found in job data');
        return;
      }

      // Step 1: Load PDF
      console.log(`📄 Loading PDF from: ${data.path}`);
      const loader = new PDFLoader(data.path);
      const rawDocs = await loader.load();
      console.log(`📚 Loaded ${rawDocs.length} raw documents from PDF`);

      // Step 2: Split into chunks
      const splitter = new CharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
      const chunks = await splitter.splitDocuments(rawDocs);
      console.log(`✂️ Split into ${chunks.length} chunks`);

      if (!chunks.length) {
        console.warn('⚠️ No chunks found, skipping job');
        return;
      }

      // Step 3: Initialize local embeddings (Ollama)
      console.log('🧠 Initializing local embeddings (Ollama)...');
      const embeddings = new OllamaEmbeddings({
        model: 'llama2', // replace with your local Ollama model name
      });

      // Step 4: Connect to Qdrant
      console.log('🔗 Connecting to Qdrant...');
      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: 'http://localhost:6333',
        collectionName: 'langchainjs-testing',
        vectorSize: VECTOR_SIZE,
      });
      console.log('✅ Connected to Qdrant');

      // Step 5: Add each chunk
      console.log('💾 Adding chunks to vector store...');
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk.pageContent || chunk.pageContent.trim() === '') {
          console.warn(`⚠️ Skipping empty chunk ${i}`);
          continue;
        }
        try {
          console.log(`🧩 Embedding chunk ${i}: ${chunk.pageContent.slice(0, 50)}...`);
          await vectorStore.addDocuments([chunk]);
          console.log(`✅ Chunk ${i} added`);
        } catch (err) {
          console.error(`❌ Failed to add chunk ${i}:`, err);
        }
      }

      console.log('🎉 All chunks processed!');
    } catch (err) {
      console.error('❌ Unexpected worker error:', err);
    }
  },
  {
    concurrency: 5, // adjust based on your system
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }
);

console.log('👷 Worker is running and waiting for jobs...');
