/**
 * Calculadora melhorada: avaliador seguro, suporte a teclado,
 * copiar resultado e alternância de tema.
 */

document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const buttons = document.querySelectorAll(".calculator__button");
  const copyBtn = document.getElementById("copy-btn");
  const copyHeaderBtn = document.getElementById("copy-btn-header");
  const themeToggle = document.getElementById("theme-toggle");

  let currentInput = "";

  const updateDisplay = () => {
    display.value = currentInput;
  };

  // -------------------------
  // Avaliador seguro (Shunting-yard -> RPN)
  // -------------------------
  const isOperator = (c) => /[+\-*/]/.test(c);

  const precedence = (op) => {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
  };

  function toRPN(expr) {
    const output = [];
    const ops = [];
    let numberBuffer = '';

    const flushNumber = () => {
      if (numberBuffer.length) {
        output.push(numberBuffer);
        numberBuffer = '';
      }
    };

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];

      if (ch === ' ') continue;

      if ((ch >= '0' && ch <= '9') || ch === '.') {
        numberBuffer += ch;
        continue;
      }

      // Handle unary minus (negative numbers)
      if (ch === '-' && (i === 0 || isOperator(expr[i - 1]) || expr[i - 1] === '(')) {
        numberBuffer += ch; // part of number
        continue;
      }

      flushNumber();

      if (isOperator(ch)) {
        while (ops.length && isOperator(ops[ops.length - 1]) && precedence(ops[ops.length - 1]) >= precedence(ch)) {
          output.push(ops.pop());
        }
        ops.push(ch);
        continue;
      }

      if (ch === '(') {
        ops.push(ch);
        continue;
      }

      if (ch === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop());
        }
        ops.pop(); // remove '('
        continue;
      }

      // ignore unknown characters
    }

    flushNumber();

    while (ops.length) output.push(ops.pop());

    return output;
  }

  function evalRPN(tokens) {
    const stack = [];

    tokens.forEach((t) => {
      if (isOperator(t)) {
        const b = parseFloat(stack.pop());
        const a = parseFloat(stack.pop());
        let r = 0;
        switch (t) {
          case '+': r = a + b; break;
          case '-': r = a - b; break;
          case '*': r = a * b; break;
          case '/': r = a / b; break;
        }
        stack.push(r);
      } else {
        stack.push(t);
      }
    });

    return stack.length ? stack[0] : 0;
  }

  function evaluateExpression(expr) {
    if (!expr || expr.trim() === '') throw new Error('Empty expression');
    const rpn = toRPN(expr);
    const result = evalRPN(rpn);
    if (!isFinite(result)) throw new Error('Invalid result');
    return result;
  }

  // -------------------------
  // Actions
  // -------------------------
  const clear = () => {
    currentInput = '';
    updateDisplay();
  };

  const del = () => {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
  };

  const calculate = () => {
    try {
      const result = evaluateExpression(currentInput);
      // tidy up floats
      currentInput = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString();
      updateDisplay();
    } catch (err) {
      currentInput = 'Erro';
      updateDisplay();
      setTimeout(() => { currentInput = ''; updateDisplay(); }, 1200);
    }
  };

  // -------------------------
  // Button clicks
  // -------------------------
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.value;
      const action = button.dataset.action;

      if (value) {
        // prevent multiple operators in a row
        const last = currentInput.slice(-1);
        if (isOperator(value)) {
          if (currentInput === '' && value !== '-') return; // don't allow starting with +*/
          if (isOperator(last)) {
            currentInput = currentInput.slice(0, -1) + value;
          } else {
            currentInput += value;
          }
        } else if (value === '.') {
          // avoid multiple dots in the current number
          const parts = currentInput.split(/[^0-9.\-]/);
          const lastNum = parts[parts.length - 1] || '';
          if (lastNum.includes('.')) return;
          currentInput += value;
        } else {
          currentInput += value;
        }
        updateDisplay();
      }

      if (action === 'clear') clear();
      if (action === 'delete') del();
      if (action === 'calculate') calculate();
    });
  });

  // -------------------------
  // Keyboard support
  // -------------------------
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if ((/^[0-9]$/.test(k)) || '+-*/().'.includes(k)) {
      e.preventDefault();
      // reuse click handling logic
      const synthetic = { dataset: { value: k } };
      // temporary: append value with same rules
      const button = { dataset: { value: k } };
      // use existing logic for adding value
      const value = k;
      const last = currentInput.slice(-1);
      if (isOperator(value)) {
        if (currentInput === '' && value !== '-') return;
        if (isOperator(last)) {
          currentInput = currentInput.slice(0, -1) + value;
        } else {
          currentInput += value;
        }
      } else if (value === '.') {
        const parts = currentInput.split(/[^0-9.\-]/);
        const lastNum = parts[parts.length - 1] || '';
        if (lastNum.includes('.')) return;
        currentInput += value;
      } else {
        currentInput += value;
      }
      updateDisplay();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      del();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      clear();
      return;
    }
  });

  // -------------------------
  // Copy result
  // -------------------------
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(display.value || '');
      // small visual feedback
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = old, 900);
    } catch (e) {
      // fallback
      const tmp = document.createElement('textarea');
      tmp.value = display.value || '';
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    }
  };

  if (copyBtn) copyBtn.addEventListener('click', doCopy);
  if (copyHeaderBtn) copyHeaderBtn.addEventListener('click', doCopy);

  // -------------------------
  // Theme toggle
  // -------------------------
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed', 'false');
    }
    try { localStorage.setItem('calc-theme', theme); } catch (e) {}
  };

  const saved = localStorage.getItem('calc-theme');
  if (saved === 'dark') applyTheme('dark');

  if (themeToggle) themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  });

  // initial render
  updateDisplay();
});