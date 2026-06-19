from flask import Flask, render_template, request, jsonify
import ollama
from database import (
    create_tables,
    save_message,
    get_chat_history,
    clear_chat
)

app = Flask(__name__)

# Create database
create_tables()

SYSTEM_PROMPT = """
You are ChatBot AI.

Rules:
- Be helpful.
- Answer clearly.
- Format code properly.
- Use Markdown when appropriate.
"""

chat_history = [
    {
        "role": "system",
        "content": SYSTEM_PROMPT
    }
]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()

    if not user_message:
        return jsonify({"response": "Message cannot be empty."}), 400

    save_message("user", user_message)

    chat_history.append({
        "role": "user",
        "content": user_message
    })

    try:
        response = ollama.chat(
            model="qwen2.5:7b",
            messages=chat_history
        )

        ai_reply = response.message.content

        chat_history.append({
            "role": "assistant",
            "content": ai_reply
        })

        save_message("assistant", ai_reply)

        return jsonify({
            "response": ai_reply
        })

    except Exception as e:
        import traceback
        traceback.print_exc()

        return jsonify({
            "response": str(e)
        }), 500


@app.route("/history")
def history():
    messages = get_chat_history()
    return jsonify(messages)


@app.route("/new_chat", methods=["POST"])
def new_chat():
    global chat_history

    clear_chat()

    chat_history = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    return jsonify({
        "status": "success"
    })


if __name__ == "__main__":
    app.run(debug=True)