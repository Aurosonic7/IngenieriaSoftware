let jsonData = [];
const tbody = document.querySelector('#dataTable tbody');
const averageSpan = document.getElementById('average');
const maximumSpan = document.getElementById('maximum');
const minimumSpan = document.getElementById('minimum');
const scatterPlotCanvas = document.getElementById('scatterPlot');

function importExcel() {
    const input = document.getElementById('excelFile');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            tbody.innerHTML = '';

            jsonData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                            <td>${item['Columna 1']}</td>
                            <td>${item['Columna 2']}</td>
                        `;
                tbody.appendChild(row);
            });

            const column2Values = jsonData.map(item => parseFloat(item['Columna 2']));
            const average = column2Values.reduce((acc, value) => acc + value, 0) / column2Values.length;
            const maximum = Math.max(...column2Values);
            const minimum = Math.min(...column2Values);

            averageSpan.textContent = average.toFixed(2);
            maximumSpan.textContent = maximum;
            minimumSpan.textContent = minimum;

            // Crear el gráfico de dispersión
            createScatterPlot(column2Values);
        };

        reader.readAsArrayBuffer(file);
    } else {
        alert('Selecciona un archivo Excel antes de importar.');
    }
}

function createScatterPlot(data) {
    new Chart(scatterPlotCanvas, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos de la Columna 2',
                data: data.map((value, index) => ({ x: index, y: value })),
                showLine: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                pointRadius: 5,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function exportExcel() {
    if (jsonData.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(jsonData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wbout = XLSX.write(wb, wopts);

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const fileName = 'datos.xlsx';

    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
}