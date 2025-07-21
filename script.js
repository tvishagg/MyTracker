document.addEventListener('DOMContentLoaded', () => {

    // Application State
    const state = {
        activeTab: 'log',
        totalBurned: 0,
        budgets: {
            totalCalorieBudget: 2000,
            burnGoal: 500,
            tdee: 2500,
            mealBudgets: {
                breakfast: 400,
                morningSnack: 200,
                lunch: 600,
                eveningSnack: 200,
                dinner: 600
            },
            macroBudgets: {
                protein: 150,
                carbs: 200,
                fat: 67
            }
        },
        dailyMeals: {
            breakfast: [],
            morningSnack: [],
            lunch: [],
            eveningSnack: [],
            dinner: []
        }
    };

    // DOM Elements
    const dom = {
        logView: document.getElementById('log-view'),
        budgetView: document.getElementById('budget-view'),
        logTabBtn: document.getElementById('log-tab-btn'),
        budgetTabBtn: document.getElementById('budget-tab-btn'),

        // Summary
        totalCals: document.getElementById('total-cals'),
        totalCalsBudget: document.getElementById('total-cals-budget'),
        totalBurned: document.getElementById('total-burned'),
        burnGoal: document.getElementById('burn-goal'),
        netCalories: document.getElementById('net-calories'),
        calorieDeficit: document.getElementById('calorie-deficit'),
        calsEatenRing: document.getElementById('cals-eaten-ring'),
        calsEatenPercent: document.getElementById('cals-eaten-percent'),
        calsBurnedRing: document.getElementById('cals-burned-ring'),
        calsBurnedPercent: document.getElementById('cals-burned-percent'),
        macroSummary: document.getElementById('macro-summary'),

        // Forms
        addFoodForm: document.getElementById('add-food-form'),
        foodMealSelect: document.getElementById('food-meal-select'),
        foodNameInput: document.getElementById('food-name-input'),
        foodCaloriesInput: document.getElementById('food-calories-input'),
        foodProteinInput: document.getElementById('food-protein-input'),
        foodCarbsInput: document.getElementById('food-carbs-input'),
        foodFatInput: document.getElementById('food-fat-input'),
        totalBurnedInput: document.getElementById('total-burned-input'),

        // Budget Page
        budgetForm: document.getElementById('budget-form'),
        editBudgetBtn: document.getElementById('edit-budget-btn'),
        saveBudgetBtn: document.getElementById('save-budget-btn'),
        cancelBudgetBtn: document.getElementById('cancel-budget-btn'),
        budgetInputs: {
            totalCalorieBudget: document.getElementById('budget-total-cals'),
            tdee: document.getElementById('budget-tdee'),
            burnGoal: document.getElementById('budget-burn-goal'),
            breakfast: document.getElementById('budget-breakfast'),
            morningSnack: document.getElementById('budget-morningSnack'),
            lunch: document.getElementById('budget-lunch'),
            eveningSnack: document.getElementById('budget-eveningSnack'),
            dinner: document.getElementById('budget-dinner'),
            protein: document.getElementById('budget-protein'),
            carbs: document.getElementById('budget-carbs'),
            fat: document.getElementById('budget-fat'),
        }
    };
    
    // --- RENDER FUNCTIONS ---
    
    function render() {
        // Calculations
        let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        for (const mealType in state.dailyMeals) {
            state.dailyMeals[mealType].forEach(food => {
                totalCals += food.calories;
                totalProtein += food.protein;
                totalCarbs += food.carbs;
                totalFat += food.fat;
            });
        }
        const netCalories = totalCals - state.totalBurned;
        const calorieDeficit = state.budgets.tdee - netCalories;

        // Render everything
        renderSummary(totalCals, netCalories, calorieDeficit);
        renderMacros(totalProtein, totalCarbs, totalFat);
        renderMeals();
        renderBudgets();
    }

    function renderSummary(totalCals, netCalories, calorieDeficit) {
        dom.totalCals.textContent = totalCals;
        dom.totalCalsBudget.textContent = state.budgets.totalCalorieBudget;
        dom.totalBurned.textContent = state.totalBurned;
        dom.burnGoal.textContent = state.budgets.burnGoal;
        dom.netCalories.textContent = netCalories;
        dom.calorieDeficit.textContent = calorieDeficit;

        const eatenPercent = state.budgets.totalCalorieBudget > 0 ? (totalCals / state.budgets.totalCalorieBudget) * 100 : 0;
        dom.calsEatenRing.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(${eatenPercent > 100 ? '--danger-color' : '--primary-color'}) ${eatenPercent}%, var(--medium-gray) 0%)`;
        dom.calsEatenPercent.textContent = `${Math.round(eatenPercent)}%`;

        const burnedPercent = state.budgets.burnGoal > 0 ? (state.totalBurned / state.budgets.burnGoal) * 100 : 0;
        dom.calsBurnedRing.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--warning-color) ${burnedPercent}%, var(--medium-gray) 0%)`;
        dom.calsBurnedPercent.textContent = `${Math.round(burnedPercent)}%`;
    }

    function renderMacros(totalProtein, totalCarbs, totalFat) {
        const macros = { protein: totalProtein, carbs: totalCarbs, fat: totalFat };
        dom.macroSummary.innerHTML = '';
        for (const macro in state.budgets.macroBudgets) {
            const budget = state.budgets.macroBudgets[macro];
            const total = macros[macro];
            const progress = budget > 0 ? (total / budget) * 100 : 0;
            
            const macroEl = document.createElement('div');
            macroEl.className = 'macro-item';
            macroEl.innerHTML = `
                <div class="macro-info">
                    <span style="text-transform: capitalize;">${macro}</span>
                    <span class="${total > budget ? 'danger-text' : ''}">${total}g / ${budget}g</span>
                </div>
                <div class="progress-bar">
                    <div class="${progress > 100 ? 'over' : ''}" style="width: ${Math.min(progress, 100)}%;"></div>
                </div>
            `;
            dom.macroSummary.appendChild(macroEl);
        }
    }

    function renderMeals() {
        for (const mealType in state.dailyMeals) {
            const mealListEl = document.getElementById(`${mealType}-list`);
            const mealFoods = state.dailyMeals[mealType];
            let mealTotalCals = 0;
            
            mealListEl.innerHTML = ''; // Clear previous items
            mealFoods.forEach(food => {
                mealTotalCals += food.calories;
                const foodEl = document.createElement('div');
                foodEl.className = 'food-item';
                foodEl.innerHTML = `
                    <div>
                        <p class="name">${food.name}</p>
                        <p class="macros">P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="calories">${food.calories} cal</span>
                        <button class="remove-food-btn" data-id="${food.id}" data-meal="${mealType}">&#x2715;</button>
                    </div>
                `;
                mealListEl.appendChild(foodEl);
            });

            // Update meal summary
            const budget = state.budgets.mealBudgets[mealType];
            document.getElementById(`${mealType}-cals`).textContent = `${mealTotalCals}/${budget} cal`;
            const progressEl = document.getElementById(`${mealType}-progress`);
            const progress = budget > 0 ? (mealTotalCals / budget) * 100 : 0;
            progressEl.style.width = `${Math.min(progress, 100)}%`;
            progressEl.classList.toggle('over', progress > 100);
        }
    }
    
    function renderBudgets() {
        dom.budgetInputs.totalCalorieBudget.value = state.budgets.totalCalorieBudget;
        dom.budgetInputs.tdee.value = state.budgets.tdee;
        dom.budgetInputs.burnGoal.value = state.budgets.burnGoal;

        for (const meal in state.budgets.mealBudgets) {
            dom.budgetInputs[meal].value = state.budgets.mealBudgets[meal];
        }
        for (const macro in state.budgets.macroBudgets) {
            dom.budgetInputs[macro].value = state.budgets.macroBudgets[macro];
        }
    }

    // --- EVENT HANDLERS ---
    
    function switchTab(tab) {
        state.activeTab = tab;
        dom.logView.classList.toggle('hidden', tab !== 'log');
        dom.budgetView.classList.toggle('hidden', tab !== 'budget');
        dom.logTabBtn.classList.toggle('active', tab === 'log');
        dom.budgetTabBtn.classList.toggle('active', tab === 'budget');
    }

    function handleAddFood(e) {
        e.preventDefault();
        const food = {
            id: Date.now(),
            name: dom.foodNameInput.value,
            calories: parseInt(dom.foodCaloriesInput.value) || 0,
            protein: parseInt(dom.foodProteinInput.value) || 0,
            carbs: parseInt(dom.foodCarbsInput.value) || 0,
            fat: parseInt(dom.foodFatInput.value) || 0,
        };
        const mealType = dom.foodMealSelect.value;
        state.dailyMeals[mealType].push(food);
        dom.addFoodForm.reset();
        render();
    }
    
    function handleRemoveFood(e) {
        if (e.target.classList.contains('remove-food-btn')) {
            const foodId = parseInt(e.target.dataset.id);
            const mealType = e.target.dataset.meal;
            state.dailyMeals[mealType] = state.dailyMeals[mealType].filter(food => food.id !== foodId);
            render();
        }
    }

    function handleToggleBudgetEdit(isEditing) {
        dom.editBudgetBtn.classList.toggle('hidden', isEditing);
        dom.saveBudgetBtn.classList.toggle('hidden', !isEditing);
        dom.cancelBudgetBtn.classList.toggle('hidden', !isEditing);
        
        const fieldsets = dom.budgetForm.querySelectorAll('fieldset');
        fieldsets.forEach(fs => fs.disabled = !isEditing);
    }
    
    function handleSaveBudgets() {
        state.budgets.totalCalorieBudget = parseInt(dom.budgetInputs.totalCalorieBudget.value);
        state.budgets.tdee = parseInt(dom.budgetInputs.tdee.value);
        state.budgets.burnGoal = parseInt(dom.budgetInputs.burnGoal.value);

        for (const meal in state.budgets.mealBudgets) {
            state.budgets.mealBudgets[meal] = parseInt(dom.budgetInputs[meal].value);
        }
        for (const macro in state.budgets.macroBudgets) {
            state.budgets.macroBudgets[macro] = parseInt(dom.budgetInputs[macro].value);
        }
        
        handleToggleBudgetEdit(false);
        render();
    }

    // --- INITIALIZATION ---

    function init() {
        // Setup Event Listeners
        dom.logTabBtn.addEventListener('click', () => switchTab('log'));
        dom.budgetTabBtn.addEventListener('click', () => switchTab('budget'));
        dom.addFoodForm.addEventListener('submit', handleAddFood);
        dom.logView.addEventListener('click', handleRemoveFood); // Event delegation for remove buttons
        dom.totalBurnedInput.addEventListener('change', (e) => {
            state.totalBurned = parseInt(e.target.value) || 0;
            render();
        });
        
        // Budget page listeners
        dom.editBudgetBtn.addEventListener('click', () => handleToggleBudgetEdit(true));
        dom.cancelBudgetBtn.addEventListener('click', () => {
            handleToggleBudgetEdit(false);
            renderBudgets(); // Reset form to original state values
        });
        dom.saveBudgetBtn.addEventListener('click', handleSaveBudgets);
        
        // Initial Render
        render();
    }
    
    init();
});