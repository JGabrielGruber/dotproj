import psycopg2
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os
from datetime import datetime

# Postgres connection
try:
    conn = psycopg2.connect(
        dbname="dotproj",
        user="postgres",
        password="postgres",
        host="localhost"  # Update if your DB is elsewhere
    )
    cursor = conn.cursor()
    print("🦍 Connected to dotproj DB! Ready to swing! 🍌")
except Exception as e:
    print(f"🦍 Slipped on a banana while connecting! Error: {e}")
    exit(1)

# Load Gemma-2-2B (CPU-only)
model_path = "./models/gemma-2-2b"
try:
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.float32, device_map="cpu")
    print("🦍 Gemma-2-2B loaded! Cyber brain ready! 🐒")
except Exception as e:
    print(f"🦍 Choked on a banana! Failed to load model: {e}")
    cursor.close()
    conn.close()
    exit(1)

# Query tasks and comments, grouped by task
try:
    cursor.execute("""
        SELECT t.id, t.title, t.description, t.created_at,
               tc.id, tc.content, tc.created_at, tc.author_id, u.username
        FROM workspace_task t
        LEFT JOIN workspace_taskcomment tc ON t.id = tc.task_id
        LEFT JOIN portal_auth_user u ON tc.author_id = u.id
        WHERE t.workspace_id = 'cbc3d95d-fd76-45f0-bc94-6617da9f6952'
        ORDER BY t.id, tc.created_at
    """)
    rows = cursor.fetchall()
    print(f"🦍 Found {len(rows)} rows to summarize! Time for ape-tastic summaries! 🍌")
except Exception as e:
    print(f"🦍 Jungle mess! Query failed: {e}")
    cursor.close()
    conn.close()
    exit(1)

# Group comments by task
tasks = {}
for row in rows:
    task_id, task_title, task_desc, task_created, comment_id, comment_content, comment_created, author_id, username = row
    if task_id not in tasks:
        tasks[task_id] = {
            "title": task_title,
            "description": task_desc,
            "created_at": task_created,
            "comments": []
        }
    if comment_id:  # Only add if there's a comment
        tasks[task_id]["comments"].append({
            "id": comment_id,
            "content": comment_content,
            "created_at": comment_created,
            "author": username
        })

# Summarize function
def summarize_task(task_data):
    # Structure text for LLM
    text = f"Tarefa: {task_data['title']}\n"
    text += f"Descrição: {task_data['description']}\n"
    text += f"Criada em: {task_data['created_at'].strftime('%d/%m/%Y %H:%M')}\n"
    if task_data["comments"]:
        text += "Comentários:\n"
        for comment in task_data["comments"]:
            text += f"- {comment['created_at'].strftime('%d/%m/%Y %H:%M')} (Autor {comment['author']}): {comment['content']}\n"
    else:
        text += "Sem comentários.\n"

    # Improved XML-like PTBR prompt
    prompt = (
        "You are Gemma, , a large language model built by Google.\n"
        "You are expected to follow the instructions, analyze the input, and generate a textual output.\n"
        "You have to keep the structure and finish on </output>.\n"
        "<instructions>\n"
        "Gemma é um modelo de linguagem projetado para explicar informações que forem fornecidas. "
        "Gemma deve gerar um texto de relato em português. "
        "Gemma não deve adicionar detalhes ou continuar a história, apenas resumir o conteúdo fornecido.\n"
        "</instructions>\n"
        "<input>\n"
        f"{text}\n"
        "</input>\n"
        "<output>\n"
    )

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
    return text, summary

# Process and save summaries
output_dir = "./output"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "summaries.txt")

try:
    with open(output_file, "w", encoding="utf-8") as f:
        for task_id, task_data in tasks.items():
            input_text, summary = summarize_task(task_data)
            f.write(
                f"Task ID: {task_id}\n"
                f"Input:\n{input_text}\n"
                f"Summary: {summary}\n"
                f"{'-'*50}\n"
            )
            print(f"🦍 Summarized Task '{task_data['title']}': {summary}")
    print(f"🦍 All done! Summaries saved to {output_file}! 🍌")
except Exception as e:
    print(f"🦍 Banana squashed! Failed to summarize or save: {e}")
finally:
    cursor.close()
    conn.close()
    print("🦍 DB connection closed. Jungle is calm. 🌴")
