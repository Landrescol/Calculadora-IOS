        'use strict';

        /* Constantes para limitar la entrada y reducir residuos decimales. */
        const MAX_DIGITS = 16;
        const DECIMAL_PRECISION = 12;

        /* La clase concentra estado, calculos, teclado y representacion. */
        class Calculator {
            constructor() {
                this.output = document.querySelector('#output');
                this.expression = document.querySelector('#expression');
                this.clearLabel = document.querySelector('#clear-label');
                this.buttons = [...document.querySelectorAll('.key')];
                this.state = this.initialState();
                this.bindEvents();
                this.render();
            }

            initialState() {
                return {
                    input: '0', previous: null, operator: null,
                    lastOperator: null, lastOperand: null, waiting: false,
                    entered: false, calculated: false, error: false,
                    expression: ''
                };
            }

            /* El DOM y el teclado reutilizan exactamente las mismas acciones. */
            bindEvents() {
                this.buttons.forEach((button) => {
                    button.addEventListener('click', () => this.activate(button));
                });

                document.addEventListener('keydown', (event) => {
                    if (event.ctrlKey || event.metaKey || event.altKey) return;
                    const button = this.buttons.find((item) =>
                        (item.dataset.keys || '').split('|').includes(event.key)
                    );
                    if (!button) return;
                    event.preventDefault();
                    button.classList.add('pressed');
                    window.setTimeout(() => button.classList.remove('pressed'), 120);
                    button.click();
                });
            }

            activate(button) {
                if (button.dataset.digit !== undefined) {
                    this.addDigit(button.dataset.digit);
                } else if (button.dataset.operator !== undefined) {
                    this.setOperator(button.dataset.operator);
                } else {
                    const actions = {
                        clear: () => this.clear(),
                        decimal: () => this.addDecimal(),
                        equals: () => this.equals(),
                        percent: () => this.percent(),
                        'toggle-sign': () => this.changeSign()
                    };
                    actions[button.dataset.action]?.();
                }
            }

            addDigit(digit) {
                if (this.state.error) this.reset();
                if (this.state.calculated) this.newCalculation();

                if (this.state.waiting) {
                    this.state.input = digit;
                    this.state.waiting = false;
                } else if (this.state.input === '0') {
                    this.state.input = digit;
                } else if (this.digits(this.state.input) < MAX_DIGITS) {
                    this.state.input += digit;
                }

                this.state.entered = true;
                this.render();
            }

            addDecimal() {
                if (this.state.error) this.reset();
                if (this.state.calculated) this.newCalculation();

                if (this.state.waiting) {
                    this.state.input = '0.';
                    this.state.waiting = false;
                } else if (!this.state.input.includes('.')) {
                    this.state.input += '.';
                }

                this.state.entered = true;
                this.render();
            }

            /* Los operadores encadenados resuelven primero la operacion anterior. */
            setOperator(nextOperator) {
                if (this.state.error) return;
                const value = this.number(this.state.input);

                if (this.state.operator && !this.state.waiting) {
                    const result = this.compute(
                        this.state.previous,
                        value,
                        this.state.operator
                    );
                    if (!this.applyResult(result)) return;
                } else if (this.state.previous === null || this.state.calculated) {
                    this.state.previous = value;
                }

                this.state.operator = nextOperator;
                this.state.waiting = true;
                this.state.calculated = false;
                this.state.entered = false;
                this.state.expression =
                    `${this.format(this.state.previous)} ${this.symbol(nextOperator)}`;
                this.render();
            }

            equals() {
                if (this.state.error) return;
                let left;
                let right;
                let operator;

                if (this.state.operator) {
                    left = this.state.previous;
                    right = this.state.waiting
                        ? this.state.previous
                        : this.number(this.state.input);
                    operator = this.state.operator;
                } else if (this.state.lastOperator && this.state.lastOperand !== null) {
                    left = this.number(this.state.input);
                    right = this.state.lastOperand;
                    operator = this.state.lastOperator;
                } else {
                    return;
                }

                const result = this.compute(left, right, operator);
                if (!this.applyResult(result)) return;

                this.state.lastOperator = operator;
                this.state.lastOperand = right;
                this.state.operator = null;
                this.state.waiting = true;
                this.state.entered = false;
                this.state.calculated = true;
                this.state.expression =
                    `${this.format(left)} ${this.symbol(operator)} ${this.format(right)} =`;
                this.render();
            }

            compute(left, right, operator) {
                let result;
                switch (operator) {
                    case '+': result = left + right; break;
                    case '-': result = left - right; break;
                    case '*': result = left * right; break;
                    case '/':
                        if (right === 0) return { error: true };
                        result = left / right;
                        break;
                    default: return { error: true };
                }
                return { value: this.normalize(result) };
            }

            applyResult(result) {
                if (result.error) {
                    this.showError();
                    return false;
                }
                this.state.input = this.format(result.value);
                this.state.previous = result.value;
                return true;
            }

            /* En sumas y restas el porcentaje se calcula sobre el primer valor. */
            percent() {
                if (this.state.error) return;
                const value = this.number(this.state.input);
                const contextual = this.state.operator === '+' || this.state.operator === '-';
                const result = contextual
                    ? this.normalize(this.state.previous * value / 100)
                    : this.normalize(value / 100);

                this.state.input = this.format(result);
                this.state.waiting = false;
                this.state.calculated = false;
                this.state.entered = true;
                this.state.expression = `${this.format(value)}%`;
                this.render();
            }

            changeSign() {
                if (this.state.error || this.state.input === '0') return;
                this.state.input = this.state.input.startsWith('-')
                    ? this.state.input.slice(1)
                    : `-${this.state.input}`;
                this.state.entered = true;
                this.render();
            }

            /* C limpia el valor actual y AC reinicia toda la operacion. */
            clear() {
                if (this.state.error || this.state.calculated || !this.state.entered) {
                    this.reset();
                    return;
                }
                this.state.input = '0';
                this.state.waiting = Boolean(this.state.operator);
                this.state.entered = false;
                this.state.lastOperator = null;
                this.state.lastOperand = null;
                this.render();
            }

            reset() {
                this.state = this.initialState();
                this.render();
            }

            newCalculation() {
                this.state.previous = null;
                this.state.operator = null;
                this.state.lastOperator = null;
                this.state.lastOperand = null;
                this.state.waiting = false;
                this.state.calculated = false;
                this.state.expression = '';
            }

            showError() {
                this.state.error = true;
                this.state.input = '0';
                this.state.previous = null;
                this.state.operator = null;
                this.state.waiting = true;
                this.state.entered = false;
                this.state.calculated = false;
                this.state.expression = 'No se puede dividir entre cero';
                this.render();
            }

            number(value) {
                return Number.parseFloat(value.replace(',', '.')) || 0;
            }

            normalize(value) {
                return Number.isFinite(value)
                    ? Number.parseFloat(value.toFixed(DECIMAL_PRECISION))
                    : value;
            }

            format(value) {
                return Number.isFinite(value) ? String(this.normalize(value)) : 'Error';
            }

            digits(value) {
                return value.replace('-', '').replace('.', '').length;
            }

            symbol(operator) {
                return { '+': '+', '-': '-', '*': '*', '/': '/' }[operator];
            }

            render() {
                const visible = this.state.error ? 'Error' : this.state.input;
                const count = visible.replace(/\D/g, '').length;
                this.output.textContent = visible;
                this.output.dataset.length =
                    count > 14 ? 'extra-long'
                    : count > 11 ? 'long'
                    : count > 8 ? 'medium'
                    : 'short';
                this.expression.textContent = this.state.expression;
                this.clearLabel.textContent =
                    this.state.entered || this.state.calculated || this.state.error
                        ? 'C' : 'AC';
            }
        }

        document.addEventListener('DOMContentLoaded', () => new Calculator());
