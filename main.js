import { GoogleGenerativeAI } from '@google/generative-ai';

let currentStep = 1;
const totalSteps = 5;

const formData = {
  primaryObjective: '',
  targetAudience: '',
  outputFormat: '',
  mustDo: ['', '', ''],
  mustNot: ['', '', '']
};

function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

function updateStepperNav() {
  const stepperItems = document.querySelectorAll('#stepper-nav li');
  stepperItems.forEach((item, index) => {
    const stepNum = index + 1;
    const circle = item.querySelector('.stepper-circle');
    const label = item.querySelector('.text-sm');

    if (stepNum === currentStep) {
      item.classList.remove('stepper-item-inactive');
      item.classList.add('stepper-item-active');
      circle.classList.remove('border-2', 'border-gray-200', 'text-gray-400');
      circle.classList.add('bg-gray-900', 'text-white', 'shadow-lg', 'shadow-gray-200');
      label.classList.remove('text-gray-600');
      label.classList.add('text-gray-900');
    } else if (stepNum < currentStep) {
      item.classList.remove('stepper-item-inactive');
      item.classList.add('stepper-item-active');
      circle.classList.remove('border-2', 'border-gray-200', 'text-gray-400');
      circle.classList.add('bg-green-600', 'text-white');
      label.classList.remove('text-gray-600');
      label.classList.add('text-gray-900');
    } else {
      item.classList.remove('stepper-item-active');
      item.classList.add('stepper-item-inactive');
      circle.classList.remove('bg-gray-900', 'bg-green-600', 'text-white', 'shadow-lg', 'shadow-gray-200');
      circle.classList.add('border-2', 'border-gray-200', 'text-gray-400');
      label.classList.remove('text-gray-900');
      label.classList.add('text-gray-600');
    }
  });
}

function showStep(stepNum) {
  document.querySelectorAll('.step-content').forEach(step => {
    step.classList.add('hidden');
  });

  const stepElement = document.getElementById(`step-${stepNum}`);
  if (stepElement) {
    stepElement.classList.remove('hidden');
  }

  currentStep = stepNum;
  updateProgress();
  updateStepperNav();
}

function saveCurrentStepData() {
  switch(currentStep) {
    case 1:
      formData.primaryObjective = document.getElementById('primary-objective').value.trim();
      break;
    case 2:
      formData.targetAudience = document.getElementById('target-audience').value.trim();
      break;
    case 3:
      formData.outputFormat = document.getElementById('output-format').value.trim();
      break;
    case 4:
      formData.mustDo[0] = document.getElementById('must-do-1').value.trim();
      formData.mustDo[1] = document.getElementById('must-do-2').value.trim();
      formData.mustDo[2] = document.getElementById('must-do-3').value.trim();
      break;
    case 5:
      formData.mustNot[0] = document.getElementById('must-not-1').value.trim();
      formData.mustNot[1] = document.getElementById('must-not-2').value.trim();
      formData.mustNot[2] = document.getElementById('must-not-3').value.trim();
      break;
  }
}

