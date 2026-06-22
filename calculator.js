// Calculator logic for Print-Master
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const gotoContactBtn = document.getElementById('gotoContactBtn');
    const resultDiv = document.getElementById('result');

    // Function to show calculate button
    function showCalculateBtn() {
        calculateBtn.style.display = 'block';
        gotoContactBtn.style.display = 'none';
        resultDiv.textContent = '';
    }

    // Initially show calculate button
    showCalculateBtn();

    // Add generic listeners to inputs/selects to show button on change/input
    document.querySelectorAll('#priceCalculator input, #priceCalculator select').forEach(el => {
        el.addEventListener('change', showCalculateBtn);
        el.addEventListener('input', showCalculateBtn);
    });

    // Add listeners for checkbox buttons styling (will work whether checkboxes are enabled or disabled)
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.parentElement;
        checkbox.addEventListener('change', function() {
            label.classList.toggle('checked', this.checked);
        });
        label.classList.toggle('checked', checkbox.checked);
    });

    // Pricing rates (in rubles) per category
    const rates = {
        business: { base: 5, foil: 2, uv: 3, lamination: 1, cutting: 1.5, urgent: 5 }, // Визитки
        leaflet: { base: 6, foil: 0, uv: 2, lamination: 1, cutting: 1, urgent: 6 }, // Листовки
        brochure: { base: 9, foil: 3, uv: 4, lamination: 2, cutting: 2.5, urgent: 9 }, // Буклеты
        catalog: { base: 12, foil: 4, uv: 5, lamination: 3, cutting: 3.5, urgent: 12 }, // Каталоги
        calendar: { base: 14, foil: 3, uv: 5, lamination: 3, cutting: 2.5, urgent: 10 },
        packaging: { base: 20, foil: 6, uv: 8, lamination: 5, cutting: 6, urgent: 15 },
        poster: { base: 18, foil: 0, uv: 6, lamination: 4, cutting: 0, urgent: 14 },
        stickers: { base: 4, foil: 0, uv: 0, lamination: 1.5, cutting: 1.5, urgent: 6 },
        flyer: { base: 6, foil: 0, uv: 2, lamination: 1, cutting: 1, urgent: 6 },
        booklet: { base: 11, foil: 3, uv: 4, lamination: 2.5, cutting: 3, urgent: 11 },
        postcard: { base: 7, foil: 2, uv: 3, lamination: 2, cutting: 0.5, urgent: 8 },
        certificate: { base: 10, foil: 3, uv: 3, lamination: 2.5, cutting: 1, urgent: 9 },
        forms: { base: 5, foil: 0, uv: 0, lamination: 0, cutting: 0, urgent: 5 },
        envelope: { base: 6, foil: 0, uv: 0, lamination: 0, cutting: 0.5, urgent: 6 },
        folder: { base: 12, foil: 4, uv: 3, lamination: 3, cutting: 2, urgent: 12 },
        banner: { base: 3000, foil: 0, uv: 0, lamination: 0, cutting: 10, urgent: 25 }
    };

    // Format multipliers for common sizes
    const formatMultipliers = {
        '90x50': 1,
        '105x148': 1.05, // A6
        '148x210': 1.2,  // A5
        '210x297': 1.5,  // A4
        '297x420': 2.0,  // A3
        '420x594': 2.5,  // A2
        '594x841': 3.2,  // A1
        '841x1189': 4.0, // A0
        'custom': 2
    };

    // Paper multipliers
    const paperMultipliers = {
        'standard': 1,
        'glossy': 1.1,
        'matte': 1.05,
        'designer': 1.2
    };

    // Color multipliers
    const colorMultipliers = {
        'bw': 1,
        'color': 1.5
    };

    // Product definitions: available formats, whether pages are applicable, allowed papers and extras
    const products = {
        business: { label: 'Визитки', formats: ['90x50'], pages: false, papers: ['standard','glossy','matte','designer'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: true } },
        leaflet: { label: 'Листовки', formats: ['105x148','148x210','210x297','custom'], pages: false, papers: ['standard','glossy','matte'], extras: { urgent: true, foil: false, uv: true, lamination: true, cutting: false } },
        brochure: { label: 'Буклеты', formats: ['148x210','210x297'], pages: true, papers: ['standard','glossy','matte','designer'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: false } },
        catalog: { label: 'Каталоги', formats: ['210x297','297x420'], pages: true, papers: ['standard','glossy','matte','designer'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: false } },
        calendar: { label: 'Календари', formats: ['210x297','297x420','custom'], pages: true, papers: ['glossy','matte','designer'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: false } },
        packaging: { label: 'Упаковка', formats: ['custom'], pages: false, papers: ['designer','standard'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: true } },
        poster: { label: 'Плакаты', formats: ['420x594','594x841','841x1189','custom'], pages: false, papers: ['standard','glossy'], extras: { urgent: true, foil: false, uv: true, lamination: true, cutting: false } },
        stickers: { label: 'Наклейки', formats: ['custom'], pages: false, papers: ['standard'], extras: { urgent: true, foil: false, uv: false, lamination: true, cutting: true } },
        flyer: { label: 'Флаеры', formats: ['105x148','148x210','210x297'], pages: false, papers: ['standard','glossy'], extras: { urgent: true, foil: false, uv: true, lamination: true, cutting: false } },
        booklet: { label: 'Брошюры', formats: ['148x210','210x297'], pages: true, papers: ['standard','glossy','matte','designer'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: false } },
        postcard: { label: 'Открытки', formats: ['90x50','105x148','148x210'], pages: false, papers: ['standard','glossy','designer'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: true } },
        certificate: { label: 'Сертификаты', formats: ['210x297','148x210'], pages: false, papers: ['designer','glossy'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: false } },
        forms: { label: 'Бланки', formats: ['210x297'], pages: false, papers: ['standard'], extras: { urgent: true, foil: false, uv: false, lamination: true, cutting: false } },
        envelope: { label: 'Конверты', formats: ['custom'], pages: false, papers: ['standard','designer'], extras: { urgent: true, foil: false, uv: false, lamination: true, cutting: true } },
        folder: { label: 'Папки', formats: ['210x297','297x420'], pages: false, papers: ['designer','standard'], extras: { urgent: true, foil: true, uv: true, lamination: true, cutting: true } },
        banner: { label: 'Баннеры', formats: ['custom'], pages: false, papers: ['standard'], extras: { urgent: true, foil: false, uv: false, lamination: false, cutting: false } }
    };

    // Maximum allowed quantity per product type (clamped)
    const maxQuantities = {
        business: 10000,
        leaflet: 100000,
        brochure: 50000,
        catalog: 20000,
        calendar: 20000,
        packaging: 20000,
        poster: 10000,
        stickers: 200000,
        flyer: 100000,
        booklet: 50000,
        postcard: 30000,
        certificate: 10000,
        forms: 50000,
        envelope: 50000,
        folder: 10000,
        banner: 500
    };

    // Helper to populate category select from products
    const categorySelect = document.getElementById('category');
    function populateCategories() {
        categorySelect.innerHTML = '<option value="">Выберите...</option>' + Object.keys(products).map(k => `<option value="${k}">${products[k].label}</option>`).join('');
    }
    populateCategories();

    // Helper to update UI controls based on selected product
    function updateParamsForCategory(catKey) {
        const formatSelect = document.getElementById('format');
        const paperSelect = document.getElementById('paper');
        const pagesGroup = document.getElementById('pages') ? document.getElementById('pages').closest('.form-group') : null;
        const quantityInput = document.getElementById('quantity');
        const pagesInput = document.getElementById('pages');

        if (!catKey || !products[catKey]) {
            // reset to defaults
            if (pagesGroup) {
                pagesGroup.style.display = '';
                if (pagesInput) {
                    pagesInput.disabled = false;
                    pagesInput.required = true;
                }
            }
            Array.from(paperSelect.options).forEach(o => o.disabled = false);
            document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.disabled = false);
            if (quantityInput) {
                quantityInput.min = 1;
                quantityInput.max = '';
            }
            // clear modifiers list until a category is selected; urgent remains available
            const modifiersContainer = document.getElementById('modifiers');
            if (modifiersContainer) modifiersContainer.innerHTML = '';
            const urgentCb = document.getElementById('urgent');
            if (urgentCb) {
                urgentCb.disabled = false;
                urgentCb.checked = false;
                urgentCb.parentElement.classList.remove('checked');
            }
            return;
        }

        const def = products[catKey];

        // Populate formats
        formatSelect.innerHTML = '<option value="">Выберите...</option>' + def.formats.map(f => `<option value="${f}">${formatLabel(f)}</option>`).join('');

        // Populate paper options (disable others)
        const allowedPapers = new Set(def.papers);
        paperSelect.innerHTML = Object.keys(paperMultipliers).map(p => `<option value="${p}" ${allowedPapers.has(p) ? '' : 'disabled'}>${paperLabel(p)}</option>`).join('');

        // Show/hide pages
        if (pagesGroup) {
            pagesGroup.style.display = def.pages ? '' : 'none';
            if (pagesInput) {
                pagesInput.disabled = !def.pages;
                pagesInput.required = !!def.pages;
                if (!def.pages) pagesInput.value = 1;
                // clamp pages when enabled
                if (def.pages) {
                    pagesInput.min = 1;
                    pagesInput.max = 500;
                    if (parseInt(pagesInput.value) < 1) pagesInput.value = 1;
                    if (parseInt(pagesInput.value) > 500) pagesInput.value = 500;
                } else {
                    pagesInput.removeAttribute('max');
                }
            }
        }

        // Populate modifiers multiselect based on product extras (exclude urgent)
        const modifiersContainer = document.getElementById('modifiers');
        if (modifiersContainer) {
            // Define available modifier options (multiselect): lamination, uv, foil, cutting
            const allMods = [
                { id: 'lamination', label: 'Ламинация' },
                { id: 'uv', label: 'UV-лак' },
                { id: 'foil', label: 'Фольга' },
                { id: 'cutting', label: 'Высечка' }
            ];
            // Clear container and recreate only allowed modifiers
            modifiersContainer.innerHTML = '';
            allMods.forEach(m => {
                if (def.extras && def.extras[m.id]) {
                    const group = document.createElement('div');
                    group.className = 'form-group checkbox-group';
                    const label = document.createElement('label');
                    label.className = 'checkbox-btn';
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.name = 'modifier';
                    input.value = m.id;
                    input.id = m.id;
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(' ' + m.label));
                    group.appendChild(label);
                    modifiersContainer.appendChild(group);
                    // wire styling toggle
                    input.addEventListener('change', function() { label.classList.toggle('checked', this.checked); showCalculateBtn(); });
                }
            });
        }

        // Set quantity min/max attributes and clamp current value
        if (quantityInput) {
            const maxQ = maxQuantities[catKey] || '';
            quantityInput.min = 1;
            if (maxQ) quantityInput.max = maxQ;
            else quantityInput.removeAttribute('max');
            // clamp current value
            let qv = parseInt(quantityInput.value) || 1;
            if (qv < 1) qv = 1;
            if (maxQ && qv > maxQ) qv = maxQ;
            quantityInput.value = qv;
        }
    }

    function formatLabel(code) {
        if (code === 'custom') return 'Другой';
        return code.replace('x','×') + ' мм';
    }

    function paperLabel(key) {
        switch(key) {
            case 'standard': return 'Обычная';
            case 'glossy': return 'Глянцевая (+10%)';
            case 'matte': return 'Матовая (+5%)';
            case 'designer': return 'Дизайнерская (+20%)';
            default: return key;
        }
    }

    // Wire category change to update parameters
    categorySelect.addEventListener('change', function() {
        updateParamsForCategory(this.value);
    });

    // Initialize UI based on default (empty)
    updateParamsForCategory(categorySelect.value);

    // Clamp helpers and input listeners
    const quantityInput = document.getElementById('quantity');
    const pagesInput = document.getElementById('pages');

    function clampQuantityForCurrentCategory() {
        const cat = categorySelect.value;
        const maxQ = maxQuantities[cat];
        if (!quantityInput) return;
        let v = parseInt(quantityInput.value) || 1;
        if (v < 1) v = 1;
        if (maxQ && v > maxQ) v = maxQ;
        quantityInput.value = v;
    }

    function clampPagesIfNeeded() {
        const cat = categorySelect.value;
        const prod = products[cat];
        if (!pagesInput) return;
        if (!prod || !prod.pages) {
            pagesInput.value = 1;
            return;
        }
        let v = parseInt(pagesInput.value) || 1;
        if (v < 1) v = 1;
        if (v > 500) v = 500;
        pagesInput.value = v;
    }

    if (quantityInput) {
        quantityInput.addEventListener('input', clampQuantityForCurrentCategory);
        quantityInput.addEventListener('blur', clampQuantityForCurrentCategory);
    }
    if (pagesInput) {
        pagesInput.addEventListener('input', clampPagesIfNeeded);
        pagesInput.addEventListener('blur', clampPagesIfNeeded);
    }

    calculateBtn.addEventListener('click', function() {
        // Ensure inputs are clamped to allowed ranges before calculation
        clampQuantityForCurrentCategory();
        clampPagesIfNeeded();
        const category = document.getElementById('category').value;
        const format = document.getElementById('format').value;
        const paper = document.getElementById('paper').value;
        const color = document.getElementById('color').value;
        const pages = parseInt(document.getElementById('pages').value) || 1;
        const quantity = parseInt(document.getElementById('quantity').value) || 100;
        // Read selected modifiers from dynamic multiselect
        const selectedMods = Array.from(document.querySelectorAll('#modifiers input[name="modifier"]:checked')).map(i => i.value);
        const foil = selectedMods.includes('foil');
        const uv = selectedMods.includes('uv');
        const lamination = selectedMods.includes('lamination');
        const cutting = selectedMods.includes('cutting');
        // Urgent is a separate independent checkbox, always available
        const urgent = document.getElementById('urgent') ? document.getElementById('urgent').checked : false;

        if (!category) {
            resultDiv.textContent = 'Пожалуйста, выберите категорию продукции.';
            return;
        }
        if (!format) {
            resultDiv.textContent = 'Пожалуйста, выберите формат.';
            return;
        }

        let total = 0;

        // Base price per unit (fall back to generic if not defined)
        const rate = rates[category] || { base: 10, foil: 2, uv: 3, lamination: 1, cutting: 1.5, urgent: 5 };
        let basePrice = rate.base;

        // Apply multipliers (use mapping or fallback)
        const fmtMul = formatMultipliers[format] || (format === 'custom' ? formatMultipliers['custom'] : 1.5);
        basePrice *= fmtMul;
        basePrice *= (paperMultipliers[paper] || 1);
        basePrice *= (colorMultipliers[color] || 1);

        // Multiply by pages if product supports pages
        const prodDef = products[category];
        const effectivePages = (prodDef && prodDef.pages) ? pages : 1;
        basePrice *= effectivePages;

        // Total for quantity
        total = basePrice * quantity;

        // Add extras only when allowed for product
        if (foil && prodDef && prodDef.extras.foil) {
            total += (rate.foil || 0) * quantity;
        }
        if (uv && prodDef && prodDef.extras.uv) {
            total += (rate.uv || 0) * quantity;
        }
        if (lamination && prodDef && prodDef.extras.lamination) {
            total += (rate.lamination || 0) * quantity;
        }
        if (cutting && prodDef && prodDef.extras.cutting) {
            total += (rate.cutting || 0) * quantity;
        }
        if (urgent) {
            total += (rate.urgent || 0) * quantity;
        }

        // Display result
        resultDiv.textContent = `Общая стоимость: ${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб.`;

        // Hide calculate button and show contact button
        calculateBtn.style.display = 'none';
        gotoContactBtn.style.display = 'block';
    });

    gotoContactBtn.addEventListener('click', function() {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
});