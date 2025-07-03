import logging
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="LLM Service", description="Service for generating summaries using LLM")

# Load model at startup
model_path = os.getenv("MODEL_PATH", "./models/gemma-2-2b")
model = None
tokenizer = None
try:
    logger.info(f"Loading {model_path} model...")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.float32, device_map="cpu")
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    model = None
    tokenizer = None

# Pydantic models for request validation
class Comment(BaseModel):
    created_at: str
    author: str
    content: str

class TaskData(BaseModel):
    title: str
    description: str
    created_at: str
    comments: List[Comment]

# Health check endpoint
@app.get("/health")
async def health_check():
    if model is None or tokenizer is None:
        logger.error("Health check failed: Model or tokenizer not loaded")
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "error": "Model not loaded"})
    logger.info("Health check requested: Model is loaded")
    return {"status": "healthy"}

# Summary endpoint
@app.post("/workspace-task-summary")
async def summarize_task(data: TaskData):
    if model is None or tokenizer is None:
        logger.error("Summary request failed: Model or tokenizer not loaded")
        raise HTTPException(status_code=503, detail={"error": "Model not loaded"})

    logger.info(f"Processing summary for task: {data.title}")
    # Structure input text
    text = f"Tarefa: {data.title}\n"
    text += f"Descrição: {data.description}\n"
    text += f"Criada em: {data.created_at}\n"
    if data.comments:
        text += "Comentários:\n"
        for comment in data.comments:
            text += f"- (Autor {comment.author}): {comment.content} - (Data {comment.created_at})\n"
    else:
        text += "Sem comentários.\n"

    prompt = (
        "You are Gemma, a large language model built by Google.\n"
        "You are expected to follow the instructions, analyze the input, and generate a textual output.\n"
        "You have to keep the structure and finish on </output>.\n"
        "<instructions>\n"
        "Gemma é um modelo de linguagem projetado para explicar informações que forem fornecidas. "
        "Gemma deve gerar um texto de relato em português sobre a tarefa.\n"
        "</instructions>\n"
        "<input>\n"
        f"{text}\n"
        "</input>\n"
        "<output>\n"
    )

    try:
        inputs = tokenizer(prompt, return_tensors="pt").to("cpu")
        outputs = model.generate(
            **inputs,
            max_new_tokens=100,
            temperature=1,
            do_sample=False
        )
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True).replace(prompt, "").strip()

        if summary.endswith("</output>"):
            summary = summary.replace("</output>", "").strip()
        logger.info(f"Generated summary for task: {data.title}")
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Failed to generate summary for task {data.title}: {str(e)}")
        raise HTTPException(status_code=500, detail={"error": f"Summary generation failed: {str(e)}"})

# Log startup
logger.info("LLM service started")
