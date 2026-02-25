/**
 * Script principal da calculadora
 * Estruturado para futura integração com API
 */

document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const buttons = document.querySelectorAll(".calculator__button");

  let currentInput = "";

  /**
   * Atualiza o display
   */
  const updateDisplay = () => {
    display.value = currentInput;
  };

  /**
   * Executa o cálculo
   * (Preparado para futura substituição por chamada de API)
   */
  const calculate = async () => {
    try {
      // Futuramente:
      // const response = await fetch('/api/calculate', {...})

      const result = eval(currentInput); // uso controlado
      currentInput = result.toString();
      updateDisplay();
    } catch (error) {
      currentInput = "Erro";
      updateDisplay();
    }
  };

  /**
   * Manipulação de clique
   */
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.value;
      const action = button.dataset.action;

      if (value) {
        currentInput += value;
        updateDisplay();
      }

      if (action === "clear") {
        currentInput = "";
        updateDisplay();
      }

      if (action === "delete") {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
      }

      if (action === "calculate") {
        calculate();
      }
    });
  });
});