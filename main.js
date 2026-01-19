import { GoogleGenerativeAI } from '@google/generative-ai';

const LINKEDIN_SYSTEM_PROMPT = `You are a professional LinkedIn content strategist specialized in creating viral, authentic posts that drive meaningful engagement while maintaining professional credibility.

---

### 📥 Input Requirements

- **topic**: Main subject matter or message to be conveyed
- **target_audience**: Specific professional demographic being addressed
- **key_message**: Core insight or value proposition to communicate

**Optional Fields:**
- **personal_experience**: Relevant anecdotes or examples
- **industry_context**: Specific sector-related information

---

### 🏗️ Content Structure

#### 🎯 Hook *(Limit: 100 characters)*
**Requirements:**
- Start with a powerful statement, question, or statistic
- Create curiosity within the first 2–3 lines
- Use pattern interruption to stand out
- Avoid clickbait while maintaining intrigue

---

#### 🧱 Body
**Formatting:**
- Short, digestible paragraphs (2–3 lines)
- Strategic line breaks for readability
- Bullet points or numbered lists where helpful
- Use emojis sparingly (max 2–3)

**Content Elements:**
- Personal story or example
- Key insights or learnings
- Data points or stats (if relevant)
- Real-world application

---

#### 🪝 Conclusion
**Elements:**
- Clear takeaway or actionable insight
- Authentic call-to-action
- Open-ended question to spark engagement

---

### 🧾 Writing Style Guidelines

- **Use simple language**: Write plainly with short sentences.
  - ✅ Example: "I need help with this issue."
- **Avoid AI-giveaway phrases**: Stay away from clichés like "dive into," "unleash your potential."
  - ❌ Avoid: "Let's dive into this game-changing solution."
  - ✅ Use: "Here's how it works."
- **Be direct and concise**: Get to the point; remove unnecessary words.
  - ✅ Example: "We should meet tomorrow."
- **Maintain a natural tone**: Write as you speak. It's fine to begin sentences with "and" or "but."
  - ✅ Example: "And that's why it matters."
- **Avoid marketing language**: Skip hype and promotional phrasing.
  - ❌ Avoid: "This revolutionary product will transform your life."
  - ✅ Use: "This product can help you."
- **Keep it real**: Be honest; don't force friendliness.
  - ✅ Example: "I don't think that's the best idea."
- **Simplify grammar**: Don't stress perfect grammar or capitalization.
  - ✅ Example: "i guess we can try that."
- **Stay away from fluff**: Skip unnecessary adjectives or adverbs.
  - ✅ Example: "We finished the task."
- **Focus on clarity**: Make it easy to understand.
  - ✅ Example: "Please send the file by Monday."

---

### 🎙️ Tone Guidelines

**Do:**
- Write conversationally and naturally
- Use first-person perspective
- Maintain professional authenticity
- Include relatable elements
- Use simple, accessible language

**Avoid:**
- Corporate jargon or buzzwords
- Overused phrases ("I'm excited to announce…")
- Excessive self-promotion
- Fake enthusiasm
- Unnecessary technical complexity
- Controversial or polarizing statements

---

### 🚀 Engagement Optimization

**Strategies:**
- End with an open-ended question
- Encourage similar story sharing
- Request feedback or opinions
- Tag relevant people/orgs (if applicable)
- Use 3–5 relevant hashtags only

---

### ✅ Post Checklist

- [ ] Compelling hook
- [ ] Clear value proposition
- [ ] Scannable format
- [ ] Authentic voice
- [ ] Natural idea flow
- [ ] Engaging conclusion
- [ ] Length: 1000–1300 characters
- [ ] Call-to-action included
- [ ] Professional tone
- [ ] Proper formatting and spacing

---

### 🖼️ Output Format

Provide the LinkedIn post in plain text format, ready to copy and paste.

---

### 🧪 Examples

**✅ Good Hook:**
> "I rejected a $50K raise last week.
> Here's why it was the best decision I've made:"

**❌ Bad Hook:**
> "🚨 ATTENTION: Mind-blowing career hack that will change your life! 🚨"`;

const formData = {
  topic: '',
  targetAudience: '',
  keyMessage: '',
  personalExperience: '',
  industryContext: '',
  tone: 'Professional',
  length: 'Medium',
  style: 'Storytelling'
};

function updateCharacterCount() {
  const topic = document.getElementById('topic').value;
  const charCount = topic.length;
  document.getElementById('char-count').textContent = charCount;

  const strengthElement = document.getElementById('context-strength');
  if (charCount < 50) {
    strengthElement.textContent = 'Weak';
  } else if (charCount < 150) {
    strengthElement.textContent = 'Good';
  } else {
    strengthElement.textContent = 'Strong';
  }
}

function updateLengthLabel() {
  const slider = document.getElementById('length-slider');
  const label = document.getElementById('length-label');
  const value = parseInt(slider.value);

  const labels = ['Short', 'Medium', 'Long'];
  label.textContent = labels[value - 1];
}

function setupToneButtons() {
  const toneButtons = document.querySelectorAll('.tone-btn');
  toneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toneButtons.forEach(b => {
        b.classList.remove('border-2', 'border-accent-blue', 'text-accent-blue', 'bg-white');
        b.classList.add('bg-gray-100', 'text-subtext-light', 'border-transparent');
      });

      btn.classList.remove('bg-gray-100', 'text-subtext-light', 'border-transparent');
      btn.classList.add('border-2', 'border-accent-blue', 'text-accent-blue', 'bg-white');

      formData.tone = btn.getAttribute('data-tone');
    });
  });
}

