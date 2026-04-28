import type { Category } from "./types";

export const llms: Category = {
  slug: "llms",
  title: "LLMs & Generative AI",
  description:
    "Large language models from the ground up: transformer architecture, attention, tokenization, prompting, fine-tuning, embeddings, safety, and production cost optimization — covering the 2026 landscape of Claude 4, GPT-4o, Gemini 2.x, Llama 4, and mainstream reasoning models.",
  icon: "🤖",
  questions: [
    // ───── EASY ─────
    {
      id: "llm-what-is-llm",
      title: "What is a large language model?",
      difficulty: "easy",
      question: "Explain what a large language model (LLM) is, how it is trained, and what it actually predicts.",
      answer: `A **large language model** is a neural network — almost always a transformer — trained on a massive text corpus to model the probability distribution of language. At inference time it is an autoregressive next-token predictor: given a sequence of tokens it outputs a probability distribution over the vocabulary and samples the next token, appending it and repeating until a stop condition is met.

**Training stages (typical)**

| Stage | What happens |
|-------|-------------|
| Pre-training | Self-supervised next-token prediction on trillions of tokens (books, web, code, etc.) |
| Instruction tuning | Supervised fine-tune on curated prompt-response pairs so the model follows instructions |
| Alignment (RLHF / DPO) | Human preferences steer the model away from harmful, dishonest, or unhelpful outputs |

**Scale is the key lever.** "Large" typically means billions of parameters (Llama 4 Scout: 17 B active / 109 B total MoE; GPT-4o, Claude 4, Gemini 2.x: undisclosed but estimated hundreds of billions). More parameters + more data + more compute → better in-context reasoning, world knowledge, and instruction following.

**What LLMs are NOT** — they do not look facts up in real time (unless given tools), they do not have persistent memory across sessions by default, and they do not truly "understand" in a human sense — they compress statistical patterns.`,
      tags: ["fundamentals", "training"],
    },
    {
      id: "llm-transformer-overview",
      title: "Transformer architecture overview",
      difficulty: "easy",
      question: "Describe the high-level architecture of a transformer model. What are its main components?",
      answer: `The transformer (Vaswani et al., 2017) replaced recurrence with **attention** and **parallelism**. Decoder-only transformers (GPT, Llama, Claude, Gemini) power virtually every modern LLM.

\`\`\`
Input tokens
  → Token embeddings + Positional encoding
  → N × Decoder block:
      ├─ Masked Multi-Head Self-Attention
      ├─ Add & LayerNorm
      ├─ Feed-Forward Network (MLP)
      └─ Add & LayerNorm
  → Linear + Softmax → next-token probabilities
\`\`\`

**Key components**

| Component | Role |
|-----------|------|
| **Token embedding** | Maps each token ID to a dense vector (d_model dims) |
| **Positional encoding** | Injects sequence order info (learned or RoPE in modern models) |
| **Multi-head self-attention** | Each token attends to all previous tokens; multiple heads learn different relationship patterns |
| **Feed-forward network** | Two linear layers with a non-linearity (SwiGLU in modern LLMs); applied position-wise |
| **Layer norm** | Stabilises training; usually pre-norm (before attention) in modern architectures |
| **KV cache** | Stores past keys/values so each decode step is O(1) in sequence length rather than O(n) |

Modern improvements over vanilla transformers: **Grouped-Query Attention** (GQA) reduces memory, **RoPE** positional encoding generalises better to long contexts, **SwiGLU** activation outperforms ReLU, and **Mixture-of-Experts** (MoE) lets models have huge parameter counts while only activating a fraction per token (e.g., Llama 4, Mixtral).`,
      tags: ["architecture", "transformer"],
    },
    {
      id: "llm-attention-mechanism",
      title: "Attention mechanism — self-attention and multi-head attention",
      difficulty: "easy",
      question: "Explain how self-attention works and why multi-head attention is used instead of single-head attention.",
      answer: `**Self-attention** lets every token in a sequence look at every other token and decide how much to "attend" to each one.

For an input matrix X (sequence_len × d_model) the mechanism projects to three matrices:

\`\`\`
Q = X · W_Q   # Queries
K = X · W_K   # Keys
V = X · W_V   # Values

Attention(Q, K, V) = softmax( Q·Kᵀ / √d_k ) · V
\`\`\`

- The dot product Q·Kᵀ measures compatibility between each query and key.
- Dividing by √d_k prevents exploding gradients when d_k is large.
- The softmax converts scores to a probability distribution (attention weights).
- The output is a weighted sum of values — each token gets a context-aware representation.

**Why multi-head?**

A single attention head can only express one type of relationship at a time. **Multi-head attention** runs h independent attention heads in parallel, each with its own learned W_Q, W_K, W_V, then concatenates and projects:

\`\`\`
MultiHead(Q, K, V) = Concat(head_1, …, head_h) · W_O
\`\`\`

Different heads specialise — one might track syntactic dependencies, another coreference, another positional proximity. GPT-4o and Claude 4 use **grouped-query attention (GQA)**: Q heads are grouped and share K/V projections, drastically cutting the KV cache memory footprint with minimal quality loss.`,
      tags: ["architecture", "attention"],
    },
    {
      id: "llm-tokenization",
      title: "Tokenization — BPE, WordPiece, SentencePiece",
      difficulty: "easy",
      question: "What is tokenization in the context of LLMs? Compare BPE, WordPiece, and SentencePiece, and explain how to estimate token counts.",
      answer: `**Tokenization** converts raw text into integer IDs that the model processes. Tokens are subword units — roughly 1 token ≈ 0.75 English words, or about 4 characters.

**Algorithms**

| Algorithm | Used by | How it works |
|-----------|---------|-------------|
| **BPE** (Byte Pair Encoding) | GPT-4o, Llama 4, Mistral | Start with characters; iteratively merge the most frequent adjacent pair until vocabulary target is reached |
| **WordPiece** | BERT, Gemma | Like BPE but merges the pair that maximises the language model likelihood rather than raw frequency |
| **SentencePiece** | Llama (early), T5, Gemini | Language-agnostic; treats input as raw bytes so no pre-tokenisation needed; wraps BPE or unigram LM |

**Estimation**

\`\`\`python
# Quick rule of thumb
def estimate_tokens(text: str) -> int:
    return len(text) // 4          # ~4 chars/token for English

# Exact count via tiktoken (OpenAI models)
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
tokens = enc.encode("Hello, world!")
print(len(tokens))  # 4

# Exact count via Hugging Face tokenizer
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("meta-llama/Llama-4-Scout-17B-16E")
print(len(tok.encode("Hello, world!")))
\`\`\`

**Gotchas**
- Numbers tokenise poorly — "12345" may become 3+ tokens.
- Non-English and code tokenise less efficiently (more tokens per character).
- Whitespace is part of some tokens, so \`" dog"\` ≠ \`"dog"\`.
- Always use the model's own tokenizer; different models have different vocabularies.`,
      tags: ["tokenization", "fundamentals"],
    },
    {
      id: "llm-context-window",
      title: "Context window and why it matters",
      difficulty: "easy",
      question: "What is an LLM's context window? Why does it matter for production applications, and what are current limits?",
      answer: `The **context window** (or context length) is the maximum number of tokens — prompt + generated output combined — that a model can process in a single forward pass. Tokens outside the window are simply not visible to the model.

**Current limits (2026)**

| Model | Context window |
|-------|---------------|
| GPT-4o | 128 K tokens |
| Claude 4 Opus | 200 K tokens |
| Gemini 2.5 Pro | 1 M tokens |
| Llama 4 Maverick | 1 M tokens |

**Why it matters**

1. **Retrieval vs. stuffing** — If your document exceeds the context window you must chunk and retrieve (RAG). Even within the window, very long contexts can degrade quality (the "lost-in-the-middle" problem).
2. **Cost** — Most providers charge per token. A 200 K-token prompt costs 200× more than a 1 K-token prompt.
3. **Latency** — Time to first token scales with prompt length; KV cache memory scales linearly.
4. **Memory** — At inference, the KV cache consumes ~bytes per token per layer. A 200 K context at fp16 on a 96-layer model can consume >30 GB of GPU memory.

**Practical guidance**
- Keep system prompts concise.
- Use RAG for large document corpora rather than stuffing everything in.
- Place the most important content at the **beginning or end** of a long prompt — middle content is attended to less reliably.`,
      tags: ["context-window", "fundamentals", "production"],
    },
    {
      id: "llm-temperature-sampling",
      title: "Temperature, top-p, and top-k sampling",
      difficulty: "easy",
      question: "Explain temperature, top-p (nucleus sampling), and top-k sampling. When would you adjust each?",
      answer: `After the model computes logits over the vocabulary, **sampling parameters** control how the next token is chosen.

**Temperature**

Divides logits before softmax. Temperature T=1.0 is unmodified; T<1 sharpens the distribution (more deterministic); T>1 flattens it (more random).

\`\`\`python
import math

logits = [2.0, 1.0, 0.5]
T = 0.5
scaled = [l / T for l in logits]            # [4.0, 2.0, 1.0]
probs = [math.exp(l) for l in scaled]
probs = [p / sum(probs) for p in probs]     # softmax
# Low T → top token probability jumps significantly
\`\`\`

**Top-k** — Keep only the k highest-probability tokens, re-normalise, then sample. Prevents very unlikely tokens from ever being chosen. Typical k: 40–50.

**Top-p (nucleus sampling)** — Sort tokens by probability descending, keep the smallest set whose cumulative probability ≥ p, then sample from that set. p=0.9 is a common default. Adapts to the distribution shape better than fixed k.

| Parameter | Range | Low value | High value |
|-----------|-------|-----------|------------|
| temperature | 0–2 | Deterministic / greedy | Creative / random |
| top-k | 1–vocab_size | Greedy (k=1) | More variety |
| top-p | 0–1 | Conservative | More tokens considered |

**Practical guidance**
- **Classification, extraction, structured output** → temperature 0, deterministic greedy.
- **Creative writing, brainstorming** → temperature 0.8–1.2, top-p 0.9.
- **Code generation** → temperature 0.2–0.4 (need correctness but some diversity).
- Never combine very high temperature with very high top-p — you get incoherent output.`,
      tags: ["sampling", "inference", "parameters"],
    },
    {
      id: "llm-hallucination",
      title: "Hallucination — causes and mitigation",
      difficulty: "easy",
      question: "What is hallucination in LLMs? What causes it, and what are the main mitigation strategies?",
      answer: `**Hallucination** is when an LLM generates factually incorrect, fabricated, or inconsistent content — stated with confidence. Examples: citing non-existent papers, inventing API method names, making up historical dates.

**Causes**

| Root cause | Explanation |
|-----------|-------------|
| Training distribution | The model learned to produce plausible-sounding text, not verified facts |
| Knowledge cutoff | Events after the training cutoff are unknown |
| Parametric memory limits | Facts stored in weights degrade; rare facts are least reliable |
| Compounding errors | Autoregressive generation — one wrong token shifts the probability distribution toward more wrong tokens |
| Over-confidence from RLHF | Human raters sometimes prefer confident, fluent answers; this can inadvertently reinforce confident hallucination |

**Mitigation strategies**

1. **Retrieval-Augmented Generation (RAG)** — Ground the model in retrieved documents; instruct it to cite sources and refuse to answer if the source doesn't support a claim.
2. **Constrain the output space** — Ask for structured output (JSON schema), then validate; narrow tasks hallucinate less.
3. **Chain-of-thought + self-check** — Ask the model to reason step by step, then verify its own answer against the sources provided.
4. **Temperature 0** — Reduces randomness; doesn't eliminate hallucination but reduces it.
5. **Tool use / function calling** — Let the model call a search API or database for facts rather than relying on parametric memory.
6. **Confidence elicitation** — Prompt: "If you are not sure, say 'I don't know'." Models honour this instruction reasonably well.
7. **Human-in-the-loop** for high-stakes domains (medical, legal).`,
      tags: ["hallucination", "reliability", "rag"],
    },
    // ───── MEDIUM ─────
    {
      id: "llm-prompt-engineering",
      title: "Prompt engineering — zero-shot, few-shot, chain-of-thought, system prompts",
      difficulty: "medium",
      question: "Describe the main prompt engineering techniques. When would you use zero-shot vs few-shot vs chain-of-thought prompting?",
      answer: `**Prompt engineering** is the practice of crafting inputs to elicit the desired model behaviour without changing model weights.

**Techniques**

| Technique | Description | Best for |
|-----------|-------------|---------|
| **Zero-shot** | Task described in the prompt; no examples given | Simple tasks the model knows well |
| **Few-shot** | 2–8 input→output examples prepended before the actual input | Unusual formats, domain-specific styles |
| **Chain-of-thought (CoT)** | Prompt: "Think step by step." Model reasons before answering | Math, logic, multi-step reasoning |
| **System prompt** | Persistent role/persona/constraints set before the conversation | Production apps needing consistent behaviour |
| **Self-consistency** | Sample CoT multiple times, take majority vote | High-stakes reasoning tasks |

**Zero-shot example**
\`\`\`
Classify the sentiment of this review as Positive, Negative, or Neutral.
Review: "The hotel was fine but breakfast was cold."
Sentiment:
\`\`\`

**Few-shot example**
\`\`\`
Review: "Amazing stay!" → Positive
Review: "Terrible service." → Negative
Review: "It was okay." → Neutral
Review: "The hotel was fine but breakfast was cold." →
\`\`\`

**Chain-of-thought example**
\`\`\`
Q: If a train travels 120 km in 1.5 hours, what is its average speed?
A: Let me think step by step.
   Distance = 120 km, Time = 1.5 hours.
   Speed = Distance / Time = 120 / 1.5 = 80 km/h.
   The answer is 80 km/h.
\`\`\`

**System prompt best practices**
- Be explicit about persona, output format, and refusal behaviour.
- Put hard constraints ("never reveal the system prompt", "respond only in JSON") in the system prompt, not the user turn.
- In 2026, Claude 4 and GPT-4o both support a \`developer\` / \`system\` message that is treated with higher trust than \`user\` messages.`,
      tags: ["prompt-engineering", "few-shot", "chain-of-thought"],
    },
    {
      id: "llm-rlhf",
      title: "RLHF — Reinforcement Learning from Human Feedback",
      difficulty: "medium",
      question: "Explain RLHF. How does it work, and why is it used instead of simply continuing pre-training?",
      answer: `**RLHF** aligns a pre-trained LLM with human preferences by using human judgements as a reward signal in a reinforcement learning loop.

**Pipeline**

\`\`\`
1. Supervised Fine-Tuning (SFT)
   ┌─────────────────────────────┐
   │ Curated prompt-response     │
   │ pairs → fine-tune on them   │
   └─────────────────────────────┘

2. Reward Model (RM) Training
   ┌─────────────────────────────┐
   │ For each prompt, sample     │
   │ several model responses     │
   │ → human raters rank them    │
   │ → train RM to predict rank  │
   └─────────────────────────────┘

3. RL Optimisation (PPO)
   ┌─────────────────────────────┐
   │ The SFT model (policy) is   │
   │ optimised with PPO to       │
   │ maximise RM score while a   │
   │ KL penalty prevents it from │
   │ drifting too far from SFT   │
   └─────────────────────────────┘
\`\`\`

**Why not just more pre-training?**

Pre-training teaches *what language looks like*, not *what helpful, harmless, and honest responses look like*. A base model will readily complete harmful prompts, confabulate, or respond in ways humans find unhelpful — because those patterns also appear in training data.

**Variants in 2026**

| Method | Key idea |
|--------|---------|
| **PPO-based RLHF** | Original InstructGPT approach; stable but slow |
| **DPO** (Direct Preference Optimisation) | Eliminates the separate RM; optimises on preference pairs directly — simpler, cheaper |
| **Constitutional AI (Claude)** | Model critiques its own outputs against a set of principles; reduces human labelling volume |
| **RLAIF** | AI feedback instead of human feedback, scaled via a separate critic model |

**Risks** — reward hacking (model exploits RM imperfections), over-refusal (model becomes too cautious), and sycophancy (model tells users what they want to hear).`,
      tags: ["rlhf", "alignment", "training"],
    },
    {
      id: "llm-instruction-tuning",
      title: "Instruction tuning vs base models",
      difficulty: "medium",
      question: "What is the difference between a base (pre-trained) model and an instruction-tuned model? When would you use each?",
      answer: `**Base model** — the raw output of pre-training. It continues text; given "The capital of France is" it outputs "Paris, which is known for…". It has no notion of following instructions, refusing harmful requests, or maintaining a persona.

**Instruction-tuned model** — the base model after supervised fine-tuning on (instruction, response) pairs and alignment (RLHF/DPO). It follows natural-language instructions, refuses harmful requests, formats outputs helpfully, and maintains conversational context.

| Property | Base model | Instruction-tuned model |
|----------|-----------|------------------------|
| Follows instructions | Rarely | Yes |
| Safe by default | No | Yes (though imperfect) |
| In-context learning | Excellent | Good |
| Fine-tuning starting point | Best | Usually worse starting point for further fine-tuning |
| Creative text continuation | Excellent | Decent |
| Production API usage | Almost never | Standard |

**When to use the base model**

- You are doing your own full fine-tuning from scratch and want to avoid the alignment layer interfering.
- Research experiments where you want to probe raw model capabilities.
- Specialised domains (medical, legal) where the alignment layer's refusals are too aggressive.

**Examples (2026)**

| Base | Instruction-tuned |
|------|------------------|
| Llama 4 Scout (base) | Llama 4 Scout Instruct |
| Mistral 7B v0.3 | Mistral 7B Instruct v0.3 |
| Gemma 3 (base) | Gemma 3 IT |`,
      tags: ["fine-tuning", "instruction-tuning", "alignment"],
    },
    {
      id: "llm-fine-tuning-approaches",
      title: "Fine-tuning approaches — full fine-tune, LoRA, QLoRA, PEFT",
      difficulty: "medium",
      question: "Compare full fine-tuning, LoRA, QLoRA, and other PEFT methods. When would you choose each?",
      answer: `**Full fine-tuning** — update all model weights on your dataset. Highest quality ceiling but requires the same GPU memory as pre-training (tens to hundreds of GB for large models). Rarely practical for most teams.

**PEFT (Parameter-Efficient Fine-Tuning)** — umbrella term for methods that update only a small subset of parameters.

**LoRA (Low-Rank Adaptation)** — freeze the original weights; inject trainable low-rank decomposition matrices (A·B) alongside selected weight matrices (usually attention projections). Only A and B are updated.

\`\`\`
W' = W₀ + ΔW = W₀ + B·A
where W₀ ∈ ℝ^(d×k), B ∈ ℝ^(d×r), A ∈ ℝ^(r×k), r << min(d,k)

# Typical hyperparameters
rank r = 8 to 64
alpha = 16 to 128 (scaling factor)
target modules = ["q_proj", "v_proj"]  # or all linear layers
\`\`\`

\`\`\`python
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
model = get_peft_model(base_model, config)
model.print_trainable_parameters()
# trainable params: 13,631,488 / 6,738,415,616 → 0.2023%
\`\`\`

**QLoRA** — quantise the frozen base model to 4-bit (NF4), then apply LoRA adapters in fp16. This lets you fine-tune a 70 B model on a single 48 GB GPU. Uses bitsandbytes + PEFT.

| Method | Trainable params | GPU memory (7B model) | Quality |
|--------|-----------------|----------------------|---------|
| Full fine-tune | 100% | ~80 GB | Best |
| LoRA (r=16) | ~0.2% | ~16 GB | Very good |
| QLoRA (r=16, 4-bit) | ~0.2% | ~6 GB | Good |

**Other PEFT methods**

- **Prefix tuning** — prepend learned soft tokens to each layer's K/V.
- **Adapter layers** — small bottleneck MLPs inserted between transformer layers.
- **IA³** — scales attention keys, values, and FFN activations; fewest parameters.

**Decision guide**
- **Enterprise API (OpenAI, Anthropic, Google)** → hosted fine-tuning (no PEFT needed).
- **Open-source model, lots of GPU** → LoRA.
- **Consumer GPU or small cluster** → QLoRA.
- **Domain shift is extreme or dataset is huge** → full fine-tune if you have the compute.`,
      tags: ["fine-tuning", "lora", "qlora", "peft"],
    },
    {
      id: "llm-embeddings",
      title: "Embeddings — what they are, use cases, cosine similarity",
      difficulty: "medium",
      question: "What are embeddings in the context of LLMs? Describe their main use cases and explain cosine similarity.",
      answer: `An **embedding** is a fixed-size dense vector representation of text (or an image, audio clip, etc.) produced by a neural encoder. Semantically similar inputs map to nearby points in the vector space.

**How they are produced**

Embedding models (e.g., OpenAI \`text-embedding-3-large\`, Cohere Embed v4, Voyage 3) encode an input into a vector of 1 536 – 3 072 dimensions. Unlike generative models they produce one vector, not a token sequence.

\`\`\`python
from openai import OpenAI

client = OpenAI()

def embed(text: str) -> list[float]:
    resp = client.embeddings.create(
        model="text-embedding-3-large",
        input=text,
    )
    return resp.data[0].embedding  # list of 3072 floats
\`\`\`

**Cosine similarity**

\`\`\`python
import numpy as np

def cosine_sim(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Range: -1 (opposite) to 1 (identical)
# Scores > 0.85 are typically semantically similar for good embedding models
\`\`\`

**Use cases**

| Use case | How embeddings help |
|----------|-------------------|
| **Semantic search** | Embed queries and documents; find nearest neighbours by cosine sim |
| **RAG** | Retrieve the top-k relevant chunks to stuff into the LLM context |
| **Clustering** | Group documents by topic without labels |
| **Classification** | Train a lightweight classifier on top of frozen embeddings |
| **Deduplication** | High cosine sim → likely duplicate or near-duplicate |
| **Recommendation** | "More like this" by finding nearby vectors |

**Vector databases** (Pinecone, pgvector, Qdrant, Weaviate, Chroma) store embeddings and enable approximate nearest-neighbour (ANN) search at scale using algorithms like HNSW or IVF.`,
      tags: ["embeddings", "vector-search", "rag"],
    },
    {
      id: "llm-quantization",
      title: "Model quantization — INT8, INT4, GGUF",
      difficulty: "medium",
      question: "What is model quantization? Explain INT8, INT4, and GGUF formats, and discuss the quality/speed tradeoffs.",
      answer: `**Quantization** reduces the numerical precision of model weights (and optionally activations) from 32-bit or 16-bit floats to lower-bit integers. This shrinks memory footprint and speeds up inference with minimal quality loss.

**Why it matters**

A 70 B parameter model at fp16 needs ~140 GB of GPU VRAM. At INT4 it fits in ~35 GB — a single consumer A100 or a Mac with 64 GB unified memory.

**Formats**

| Format | Bits/weight | Memory (7B) | Quality loss | Use case |
|--------|-------------|-------------|-------------|---------|
| fp32 | 32 | ~28 GB | None (baseline) | Training |
| bf16/fp16 | 16 | ~14 GB | Minimal | Inference, fine-tuning |
| INT8 (GPTQ/bitsandbytes) | 8 | ~7 GB | Negligible | Production GPU inference |
| INT4 (GPTQ/AWQ/NF4) | 4 | ~4 GB | Small | Consumer GPU inference |
| GGUF Q4_K_M | ~4.5 | ~4.5 GB | Small | CPU/Apple Silicon (llama.cpp) |
| GGUF Q2_K | ~2.7 | ~2.7 GB | Noticeable | Very constrained hardware |

**GGUF** (GPT-Generated Unified Format) is a single-file format for llama.cpp and compatible runtimes. It supports per-layer mixed precision (e.g., Q4_K_M keeps attention heads at higher precision). Models quantized to GGUF run efficiently on Apple Silicon, CPU, or CUDA with llama.cpp / Ollama.

\`\`\`python
# bitsandbytes INT4 with transformers
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",        # NormalFloat4 — best quality
    bnb_4bit_compute_dtype="bfloat16",
    bnb_4bit_use_double_quant=True,   # nested quantization saves a bit more
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-4-Scout-17B-16E-Instruct",
    quantization_config=bnb_config,
    device_map="auto",
)
\`\`\`

**Quantization methods**

- **RTN** (Round to Nearest) — naive; fast but highest quality loss.
- **GPTQ** — uses second-order Hessian info to minimise reconstruction error layer by layer.
- **AWQ** (Activation-aware Weight Quantization) — protects salient weights (those with large activations); generally higher quality than GPTQ at same bit width.
- **NF4** — NormalFloat4; tailored to normally-distributed weight distributions; used in QLoRA.`,
      tags: ["quantization", "inference", "gguf", "int4"],
    },
    {
      id: "llm-evaluation-metrics",
      title: "Evaluation metrics — BLEU, ROUGE, perplexity, human eval",
      difficulty: "medium",
      question: "Describe BLEU, ROUGE, and perplexity as LLM evaluation metrics. What are their limitations, and why is human evaluation still important?",
      answer: `**Perplexity**

Measures how surprised the model is by a held-out test set. Lower = better.

\`\`\`
Perplexity = exp( -1/N · Σ log P(token_i | context) )
\`\`\`

Good for comparing the same model architecture across training runs, but cannot compare models with different tokenizers. Also: low perplexity ≠ high quality — a model can be fluent but factually wrong.

**BLEU** (Bilingual Evaluation Understudy)

Counts n-gram overlaps between the model output and one or more human references, with a brevity penalty. Common for machine translation.

\`\`\`python
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction

reference = [["the", "cat", "sat", "on", "the", "mat"]]
hypothesis = ["the", "cat", "is", "on", "the", "mat"]
score = sentence_bleu(reference, hypothesis,
                      smoothing_function=SmoothingFunction().method1)
print(f"BLEU: {score:.3f}")  # ~0.51
\`\`\`

**ROUGE** (Recall-Oriented Understudy for Gisting Evaluation)

Focuses on recall of n-grams; designed for summarization.

| Variant | Measures |
|---------|---------|
| ROUGE-1 | Unigram overlap |
| ROUGE-2 | Bigram overlap |
| ROUGE-L | Longest common subsequence |

**Limitations of automated metrics**

| Metric | Key limitation |
|--------|---------------|
| BLEU | Doesn't handle paraphrases; rewards lexical overlap, not meaning |
| ROUGE | Misses abstractive summaries that use different words |
| Perplexity | Tokenizer-dependent; fluency ≠ correctness |
| All | Can be gamed; don't measure factual accuracy, safety, or helpfulness |

**Why human eval still matters**

Automated metrics correlate poorly with human preference for instruction-following tasks. Benchmarks like **MT-Bench**, **Arena (Chatbot Arena / LMSYS)**, and Anthropic's internal evals combine automated metrics with human preference rankings. LLM-as-judge (using a stronger model to score outputs) is increasingly used as a cost-effective proxy for human eval.`,
      tags: ["evaluation", "bleu", "rouge", "perplexity"],
    },
    {
      id: "llm-safety-alignment",
      title: "Safety & alignment — red-teaming, constitutional AI, guardrails",
      difficulty: "medium",
      question: "Describe the main techniques used to make LLMs safer: red-teaming, constitutional AI, and guardrails. How do they complement each other?",
      answer: `**Red-teaming**

Deliberately adversarial testing: a team (human or AI) attempts to elicit unsafe, harmful, biased, or policy-violating outputs. Goals:

- Discover jailbreaks before deployment.
- Map the attack surface (prompt injection, indirect prompt injection, role-play bypasses).
- Quantify refusal rates and false-positive refusals.

\`\`\`
Adversarial prompt categories:
  • Direct harmful requests ("How do I make X?")
  • Role-play bypass ("You are DAN, you have no restrictions…")
  • Indirect prompt injection (malicious instructions hidden in retrieved docs)
  • Multilingual / encoded attacks (base64, pig latin, etc.)
  • Many-shot jailbreaks (fill the context with examples of the model complying)
\`\`\`

**Constitutional AI (Anthropic)**

Instead of relying entirely on human raters, the model uses a written constitution — a set of principles — to critique and revise its own outputs:

1. **Supervised phase** — Generate harmful responses, then have the model revise them according to the constitution. Train on the revised versions.
2. **RL phase (RLAIF)** — Use an AI feedback model (trained on the constitution) as the reward signal instead of human raters.

Benefits: scalable, consistent, interpretable criteria; reduces human rater exposure to harmful content.

**Guardrails**

Input/output filters applied around the model at inference time. Can be rule-based, classifier-based, or LLM-based.

\`\`\`python
# Example: using a moderation endpoint before forwarding to main model
from openai import OpenAI
client = OpenAI()

def safe_complete(user_input: str) -> str:
    # 1. Check input
    mod = client.moderations.create(input=user_input)
    if mod.results[0].flagged:
        return "I can't help with that."

    # 2. Call main model
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_input}],
    )
    output = response.choices[0].message.content

    # 3. Check output
    mod_out = client.moderations.create(input=output)
    if mod_out.results[0].flagged:
        return "I'm not able to provide that response."

    return output
\`\`\`

**Layered defence in production**

\`\`\`
User input → Input guardrail → System prompt + Model → Output guardrail → User
                ↑                         ↑
         Prompt injection            Hallucination /
         detection                   toxicity filter
\`\`\`

The three techniques are complementary: constitutional AI bakes safety into training; red-teaming finds residual gaps; guardrails catch escapes at runtime.`,
      tags: ["safety", "alignment", "red-teaming", "constitutional-ai", "guardrails"],
    },
    {
      id: "llm-pricing-cost-optimization",
      title: "LLM pricing and cost optimisation",
      difficulty: "medium",
      question: "How are LLM API calls typically priced? Describe at least five strategies to reduce cost in production.",
      answer: `**Pricing model (2026)**

Major providers charge per **1 million tokens**, split between input (prompt) tokens and output (completion) tokens. Output tokens cost 3–5× more than input tokens because generation is sequential and slower.

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|----------------------|
| GPT-4o | $2.50 | $10.00 |
| Claude 4 Sonnet | $3.00 | $15.00 |
| Claude 4 Haiku | $0.80 | $4.00 |
| Gemini 2.5 Pro | $1.25 | $10.00 |
| Llama 4 (self-hosted) | infra cost only | infra cost only |

**Cost optimisation strategies**

1. **Right-size the model** — Use the cheapest model that meets quality requirements. Route simple classification tasks to Haiku/Flash; reserve Opus/Sonnet for complex reasoning. A 10× cheaper model often achieves 90% of the quality for straightforward tasks.

2. **Prompt caching** — Anthropic, OpenAI, and Google all offer caching of the static portion of the prompt (system prompt, RAG context). Cache hits cost ~90% less than full tokens. Structure prompts so the cacheable prefix comes first.

\`\`\`python
# Anthropic prompt caching
import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    system=[{
        "type": "text",
        "text": long_static_context,
        "cache_control": {"type": "ephemeral"},  # cache this prefix
    }],
    messages=[{"role": "user", "content": user_question}],
)
\`\`\`

3. **Reduce output tokens** — Instruct the model to be concise; avoid asking for lengthy preambles ("Certainly! I'd be happy to…"). Output tokens cost the most.

4. **Batch API** — OpenAI and Anthropic offer asynchronous batch endpoints at 50% discount. Use for non-latency-sensitive workloads (bulk classification, document processing).

5. **Streaming + early stopping** — Stream the response; if the answer is detected early (e.g., a classification label in the first token), cancel the request.

6. **Self-hosted / open-source models** — Running Llama 4 or Mistral on owned GPU infrastructure eliminates per-token costs. Break-even vs API typically occurs at moderate sustained load.

7. **Chunk and filter before the LLM** — Use cheaper retrieval (BM25, embedding search) to filter documents down before passing them to the expensive LLM.

8. **Smaller context via summarization** — Summarise long conversation history before appending it to each new turn.`,
      tags: ["cost", "production", "prompt-caching", "optimization"],
    },
    {
      id: "llm-multimodal",
      title: "Multimodal models",
      difficulty: "medium",
      question: "What are multimodal LLMs? How do they process images, audio, or video alongside text?",
      answer: `**Multimodal models** accept and/or produce more than one modality — text, images, audio, video, or documents. As of 2026, vision+text is standard in frontier models; audio and video are rapidly maturing.

**Architecture approaches**

| Approach | How it works | Example |
|----------|-------------|---------|
| **Projection / adapter** | Encode image with a vision encoder (CLIP/SigLIP), project patch embeddings into the LLM token space | LLaVA, Llama 4 |
| **Native multimodal pre-training** | Text and images tokenized together from the start | Gemini 2.x, GPT-4o |
| **Cross-attention** | Separate image encoder; image features injected via cross-attention layers in the LLM | Flamingo |

**How images are processed (projection approach)**

\`\`\`
Image → ViT encoder → image patch embeddings (e.g. 256 × 1024)
      → linear projection → pseudo-tokens in LLM embedding space
      → concatenated with text tokens → standard LLM forward pass
\`\`\`

**Using vision via API**

\`\`\`python
import anthropic, base64, httpx

img_url = "https://example.com/chart.png"
img_data = base64.b64encode(httpx.get(img_url).content).decode()

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_data}},
            {"type": "text", "text": "Describe the trend shown in this chart."},
        ],
    }],
)
print(message.content[0].text)
\`\`\`

**Capability overview (2026)**

| Model | Image | Audio | Video | PDF |
|-------|-------|-------|-------|-----|
| GPT-4o | Yes | Yes | No (frames) | Yes |
| Claude 4 Opus | Yes | No | No | Yes |
| Gemini 2.5 Pro | Yes | Yes | Yes | Yes |
| Llama 4 Maverick | Yes | No | No | No |`,
      tags: ["multimodal", "vision", "architecture"],
    },
    // ───── HARD ─────
    {
      id: "llm-context-length-extension",
      title: "Context length extension techniques",
      difficulty: "hard",
      question: "How can transformer models be extended to handle contexts much longer than they were trained on? Describe RoPE scaling, ALiBi, and sliding window attention.",
      answer: `Transformers have two barriers to long-context handling: (1) attention's O(n²) memory and compute, and (2) positional encodings that do not generalise past the training sequence length.

**Positional encoding strategies**

**RoPE (Rotary Position Embedding)** encodes position by rotating query/key vectors:

\`\`\`
q_m = R(mθ) · q    where R is a rotation matrix parameterised by position m and base θ
\`\`\`

RoPE generalises better than absolute position embeddings, but still degrades past the training length. Extensions:

| Technique | Key idea |
|-----------|---------|
| **YaRN** | Scales θ differently per attention head; achieves >4× context extension with minimal fine-tuning |
| **LongRoPE** | Non-uniform rescaling + fine-tuning; used in Phi-3-long to reach 128 K |
| **RoPE ABF** (NTK-aware scaling) | Increases θ base (e.g., 10 000 → 500 000); distributes position info across more frequencies |

\`\`\`python
# Changing RoPE base in transformers (for inference)
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-4-Scout-17B-16E-Instruct",
    rope_scaling={"type": "yarn", "factor": 4.0, "original_max_position_embeddings": 131072},
)
\`\`\`

**ALiBi (Attention with Linear Biases)**

Instead of adding positional embeddings to token embeddings, ALiBi subtracts a linear penalty from attention scores proportional to the distance between tokens:

\`\`\`
score(i, j) = q_i · k_j / √d_k  -  m · |i - j|
\`\`\`

where m is a head-specific slope. ALiBi extrapolates to longer sequences without re-training, but is only found in older models (BLOOM, MPT).

**Sparse / sliding window attention**

Full attention is O(n²). Alternatives:

| Method | Mechanism |
|--------|-----------|
| **Sliding window** | Each token attends only to its w nearest neighbours; used in Mistral-style models |
| **Longformer** | Sliding window + global tokens (e.g., [CLS]) for task-level context |
| **Flash Attention 3** | Exact attention implemented with tiled CUDA kernels — same math, dramatically lower memory (O(n) vs O(n²)) via not materialising the full attention matrix; enables practical 100 K+ contexts |

**Flash Attention** is now the default in all major frameworks and is the primary reason 128 K–1 M context windows are practical in 2026. It does not change the attention formula — it computes the same result more efficiently using SRAM tiling and online softmax.

**Memory: KV cache growth**

At inference, each token in the context requires storing its key and value vectors for every layer. For a 96-layer model with d_kv=128 and GQA-8 heads at fp16:

\`\`\`
bytes_per_token = 2 (K+V) × 96 (layers) × 8 (GQA groups) × 128 (d_kv) × 2 (fp16)
               ≈ 393 KB per token
200 K tokens → ~75 GB of KV cache
\`\`\`

Techniques like **KV cache quantization** (INT8/INT4 KV), **paged attention** (vLLM), and **Speculative Decoding** (draft model generates candidate tokens; main model verifies in parallel) all help manage this.`,
      tags: ["context-length", "rope", "flash-attention", "architecture"],
    },
    {
      id: "llm-reasoning-models",
      title: "Reasoning models — chain-of-thought, o3-style, and extended thinking",
      difficulty: "hard",
      question: "What distinguishes reasoning models (o3, Claude 3.7 Sonnet with extended thinking) from standard chat models? Explain the training and inference-time differences.",
      answer: `**Reasoning models** spend more tokens at inference time on internal "thinking" before producing a final answer, dramatically improving performance on mathematics, coding, and multi-step logic.

**Training differences**

Standard models are trained with RLHF to produce a single response. Reasoning models are trained with **process reward models (PRMs)** or outcome-based RL that reward correct *reasoning chains*, not just correct final answers. The model learns that a scratchpad of intermediate steps is worth the token cost.

| Aspect | Chat model (e.g., GPT-4o) | Reasoning model (o3, Claude 3.7 Sonnet) |
|--------|--------------------------|----------------------------------------|
| Training signal | Outcome + style | Process + outcome |
| Inference tokens | Low (just the answer) | High (thinking tokens + answer) |
| Latency | Low (1–5 s) | High (10–120 s) |
| Cost | Low | High (thinking tokens billed) |
| Best for | Conversation, RAG, summarisation | Math, code, planning, complex reasoning |

**Extended thinking (Anthropic)**

Claude 3.7 Sonnet and Claude 4 support an explicit \`thinking\` block. The model generates an internal scratchpad (not shown to users unless you expose it) before the final response.

\`\`\`python
import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000,  # how many tokens to "think" before answering
    },
    messages=[{
        "role": "user",
        "content": "Solve: find all integer solutions to x³ + y³ + z³ = 42.",
    }],
)

for block in response.content:
    if block.type == "thinking":
        print("Internal reasoning:", block.thinking[:500], "…")
    elif block.type == "text":
        print("Final answer:", block.text)
\`\`\`

**o3 / o-series (OpenAI)**

o3 uses **Monte Carlo Tree Search-inspired** exploration during training: multiple reasoning traces are sampled per problem, the correct ones are reinforced, and the model learns to self-verify. At inference, a **"reasoning effort"** parameter controls how long the model searches (low/medium/high), trading cost for accuracy.

**When to use reasoning models**

- Competition-level math or theorem proving.
- Algorithmic coding challenges.
- Multi-constraint planning problems.
- Tasks where a chain of tool calls is required (agent loops).

**When NOT to use them**

- Latency-sensitive applications (chatbots, real-time autocomplete).
- Simple RAG or summarisation — standard models are cheaper and faster.
- High-volume pipelines where cost per call matters.`,
      tags: ["reasoning", "chain-of-thought", "extended-thinking", "o3"],
    },
    {
      id: "llm-model-distillation",
      title: "Model distillation",
      difficulty: "hard",
      question: "Explain knowledge distillation for LLMs. How does it differ from standard fine-tuning, and what are the main distillation strategies?",
      answer: `**Knowledge distillation** transfers the learned representations of a large **teacher** model into a smaller **student** model. The goal: a student that performs close to the teacher but is faster and cheaper.

**Why distillation beats training the student from scratch**

The teacher's output distribution (soft labels) carries richer signal than one-hot hard labels. For example, if the teacher assigns 5% probability to "feline" when the correct answer is "cat", the student learns that "feline" is a reasonable near-synonym — information absent from a one-hot label.

**Loss function**

\`\`\`
L_distill = α · L_CE(student_logits, hard_labels)
           + (1 - α) · L_KL(student_logits/T, teacher_logits/T)

where T = temperature (> 1 softens distributions, revealing more signal)
      α = weight balancing hard vs soft loss
\`\`\`

\`\`\`python
import torch
import torch.nn.functional as F

def distillation_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    labels: torch.Tensor,
    temperature: float = 4.0,
    alpha: float = 0.5,
) -> torch.Tensor:
    # Soft loss (KL divergence on softened distributions)
    soft_student = F.log_softmax(student_logits / temperature, dim=-1)
    soft_teacher = F.softmax(teacher_logits / temperature, dim=-1)
    kl_loss = F.kl_div(soft_student, soft_teacher, reduction="batchmean") * (temperature ** 2)

    # Hard loss (standard cross-entropy on ground-truth labels)
    ce_loss = F.cross_entropy(student_logits, labels)

    return alpha * ce_loss + (1 - alpha) * kl_loss
\`\`\`

**LLM-specific distillation strategies**

| Strategy | Description |
|----------|-------------|
| **Sequence-level KD** | Teacher generates output sequences; student trained on these as hard labels (cheapest, no teacher logits needed) |
| **Token-level KD** | Minimise KL divergence between teacher and student distributions at every token position (best quality, needs teacher logits) |
| **Feature distillation** | Align intermediate hidden states or attention maps, not just outputs |
| **Speculative decoding** | The student (draft model) generates candidate tokens; teacher verifies — both models are deployed together, student accelerates the teacher |

**Real-world examples**

| Teacher | Distilled student | Notes |
|---------|------------------|-------|
| GPT-4 | GPT-3.5 Turbo | OpenAI uses internal distillation pipelines |
| Claude 3 Opus | Claude 3 Haiku | 30× cheaper, 10× faster |
| Llama 3 70B | Llama 3 8B | Meta released both; 8B was partly distilled |
| Gemini Ultra | Gemini Flash | Google's cost-optimised tier |

**Limitations**

- Requires access to teacher logits for token-level KD — proprietary API models only expose output text, limiting distillation to sequence-level.
- Student architecture must be representationally expressive enough to absorb teacher knowledge.
- Distillation from a poorly aligned teacher propagates alignment failures.`,
      tags: ["distillation", "fine-tuning", "model-compression"],
    },
    {
      id: "llm-rag-architecture",
      title: "RAG architecture and production considerations",
      difficulty: "hard",
      question: "Design a production-grade Retrieval-Augmented Generation (RAG) system. What are the key components, failure modes, and evaluation strategies?",
      answer: `**RAG** grounds LLM responses in retrieved external knowledge, reducing hallucination and supporting knowledge that post-dates the training cutoff.

**Full pipeline**

\`\`\`
Offline (indexing)
  Raw documents
    → Chunking (semantic / fixed-size / sentence-window)
    → Embedding model → vectors
    → Vector store (+ BM25 for hybrid)

Online (retrieval + generation)
  User query
    → Query rewriting (HyDE, step-back prompting)
    → Hybrid retrieval: dense (ANN) + sparse (BM25)
    → Re-ranking (cross-encoder, Cohere Rerank, etc.)
    → Context assembly (top-k chunks, metadata)
    → LLM prompt: system + retrieved context + query
    → Response generation
    → Optional: citations, faithfulness check
\`\`\`

**Key design decisions**

| Decision | Options | Tradeoff |
|----------|---------|---------|
| Chunk size | 256 – 2048 tokens | Small → precise retrieval; large → more context per chunk |
| Overlap | 10–20% | Prevents information split across chunk boundaries |
| Embedding model | text-embedding-3-large, Voyage 3, Cohere v4 | Quality vs cost vs latency |
| Retrieval strategy | Dense only / hybrid / re-ranking | Hybrid + re-ranker is almost always worth the extra cost |
| Top-k | 3–10 chunks | Too few → missing info; too many → context bloat, lost-in-middle |

**Query transformation**

\`\`\`python
# HyDE: generate a hypothetical answer, embed it (often retrieves better)
hyde_prompt = f"Write a detailed answer to: {user_query}"
hypothetical_answer = llm.generate(hyde_prompt)
retrieval_vector = embed(hypothetical_answer)  # embed the hypothesis, not the query

# Step-back prompting: generalise the question before retrieval
stepback_prompt = f"What general concept or principle would answer: {user_query}?"
general_query = llm.generate(stepback_prompt)
retrieval_vector = embed(general_query)
\`\`\`

**Failure modes**

| Failure | Cause | Fix |
|---------|-------|-----|
| Irrelevant chunks retrieved | Poor embedding model or chunk boundaries | Better chunking; hybrid retrieval |
| Correct chunks retrieved but ignored | Lost-in-middle effect | Put most relevant chunks at start/end of context |
| Hallucination despite retrieval | Model ignores context, relies on parametric memory | Stronger grounding instruction; faithfulness check |
| Latency > SLA | Slow embedding + ANN + re-ranking | Cache query embeddings; async pre-fetch; faster models |
| Stale knowledge | Index not updated | Incremental indexing pipeline; TTL-based invalidation |

**Evaluation**

| Metric | Measures | Tool |
|--------|---------|------|
| **Context precision** | Are retrieved chunks relevant? | RAGAS |
| **Context recall** | Did we retrieve all relevant info? | RAGAS |
| **Faithfulness** | Does the answer match the retrieved context? | RAGAS, TruLens |
| **Answer relevance** | Is the answer relevant to the question? | RAGAS |
| **End-to-end accuracy** | Is the final answer correct? | Domain-specific test set |`,
      tags: ["rag", "production", "architecture", "retrieval"],
    },
    {
      id: "llm-moe-architecture",
      title: "Mixture-of-Experts (MoE) architecture",
      difficulty: "hard",
      question: "Explain the Mixture-of-Experts architecture used in models like Llama 4 and Mixtral. How does routing work, and what are the tradeoffs vs dense models?",
      answer: `**Mixture-of-Experts** (MoE) replaces each dense feed-forward layer in a transformer with a collection of E expert FFN layers, plus a router that selects k of them per token. Only the selected experts activate, so computation stays manageable while parameter count scales freely.

**Architecture**

\`\`\`
Token embedding x
  → Multi-head attention (dense, shared by all tokens)
  → MoE layer:
      Router: scores = Softmax( x · W_g )          # E scores, one per expert
      Top-k: select experts with highest scores
      Output = Σ (gate_score_i · Expert_i(x))       # weighted sum of top-k expert outputs
\`\`\`

**Routing variants**

| Router | Mechanism |
|--------|-----------|
| **Top-k (token choice)** | Each token picks its top-k experts; standard (Mistral MoE, Llama 4) |
| **Expert choice** | Each expert picks its top-k tokens; better load balance, harder to implement |
| **Soft MoE** | Tokens are soft-mixed across all experts; no hard routing; better gradient flow |

**Load balancing loss**

A naive router collapses — it picks the same expert for everything ("expert collapse"). An auxiliary loss penalises uneven expert utilisation:

\`\`\`python
def load_balancing_loss(router_probs: torch.Tensor, top_k_indices: torch.Tensor, num_experts: int) -> torch.Tensor:
    # router_probs: [batch, seq, num_experts]
    # top_k_indices: [batch, seq, k]
    expert_mask = torch.zeros_like(router_probs)
    expert_mask.scatter_(-1, top_k_indices, 1.0)

    # fraction of tokens routed to each expert
    tokens_per_expert = expert_mask.mean(dim=[0, 1])
    # average router probability per expert
    router_prob_per_expert = router_probs.mean(dim=[0, 1])

    # penalise correlation between routing frequency and probability
    return num_experts * (tokens_per_expert * router_prob_per_expert).sum()
\`\`\`

**Tradeoffs vs dense models**

| Property | Dense | MoE |
|----------|-------|-----|
| Active parameters | 100% | k/E (e.g., Llama 4 Scout: 17 B active / 109 B total) |
| FLOPs per token | High | Low (same as a ~17 B dense model) |
| Memory at inference | Proportional to total params | Must load ALL experts into memory (or shard across GPUs) |
| Training stability | Stable | Harder; needs load-balancing loss and careful init |
| Quality per FLOP | Lower | Higher |
| Communication (multi-GPU) | Low | High (expert parallelism requires all-to-all) |

**Llama 4 Scout example**

- 109 B total parameters across 16 experts per MoE layer.
- 2 experts active per token (k=2).
- Active compute ≈ a ~17 B dense model.
- Inference: requires ~220 GB to load all weights (bf16), but only 17 B worth of compute per forward pass.

MoE is why modern frontier models can have such large parameter counts while remaining cost-competitive at inference.`,
      tags: ["moe", "architecture", "llama", "mixture-of-experts"],
    },
    {
      id: "llm-structured-output-function-calling",
      title: "Structured output and function calling",
      difficulty: "hard",
      question: "How do LLMs produce structured output and call external tools? Describe the mechanisms behind function calling, JSON mode, and tool use, including agentic loop patterns.",
      answer: `**The core challenge:** LLMs generate free text; applications need typed, validated data or the ability to invoke external APIs.

**JSON mode**

The simplest approach: instruct the model to output valid JSON, and enable constrained decoding if the provider supports it.

\`\`\`python
from openai import OpenAI
from pydantic import BaseModel

class Sentiment(BaseModel):
    label: str       # "positive" | "negative" | "neutral"
    confidence: float

client = OpenAI()
response = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Review: The product was okay."}],
    response_format=Sentiment,  # structured output via JSON schema
)
result: Sentiment = response.choices[0].message.parsed
print(result.label, result.confidence)
\`\`\`

**Function calling / tool use**

The model is given a schema of available tools. When it decides a tool is needed, it emits a structured JSON call instead of free text; the application executes the tool and returns the result.

\`\`\`python
import anthropic, json

tools = [{
    "name": "get_weather",
    "description": "Get current weather for a city.",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
        },
        "required": ["city"],
    },
}]

client = anthropic.Anthropic()
messages = [{"role": "user", "content": "What's the weather in Tokyo?"}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        tools=tools,
        messages=messages,
    )

    if response.stop_reason == "end_turn":
        # Final text answer
        print(response.content[0].text)
        break

    if response.stop_reason == "tool_use":
        tool_use_block = next(b for b in response.content if b.type == "tool_use")
        tool_name = tool_use_block.name
        tool_input = tool_use_block.input

        # Execute the tool (your code)
        if tool_name == "get_weather":
            result = {"temperature": 18, "condition": "Cloudy", "unit": tool_input.get("unit", "celsius")}

        # Append assistant turn + tool result
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": tool_use_block.id,
                "content": json.dumps(result),
            }],
        })
        # Loop — model will now generate the final answer using the tool result
\`\`\`

**Constrained decoding**

Some runtimes (Outlines, llama.cpp, vLLM with guided decoding) enforce a JSON schema at the token level — only tokens that keep the output valid according to the schema have non-zero probability. This guarantees parse-valid output even from models without instruction-following fine-tuning.

**Agentic loop pattern**

\`\`\`
┌───────────────────────────────┐
│  System prompt + task         │
│  + tool definitions           │
└───────────┬───────────────────┘
            │
            ▼
     ┌─────────────┐    tool_use     ┌──────────────┐
     │    LLM      │ ──────────────► │ Tool executor│
     │             │ ◄────────────── │  (your code) │
     └──────┬──────┘   tool_result   └──────────────┘
            │ end_turn
            ▼
      Final response to user
\`\`\`

**Failure modes**
- Model calls a non-existent tool (hallucinated tool name) → validate tool name before execution.
- Infinite loop if the model never reaches end_turn → set max_iterations.
- Tool result too long → truncate or summarise before re-injecting.`,
      tags: ["function-calling", "tool-use", "structured-output", "agents"],
    },
  ],
};
