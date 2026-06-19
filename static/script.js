const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function showTyping() {

    if (document.getElementById("typingMessage")) return;

    const typingDiv = document.createElement("div");

    typingDiv.id = "typingMessage";
    typingDiv.className = "message ai";

    typingDiv.innerHTML = `
        <div class="avatar">🤖</div>

        <div class="bubble">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatBox.appendChild(typingDiv);

    scrollToBottom();
}

function hideTyping() {

    const typingDiv = document.getElementById("typingMessage");

    if (typingDiv) {
        typingDiv.remove();
    }
}

function addMessage(role, text) {

    const wrapper = document.createElement("div");

    wrapper.className = `message ${role}`;

    const avatar = document.createElement("div");

    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

  if (window.marked) {

    bubble.innerHTML = marked.parse(text);

    setTimeout(() => {

        bubble.querySelectorAll("pre").forEach(pre => {

            if (pre.querySelector(".copy-btn")) return;

            const btn = document.createElement("button");

            btn.className = "copy-btn";
            btn.innerHTML = "📋 Copy";

            btn.onclick = function () {

                const code = pre.querySelector("code").innerText;

                navigator.clipboard.writeText(code);

                btn.innerHTML = "✅ Copied";

                setTimeout(() => {
                    btn.innerHTML = "📋 Copy";
                }, 2000);
            };

            pre.appendChild(btn);

        });

    }, 100);

} else {

    bubble.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");

}

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    if (window.hljs) {
        document.querySelectorAll("pre code").forEach(block => {
            hljs.highlightElement(block);
        });
    }

    scrollToBottom();
}

async function typeMessage(role, text) {

    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    let current = "";

    for (let i = 0; i < text.length; i++) {

        current += text[i];

        if (window.marked) {
            bubble.innerHTML = marked.parse(current);
        } else {
            bubble.innerHTML = current.replace(/\n/g, "<br>");
        }

        scrollToBottom();

        await new Promise(resolve => setTimeout(resolve, 15));
    }

    // Highlight code
    if (window.hljs) {
        bubble.querySelectorAll("pre code").forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // Add Copy Button
    bubble.querySelectorAll("pre").forEach(pre => {

        if (pre.querySelector(".copy-btn")) return;

        const btn = document.createElement("button");

        btn.className = "copy-btn";
        btn.innerHTML = "📋 Copy";

        btn.onclick = function () {

            const code = pre.querySelector("code").innerText;

            navigator.clipboard.writeText(code);

            btn.innerHTML = "✅ Copied";

            setTimeout(() => {
                btn.innerHTML = "📋 Copy";
            }, 2000);

        };

        pre.appendChild(btn);

    });

}

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    addMessage("user", message);

    input.value = "";
    input.style.height = "auto";

    showTyping();

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        hideTyping();

       typeMessage("ai", data.response);

    } catch (err) {

        hideTyping();

        addMessage("ai", "Server Error");

        console.error(err);

    }

}

async function loadHistory() {

    try {

        const response = await fetch("/history");

        const history = await response.json();

        history.forEach(item => {

            addMessage(
                item.role === "assistant" ? "ai" : "user",
                item.content
            );

        });

    } catch (err) {

        console.error(err);

    }

}

async function newChat() {

    await fetch("/new_chat", {
        method: "POST"
    });

    chatBox.innerHTML = "";

    addMessage(
        "ai",
        "Hello! I'm ready for a new conversation."
    );

}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

input.addEventListener("input", function () {

    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";

});

newChatBtn.addEventListener("click", newChat);

window.onload = function () {

    addMessage(
        "ai",
        "Hello 👋\n\nI'm your AI assistant powered by **Qwen2.5:7B** running locally using Ollama.\n\nAsk me anything."
    );

};