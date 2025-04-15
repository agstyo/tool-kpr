document.getElementById('interestType').addEventListener('change', function () {
    const floatingRateLabel = document.getElementById('floatingRateLabel');
    if (this.value === 'combine') {
      floatingRateLabel.style.display = 'block';
    } else {
      floatingRateLabel.style.display = 'none';
    }
  });
  
  let repaymentIndex = 0;
  
  function addPartialRepayment() {
    const container = document.getElementById('partialRepayments');
    const div = document.createElement('div');
    div.classList.add('repayment-block');
    div.innerHTML = `
      <label>Bulan Pelunasan Sebagian
        <input type="number" name="repaymentMonth_${repaymentIndex}" required />
      </label>
  
      <label>Jumlah Pelunasan Sebagian (Rp)
        <input type="number" name="repaymentAmount_${repaymentIndex}" required />
      </label>
  
      <label>Aksi Setelah Pelunasan
        <select name="repaymentAction_${repaymentIndex}" onchange="toggleReduceTenor(this, ${repaymentIndex})">
          <option value="keep">Tenor Tetap</option>
          <option value="reduce">Kurangi Tenor</option>
        </select>
      </label>
  
      <div id="reduceTenor_${repaymentIndex}" style="display:none;">
        <label>Kurangi Tenor (tahun)
          <input type="number" name="reduceYears_${repaymentIndex}" />
        </label>
      </div>
      <hr/>
    `;
    container.appendChild(div);
    repaymentIndex++;
  }
  
  function toggleReduceTenor(selectElem, index) {
    const reduceDiv = document.getElementById(`reduceTenor_${index}`);
    if (selectElem.value === 'reduce') {
      reduceDiv.style.display = 'block';
    } else {
      reduceDiv.style.display = 'none';
    }
  }
  
  function resetForm() {
    document.getElementById('partialRepayments').innerHTML = '';
    document.getElementById('floatingRateLabel').style.display = 'none';
    repaymentIndex = 0;
    document.getElementById('result').innerHTML = '';
  }
  
  function calculateKPR() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const tenorYears = parseInt(document.getElementById('loanTenor').value);
    const interestType = document.getElementById('interestType').value;
    const fixedYears = parseInt(document.getElementById('fixedYears').value);
    const fixedRate = parseFloat(document.getElementById('fixedRate').value);
    const floatingRate = parseFloat(document.getElementById('floatingRate').value || 0);
  
    const repayments = [];
    for (let i = 0; i < repaymentIndex; i++) {
      const month = parseInt(document.querySelector(`[name=repaymentMonth_${i}]`).value);
      const value = parseFloat(document.querySelector(`[name=repaymentAmount_${i}]`).value);
      const action = document.querySelector(`[name=repaymentAction_${i}]`).value;
      const reduceYearsElem = document.querySelector(`[name=reduceYears_${i}]`);
      const reduceYears = reduceYearsElem ? parseInt(reduceYearsElem.value || "0") : 0;
  
      repayments.push({
        month,
        value,
        action,
        reduceYears
      });
    }
  
    const totalMonths = tenorYears * 12;
    const fixedMonths = fixedYears * 12;
    let remainingPrincipal = amount;
    let currentTenorMonths = totalMonths;
  
    const schedule = [];
  
    for (let month = 1; month <= currentTenorMonths; month++) {
      // cek apakah ada pelunasan sebagian di bulan ini
      const repayment = repayments.find(r => r.month === month);
      if (repayment) {
        remainingPrincipal -= repayment.value;
        if (repayment.action === 'reduce') {
          currentTenorMonths -= repayment.reduceYears * 12;
        }
      }
  
      const rate = month <= fixedMonths ? fixedRate : floatingRate;
      const monthlyRate = rate / 12 / 100;
  
      const annuity = monthlyRate === 0
        ? remainingPrincipal / (currentTenorMonths - month + 1)
        : remainingPrincipal * (monthlyRate) / (1 - Math.pow(1 + monthlyRate, -(currentTenorMonths - month + 1)));
  
      const interest = remainingPrincipal * monthlyRate;
      const principal = annuity - interest;
      remainingPrincipal -= principal;
  
      schedule.push({
        month,
        rate: rate, // Tambahan suku bunga
        interest: Math.round(interest),
        principal: Math.round(principal),
        total: Math.round(annuity),
        remaining: Math.max(0, Math.round(remainingPrincipal)),
        note: repayment ? `Pelunasan sebagian: Rp ${repayment.value.toLocaleString()}` : ""
      });
  
      if (remainingPrincipal <= 0) break;
    }
  
    // OUTPUT
    let result = `<h2>Hasil Simulasi</h2>`;
    result += `<p>Jumlah Pinjaman: Rp ${amount.toLocaleString()}</p>`;
    result += `<p>Tenor: ${tenorYears} tahun</p>`;
    result += `<p>Suku Bunga Fixed: ${fixedRate}% selama ${fixedYears} tahun</p>`;
    if (interestType === 'combine') {
      result += `<p>Suku Bunga Floating: ${floatingRate}% setelah ${fixedYears} tahun</p>`;
    }

    // Tambahkan ini:
    const totalCicilan = schedule.reduce((sum, row) => sum + row.total, 0);
    const totalRepayment = repayments.reduce((sum, r) => sum + r.value, 0);
    const totalPaid = totalCicilan + totalRepayment;
    result += `<p><strong>Total Cicilan Bulanan:</strong> Rp ${totalCicilan.toLocaleString()}</p>`;
    result += `<p><strong>Total Pelunasan Sebagian:</strong> Rp ${totalRepayment.toLocaleString()}</p>`;
    result += `<p><strong>Total Biaya Keseluruhan:</strong> Rp ${totalPaid.toLocaleString()}</p>`;
  
    if (repayments.length > 0) {
        result += `<h3>Pelunasan Sebagian:</h3>`;
        repayments.forEach((r, i) => {
          result += `<p>-${i + 1}. Bulan ke-${r.month}, Jumlah: Rp ${r.value.toLocaleString()}, Aksi: ${r.action}`;
          if (r.action === 'reduce') {
            result += `, Kurangi Tenor: ${r.reduceYears} tahun`;
          }
          result += `</p>`;
      
          // Cari data dari schedule
          const sched = schedule.find(s => s.month === r.month);
          if (sched) {
            result += `<ul style="margin-top:-10px;margin-bottom:10px;">
              <li>Sisa Pinjaman: Rp ${sched.remaining.toLocaleString()}</li>
              <li>Total Cicilan Bulanan: Rp ${sched.total.toLocaleString()}</li>
            </ul>`;
          }
        });
     }
      
  
    document.getElementById('result').innerHTML = result;
  
    // Generate table
    let tableHTML = `<h3>Tabel Amortisasi</h3><table border="1" cellspacing="0" cellpadding="5"><tr>
      <th>Bulan</th><th>Suku Bunga</th><th>Pokok</th><th>Bunga</th><th>Total Cicilan</th><th>Sisa Pinjaman</th><th>Catatan</th>
</tr>`;
    schedule.forEach(row => {
      tableHTML += `<tr>
        <td>${row.month}</td>
        <td>${row.rate.toFixed(2)}%</td>
        <td>Rp ${row.principal.toLocaleString()}</td>
        <td>Rp ${row.interest.toLocaleString()}</td>
        <td>Rp ${row.total.toLocaleString()}</td>
        <td>Rp ${row.remaining.toLocaleString()}</td>
        <td>${row.note}</td>
      </tr>`;
    });
    tableHTML += `</table>`;
  
    document.getElementById('amortizationTableContainer').innerHTML = tableHTML;
  }
  
  