function buildPromptForGemini() {
  const mustDoList = formData.mustDo.filter(item => item).map((item, i) => `${i + 1}. ${item}`).join('\n');
  const mustNotList = formData.mustNot.filter(item => item).map((item, i) => `${i + 1}. ${item}`).join('\n');

  return `You are an expert prompt architect. Generate production-ready system instructions from user requirements that achieve 90%+ first-try success rates.

Input format:

Task goal: ${formData.primaryObjective}

Target user: ${formData.targetAudience}

Output format example: ${formData.outputFormat}

Must do:
${mustDoList}

Must not:
${mustNotList}

Step 1: Classify (Execute Silently)
Task type: Reasoning | Creative | Analysis | Code | Conversation | Data Processing

Complexity scoring (+1 each):
- Requires domain expertise
- Multiple steps/decision points
- Subjective judgment needed
- Handles ambiguous inputs
- Needs validation/verification
- Errors have consequences

0-1 = Simple (100-200 words) | 2-3 = Intermediate (250-400 words) | 4-6 = Complex (400-600 words)

Step 2: Select Components (Research-Optimized)

Component	Simple	Intermediate	Complex
Role + Task + Output Format	✅	✅	✅
"Think step by step" (if reasoning/analysis)	❌	✅	✅
Uncertainty handling	❌	If needed	✅
2-3 examples (show edge cases, not just typical)	❌	If ambiguous	✅
Quality verification	❌	❌	✅
Delimiter/security guidance (medium+ risk)	❌	✅	✅

Step 3: Generate Using This Template

Simple tasks:
You are [role] serving [target user].

Your task is to [action + objective].

You must:
- [must do 1-3]

Do not:
- [must not 1-3]

Output format: [format description]
Example: [user's example]

Intermediate tasks (add):
[If reasoning task:] Think through this step by step before answering.

[If knowledge gaps possible:] If uncertain, state confidence level and what info would help.

[If medium+ risk:] Use clear delimiters (\`\`\` or ===) to separate your output from surrounding context.

Ensure output follows format exactly.

Complex tasks (add):
Follow this process:
1. [logical step 1]
2. [logical step 2]

Verify before finalizing:
- All requirements met
- Format matches exactly
- [domain-specific quality check]

[Examples - show decision boundaries, not just typical cases:]

Example 1 (Typical):
Input: [realistic input]
Output: [correct format]

Example 2 (Edge case):
Input: [boundary condition or ambiguous case]
Output: [how to handle correctly]

[Optional Example 3 if needed to show failure mode:]
Input: [cannot process case]
Output: "Cannot complete because [reason]. Need: [what's missing]"

Critical Rules Always:
- Map all "must do" items to positive instructions
- Convert all "must not" to explicit "Do not..." constraints (-85% unwanted behaviors)
- Preserve exact output format from user's example (-72% failure when missing)
- Use concrete, measurable language

Never include:
- Vague qualities: "helpful", "smart", "creative" (-5% performance)
- Redundant instructions
- Meta-commentary
- Generic filler

For factual/high-stakes tasks add:
- "Do not fabricate data, citations, or facts. If uncertain, acknowledge limitations."
- "If you cannot complete this safely or accurately, explain why and suggest alternatives."

Output:
Generate only the system instruction. No preamble, no explanation. Start with "You are..." and make it immediately usable.

Target length: 100-200 (simple) | 250-400 (intermediate) | 400-600 (complex)`;
}

async function generateSystemInstructions() {
  saveCurrentStepData();

  if (!formData.primaryObjective) {
    alert('Please provide at least a Primary Objective before generating.');
    showStep(1);
    return;
  }

  document.querySelectorAll('.step-content').forEach(step => {
    step.classList.add('hidden');
  });
  document.getElementById('result-display').classList.remove('hidden');

  const generatedPromptElement = document.getElementById('generated-prompt');
  generatedPromptElement.textContent = 'Generating your system instructions...';

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    generatedPromptElement.textContent = 'Error: VITE_GEMINI_API_KEY not found in environment variables. Please add it to your .env file.';
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = buildPromptForGemini();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    generatedPromptElement.textContent = text;
  } catch (error) {
    console.error('Error generating instructions:', error);
    generatedPromptElement.textContent = `Error generating instructions: ${error.message}\n\nPlease check your API key and try again.`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      saveCurrentStepData();
      if (currentStep < totalSteps) {
        showStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      saveCurrentStepData();
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  });

  document.querySelectorAll('#stepper-nav li').forEach((item, index) => {
    item.addEventListener('click', () => {
      saveCurrentStepData();
      showStep(index + 1);
    });
  });

  document.getElementById('generate-btn').addEventListener('click', generateSystemInstructions);

  document.getElementById('copy-btn').addEventListener('click', () => {
    const text = document.getElementById('generated-prompt').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copy-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Copied!';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    });
  });

  document.getElementById('start-over-btn').addEventListener('click', () => {
    formData.primaryObjective = '';
    formData.targetAudience = '';
    formData.outputFormat = '';
    formData.mustDo = ['', '', ''];
    formData.mustNot = ['', '', ''];

    document.getElementById('primary-objective').value = '';
    document.getElementById('target-audience').value = '';
    document.getElementById('output-format').value = '';
    document.getElementById('must-do-1').value = '';
    document.getElementById('must-do-2').value = '';
    document.getElementById('must-do-3').value = '';
    document.getElementById('must-not-1').value = '';
    document.getElementById('must-not-2').value = '';
    document.getElementById('must-not-3').value = '';

    document.getElementById('result-display').classList.add('hidden');
    showStep(1);
  });

  updateProgress();
  updateStepperNav();
});
