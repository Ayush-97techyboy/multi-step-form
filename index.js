document.addEventListener("DOMContentLoaded", () => {
    let currentStep = 1;
    const totalSteps = 4;
    
    // Select Elements
    const stepElements = document.querySelectorAll(".step");
    const sidebarSteps = document.querySelectorAll(".sidebar-step");
    
    // Step 1 Validation
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    // Billing Toggle
    const billingCheckbox = document.getElementById("billing-toggle-checkbox");
    const monthlyLabel = document.getElementById("monthly-label");
    const yearlyLabel = document.getElementById("yearly-label");
    const planPrices = document.querySelectorAll(".plan-price");
    const yearlyBenefits = document.querySelectorAll(".yearly-benefit");
    const addonPrices = document.querySelectorAll(".addon-price");

    // Form Event
    const form = document.getElementById("multi-step-form");

    // Data State
    let isYearly = false;

    // Add error elements to step 1 inputs dynamically if not added
    function addErrorElements() {
        const groups = document.querySelectorAll('.form-group');
        groups.forEach(group => {
            if(!group.querySelector('.error-message')) {
                const errorSpan = document.createElement('span');
                errorSpan.classList.add('error-message');
                errorSpan.innerText = 'This field is required';
                group.appendChild(errorSpan);
            }
        });
    }
    
    addErrorElements();

    function validateStep1() {
        let isValid = true;
        const inputs = [nameInput, emailInput, phoneInput];
        
        inputs.forEach(input => {
            const group = input.parentElement;
            const errorMsg = group.querySelector('.error-message');
            
            if (!input.value.trim()) {
                group.classList.add('has-error');
                errorMsg.innerText = 'This field is required';
                isValid = false;
            } else if (input.type === 'email' && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.value)) {
                group.classList.add('has-error');
                errorMsg.innerText = 'Valid email required';
                isValid = false;
            } else {
                group.classList.remove('has-error');
            }
        });
        
        return isValid;
    }

    function validateStep2() {
        const selectedPlan = document.querySelector('input[name="plan"]:checked');
        const step2 = document.querySelector('.step-2');
        
        if (!selectedPlan) {
            step2.classList.add('has-error');
            return false;
        }
        
        step2.classList.remove('has-error');
        return true;
    }

    // Clear plan error on selection
    const planInputs = document.querySelectorAll('input[name="plan"]');
    planInputs.forEach(input => {
        input.addEventListener('change', () => {
            document.querySelector('.step-2').classList.remove('has-error');
        });
    });

    function updateSidebar() {
        sidebarSteps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add("active");
            } else {
                 if (currentStep <= totalSteps) { // step 5 doesn't have a sidebar active state
                    step.classList.remove("active");
                 }
            }
        });
    }

    function showStep(stepNumber) {
        stepElements.forEach((el, index) => {
            if (index + 1 === stepNumber) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        });
        updateSidebar();
        
        if (stepNumber === 4) {
            updateSummary();
        }
    }

    // Assign Buttons
    for (let i = 1; i <= 4; i++) {
        const nextBtn = document.getElementById(`btn-next-${i}`);
        const backBtn = document.getElementById(`btn-back-${i}`);
        
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (i === 1 && !validateStep1()) return;
                if (i === 2 && !validateStep2()) return;
                currentStep++;
                showStep(currentStep);
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                currentStep--;
                showStep(currentStep);
            });
        }
    }

    // Billing Cycle Switch Logic
    billingCheckbox.addEventListener("change", (e) => {
        isYearly = e.target.checked;
        
        if (isYearly) {
            monthlyLabel.classList.remove("active");
            yearlyLabel.classList.add("active");
            
            planPrices.forEach(p => p.innerText = p.getAttribute("data-yearly"));
            addonPrices.forEach(p => p.innerText = p.getAttribute("data-yearly"));
            yearlyBenefits.forEach(b => b.classList.remove("hidden"));
        } else {
            yearlyLabel.classList.remove("active");
            monthlyLabel.classList.add("active");
            
            planPrices.forEach(p => p.innerText = p.getAttribute("data-monthly"));
            addonPrices.forEach(p => p.innerText = p.getAttribute("data-monthly"));
            yearlyBenefits.forEach(b => b.classList.add("hidden"));
        }
    });

    // Populate Summary
    function updateSummary() {
        // Plan Data
        const selectedPlan = document.querySelector('input[name="plan"]:checked');
        const planName = selectedPlan.value.charAt(0).toUpperCase() + selectedPlan.value.slice(1);
        const planPricingType = isYearly ? "Yearly" : "Monthly";
        
        const planCard = selectedPlan.closest('.plan-card');
        const planPriceStr = planCard.querySelector('.plan-price').innerText;

        document.getElementById("summary-plan-name").innerText = `${planName} (${planPricingType})`;
        document.getElementById("summary-plan-price").innerText = planPriceStr;

        // Addons Data
        const summaryAddons = document.getElementById("summary-addons");
        summaryAddons.innerHTML = '';
        
        let total = parseInt(planPriceStr.replace(/\D/g, ''));
        
        const selectedAddons = document.querySelectorAll('input[name="addons"]:checked');
        
        selectedAddons.forEach(addon => {
            const addonCard = addon.closest('.addon-card');
            const addonName = addonCard.querySelector('strong').innerText;
            const addonPriceStr = addonCard.querySelector('.addon-price').innerText;
            
            total += parseInt(addonPriceStr.replace(/\D/g, '')); // add numbers
            
            const div = document.createElement("div");
            div.classList.add("summary-item");
            div.innerHTML = `
                <span>${addonName}</span>
                <strong>${addonPriceStr}</strong>
            `;
            summaryAddons.appendChild(div);
        });

        // Total
        const totalLabel = document.getElementById("summary-total-label");
        const totalPrice = document.getElementById("summary-total-price");
        
        totalLabel.innerText = `Total (per ${isYearly ? 'year' : 'month'})`;
        totalPrice.innerText = `+$${total}/${isYearly ? 'yr' : 'mo'}`;
    }

    // Change Plan Link in summary
    document.getElementById("change-plan").addEventListener("click", (e) => {
        e.preventDefault();
        currentStep = 2;
        showStep(currentStep);
    });

    // Final Form Submit Complete Event
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent reload
        currentStep = 5; // Thank you step
        showStep(currentStep);
    });
});
