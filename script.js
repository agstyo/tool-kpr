function toggleRateOptions() {
    const rateType = document.getElementById('rateType').value;
    document.querySelectorAll('.rate-option').forEach(opt => opt.classList.add('hidden'));
    document.getElementById(`${rateType}Options`).classList.remove('hidden');
}

function calculateMonthlyPayment(principal, annualRate, months) {
    const monthlyRate = annualRate / 12 / 100;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
           (Math.pow(1 + monthlyRate, months) - 1);
}

function formatRupiah(number) {
    return 'Rp ' + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function addPartialPayment() {
    const partialList = document.getElementById('partialList');
    const div = document.createElement('div');
    div.className = 'partial-payment';
    div.innerHTML = `
        <label>Bulan Pelunasan Sebagian</label>
        <input type="number" class="partial-month" placeholder="Contoh: 12">
        <label>Jumlah Pelunasan Sebagian (Rp)</label>
        <input type="number" class="partial-amount" placeholder="Contoh: 30000000">
        <label>Setelah Pelunasan Sebagian</label>
        <select class="partial-option">
            <option value="sameTenor">Tetap Tenor (Kurangi Angsuran)</option>
            <option value="reduceTenor">Kurangi Tenor</option>
        </select>
        <button class="remove-btn" onclick="this.parentElement.remove()">Hapus</button>
    `;
    partialList.appendChild(div);
}

function getPartialPayments() {
    const partialPayments = [];
    document.querySelectorAll('.partial-payment').forEach(div => {
        const month = parseInt(div.querySelector('.partial-month').value) || 0;
        const amount = parseFloat(div.querySelector('.partial-amount').value) || 0;
        const option = div.querySelector('.partial-option').value;
        if (month > 0 && amount > 0) {
            partialPayments.push({ month, amount, option });
        }
    });
    return partialPayments.sort((a, b) => a.month - b.month);
}

function generateAmortizationTable(principal, monthlyPayment, annualRate, months, partialPayments = []) {
    let table = '<table><tr><th>Bulan</th><th>Sisa Pokok</th><th>Angsuran Pokok</th><th>Angsuran Bunga</th><th>Total Angsuran</th></tr>';
    let remainingPrincipal = principal;
    const monthlyRate = annualRate / 12 / 100;
    let newMonthlyPayment = monthlyPayment;
    let remainingMonths = months;
    let totalPaid = 0;

    for (let i = 1; i <= months && remainingPrincipal > 0; i++) {
        let interestPayment = remainingPrincipal * monthlyRate;
        let principalPayment = newMonthlyPayment - interestPayment;

        const partial = partialPayments.find(p => p.month === i);
        if (partial) {
            // Hitung sisa pokok sebelum pelunasan
            remainingPrincipal -= principalPayment;
            // Lakukan pelunasan sebagian
            remainingPrincipal -= partial.amount;
            if (remainingPrincipal < 0) remainingPrincipal = 0;

            if (partial.option === 'reduceTenor') {
                remainingMonths = months - i;
                newMonthlyPayment = calculateMonthlyPayment(remainingPrincipal, annualRate, remainingMonths);
            } else {
                newMonthlyPayment = calculateMonthlyPayment(remainingPrincipal, annualRate, months - i);
            }

            table += `
                <tr>
                    <td>${i} (Pelunasan Sebagian)</td>
                    <td>${formatRupiah(remainingPrincipal)}</td>
                    <td>${formatRupiah(principalPayment + partial.amount)}</td>
                    <td>${formatRupiah(interestPayment)}</td>
                    <td>${formatRupiah(newMonthlyPayment + partial.amount)}</td>
                </tr>
            `;
            totalPaid += newMonthlyPayment + partial.amount;
            continue;
        }

        remainingPrincipal -= principalPayment;
        if (remainingPrincipal < 0) remainingPrincipal = 0;

        table += `
            <tr>
                <td>${i}</td>
                <td>${formatRupiah(remainingPrincipal)}</td>
                <td>${formatRupiah(principalPayment)}</td>
                <td>${formatRupiah(interestPayment)}</td>
                <td>${formatRupiah(newMonthlyPayment)}</td>
            </tr>
        `;
        totalPaid += newMonthlyPayment;
    }
    table += '</table>';
    return { table, totalPaid };
}

function calculate() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const tenor = parseInt(document.getElementById('tenor').value);
    const rateType = document.getElementById('rateType').value;
    const partialPayments = getPartialPayments();
    const totalMonths = tenor * 12;
    let result = '';
    let totalInterest = 0;

    if (rateType === 'combined') {
        const fixedYears = parseInt(document.getElementById('fixedYears').value);
        const fixedRate = parseFloat(document.getElementById('combinedFixedRate').value);
        const floatingRate = parseFloat(document.getElementById('combinedFloatingRate').value);
        const fixedMonths = fixedYears * 12;
        let table = '<table><tr><th>Bulan</th><th>Sisa Pokok</th><th>Angsuran Pokok</th><th>Angsuran Bunga</th><th>Total Angsuran</th></tr>';
        let remainingPrincipal = loanAmount;
        let newMonthlyPayment;
        let totalPaid = 0;
        const monthlyRateFixed = fixedRate / 12 / 100;
        const monthlyRateFloating = floatingRate / 12 / 100;

        const fixedPayment = calculateMonthlyPayment(loanAmount, fixedRate, totalMonths);
        for (let i = 1; i <= fixedMonths && remainingPrincipal > 0; i++) {
            let interestPayment = remainingPrincipal * monthlyRateFixed;
            let principalPayment = fixedPayment - interestPayment;

            const partial = partialPayments.find(p => p.month === i);
            if (partial) {
                remainingPrincipal -= principalPayment;
                remainingPrincipal -= partial.amount;
                if (remainingPrincipal < 0) remainingPrincipal = 0;
                if (partial.option === 'reduceTenor') {
                    const remainingTotalMonths = totalMonths - i;
                    newMonthlyPayment = calculateMonthlyPayment(remainingPrincipal, fixedRate, remainingTotalMonths);
                } else {
                    newMonthlyPayment = calculateMonthlyPayment(remainingPrincipal, fixedRate, totalMonths - i);
                }
                table += `
                    <tr>
                        <td>${i} (Pelunasan Sebagian)</td>
                        <td>${formatRupiah(remainingPrincipal)}</td>
                        <td>${formatRupiah(principalPayment + partial.amount)}</td>
                        <td>${formatRupiah(interestPayment)}</td>
                        <td>${formatRupiah(newMonthlyPayment + partial.amount)}</td>
                    </tr>
                `;
                totalPaid += newMonthlyPayment + partial.amount;
                continue;
            }

            remainingPrincipal -= principalPayment;
            table += `
                <tr>
                    <td>${i}</td>
                    <td>${formatRupiah(remainingPrincipal)}</td>
                    <td>${formatRupiah(principalPayment)}</td>
                    <td>${formatRupiah(interestPayment)}</td>
                    <td>${formatRupiah(fixedPayment)}</td>
                </tr>
            `;
            totalPaid += fixedPayment;
        }

        let floatingPayment = newMonthlyPayment || calculateMonthlyPayment(remainingPrincipal, floatingRate, totalMonths - fixedMonths);
        for (let i = fixedMonths + 1; i <= totalMonths && remainingPrincipal > 0; i++) {
            let interestPayment = remainingPrincipal * monthlyRateFloating;
            let principalPayment = floatingPayment - interestPayment;

            const partial = partialPayments.find(p => p.month === i);
            if (partial) {
                remainingPrincipal -= principalPayment;
                remainingPrincipal -= partial.amount;
                if (remainingPrincipal < 0) remainingPrincipal = 0;
                if (partial.option === 'reduceTenor') {
                    const remainingTotalMonths = totalMonths - i;
                    floatingPayment = calculateMonthlyPayment(remainingPrincipal, floatingRate, remainingTotalMonths);
                } else {
                    floatingPayment = calculateMonthlyPayment(remainingPrincipal, floatingRate, totalMonths - i);
                }
                table += `
                    <tr>
                        <td>${i} (Pelunasan Sebagian)</td>
                        <td>${formatRupiah(remainingPrincipal)}</td>
                        <td>${formatRupiah(principalPayment + partial.amount)}</td>
                        <td>${formatRupiah(interestPayment)}</td>
                        <td>${formatRupiah(floatingPayment + partial.amount)}</td>
                    </tr>
                `;
                totalPaid += floatingPayment + partial.amount;
                continue;
            }

            remainingPrincipal -= principalPayment;
            if (remainingPrincipal < 0) remainingPrincipal = 0;
            table += `
                <tr>
                    <td>${i}</td>
                    <td>${formatRupiah(remainingPrincipal)}</td>
                    <td>${formatRupiah(principalPayment)}</td>
                    <td>${formatRupiah(interestPayment)}</td>
                    <td>${formatRupiah(floatingPayment)}</td>
                </tr>
            `;
            totalPaid += floatingPayment;
        }
        table += '</table>';

        totalInterest = totalPaid - loanAmount;

        result = `
            <h3>Hasil Simulasi KPR Combined</h3>
            <p>Jumlah Pinjaman: ${formatRupiah(loanAmount)}</p>
            <p>Tenor Awal: ${tenor} tahun (${totalMonths} bulan)</p>
            <p>Fixed (${fixedYears} tahun): ${fixedRate}% - ${formatRupiah(fixedPayment)}/bulan</p>
            <p>Floating (${tenor - fixedYears} tahun): ${floatingRate}% - ${formatRupiah(floatingPayment)}/bulan</p>
            ${partialPayments.map(p => `<p>Pelunasan Sebagian (Bulan ${p.month}): ${formatRupiah(p.amount)} - ${p.option === 'sameTenor' ? 'Tetap Tenor' : 'Kurangi Tenor'}</p>`).join('')}
            <p>Total Bunga: ${formatRupiah(totalInterest)}</p>
            <p>Total Pembayaran: ${formatRupiah(loanAmount + totalInterest)}</p>
            <div class="toggle-table" onclick="document.getElementById('combinedTable').classList.toggle('hidden')">Lihat Tabel Amortization</div>
            <div id="combinedTable" class="hidden">${table}</div>
        `;
    }
    // ... (kode untuk fixed, floating, dan tiered tetap sama)

    document.getElementById('result').innerHTML = result;
}

function resetForm() {
    document.getElementById('loanAmount').value = '';
    document.getElementById('tenor').value = '';
    document.getElementById('rateType').value = 'fixed';
    document.getElementById('fixedRate').value = '';
    document.getElementById('floatingRate').value = '';
    document.getElementById('fixedYears').value = '';
    document.getElementById('combinedFixedRate').value = '';
    document.getElementById('combinedFloatingRate').value = '';
    document.getElementById('tier1Years').value = '';
    document.getElementById('tier1Rate').value = '';
    document.getElementById('tier2Years').value = '';
    document.getElementById('tier2Rate').value = '';
    document.getElementById('partialList').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    toggleRateOptions();
}