function setupStyleRadios() {
  const styleRadios = document.querySelectorAll('input[name="style"]');
  styleRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.style-radio').forEach(label => {
        label.classList.remove('border-accent-blue', 'bg-blue-50/50', 'dark:bg-blue-900/10');
        label.classList.add('border-border-light', 'dark:border-border-dark', 'bg-white', 'dark:bg-gray-800');
      });

      if (radio.checked) {
        const label = radio.closest('.style-radio');
        label.classList.remove('border-border-light', 'dark:border-border-dark', 'bg-white', 'dark:bg-gray-800');
        label.classList.add('border-accent-blue', 'bg-blue-50/50', 'dark:bg-blue-900/10');
        formData.style = radio.value;
      }
    });
  });
}

function collectFormData() {
  formData.topic = document.getElementById('topic').value.trim();
  formData.targetAudience = document.getElementById('target-audience').value.trim();
  formData.keyMessage = document.getElementById('key-message').value.trim();
  formData.personalExperience = document.getElementById('personal-experience').value.trim();
  formData.industryContext = document.getElementById('industry-context').value.trim();

  const lengthValue = parseInt(document.getElementById('length-slider').value);
  formData.length = ['Short', 'Medium', 'Long'][lengthValue - 1];

  const selectedStyle = document.querySelector('input[name="style"]:checked');
  if (selectedStyle) {
    formData.style = selectedStyle.value;
  }
}

function buildPromptForGemini() {
  let userPrompt = `Generate a LinkedIn post with the following requirements:

**Topic**: ${formData.topic}

**Target Audience**: ${formData.targetAudience || 'General professional audience'}

**Key Message**: ${formData.keyMessage || 'Based on the topic above'}`;

  if (formData.personalExperience) {
    userPrompt += `\n\n**Personal Experience**: ${formData.personalExperience}`;
  }

  if (formData.industryContext) {
    userPrompt += `\n\n**Industry Context**: ${formData.industryContext}`;
  }

  userPrompt += `\n\n**Tone**: ${formData.tone}
**Length**: ${formData.length} (${formData.length === 'Short' ? '500-800' : formData.length === 'Medium' ? '1000-1300' : '1500-2000'} characters)
**Engagement Style**: ${formData.style}

Please generate a compelling LinkedIn post following all the guidelines in your system instructions.`;

  return userPrompt;
}

async function generateLinkedInPost() {
  collectFormData();

  if (!formData.topic) {
    alert('Please provide a topic before generating.');
    return;
  }

  const generateBtn = document.getElementById('generate-btn');
  const btnText = document.getElementById('generate-btn-text');
  const outputArea = document.getElementById('output-area');

  btnText.textContent = 'Generating...';
  generateBtn.disabled = true;

  outputArea.innerHTML = `
    <div class="flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mb-4"></div>
      <p class="text-sm text-subtext-light dark:text-subtext-dark">Crafting your LinkedIn post...</p>
    </div>
  `;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    outputArea.innerHTML = `
      <div class="text-left w-full">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">API Key Required</h3>
          <p class="text-sm text-red-700 dark:text-red-300 mb-4">
            Please add your Gemini API key to the .env file:
          </p>
          <code class="block bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 p-3 rounded text-xs">
            VITE_GEMINI_API_KEY=your_actual_api_key_here
          </code>
          <p class="text-xs text-red-600 dark:text-red-400 mt-4">
            Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" class="underline">Google AI Studio</a>
          </p>
        </div>
      </div>
    `;
    btnText.textContent = 'Generate LinkedIn Post';
    generateBtn.disabled = false;
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      systemInstruction: LINKEDIN_SYSTEM_PROMPT
    });

    const userPrompt = buildPromptForGemini();
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const generatedPost = response.text();

    outputArea.innerHTML = `
      <div class="w-full text-left">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-text-light dark:text-white">Your LinkedIn Post</h3>
          <button id="copy-post-btn" class="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-purple text-white rounded-lg text-sm font-medium transition-all">
            <span class="material-icons text-sm">content_copy</span>
            Copy
          </button>
        </div>
        <div class="bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-xl p-6">
          <pre id="generated-post" class="whitespace-pre-wrap text-sm text-text-light dark:text-text-dark leading-relaxed font-sans">${generatedPost}</pre>
        </div>
        <div class="flex items-center justify-between mt-4 text-xs text-subtext-light dark:text-subtext-dark">
          <span>${generatedPost.length} characters</span>
          <button id="regenerate-btn" class="flex items-center gap-1 hover:text-accent-blue transition-colors">
            <span class="material-icons text-sm">refresh</span>
            Regenerate
          </button>
        </div>
      </div>
    `;

    document.getElementById('copy-post-btn').addEventListener('click', () => {
      const postText = document.getElementById('generated-post').textContent;
      navigator.clipboard.writeText(postText).then(() => {
        const btn = document.getElementById('copy-post-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons text-sm">check</span> Copied!';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
        }, 2000);
      });
    });

    document.getElementById('regenerate-btn').addEventListener('click', generateLinkedInPost);

  } catch (error) {
    console.error('Error generating post:', error);
    outputArea.innerHTML = `
      <div class="text-left w-full">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Generation Failed</h3>
          <p class="text-sm text-red-700 dark:text-red-300">
            ${error.message || 'An error occurred while generating your post. Please try again.'}
          </p>
        </div>
      </div>
    `;
  } finally {
    btnText.textContent = 'Generate LinkedIn Post';
    generateBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('topic').addEventListener('input', updateCharacterCount);
  document.getElementById('length-slider').addEventListener('input', updateLengthLabel);
  document.getElementById('generate-btn').addEventListener('click', generateLinkedInPost);

  setupToneButtons();
  setupStyleRadios();
  updateCharacterCount();
  updateLengthLabel();
});
