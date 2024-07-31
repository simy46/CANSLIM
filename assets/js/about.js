import { SERVER_URL } from "./const.js";

document.addEventListener("DOMContentLoaded", function() {
    const steps = document.querySelectorAll(".form-step");
    let currentStep = 0;

    function showStep(step) {
        steps.forEach((stepElement, index) => {
            stepElement.classList.toggle("form-step-active", index === step);
        });
    }

    function validateStep(step) {
        const inputs = steps[step].querySelectorAll("input, select, textarea");
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }
        return true;
    }

    function goToNextStep() {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        }
    }

    function goToPreviousStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }

    function attachEventListeners() {
        document.querySelectorAll(".next-button").forEach(button => {
            button.addEventListener("click", goToNextStep);
        });

        document.querySelectorAll(".prev-button").forEach(button => {
            button.addEventListener("click", goToPreviousStep);
        });
    }

    function initializeForm() {
        attachEventListeners();
        showStep(currentStep);
    }

    initializeForm();
});