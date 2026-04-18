/**
 * RGAA 5.5 / 5.6 — accessibilité des tableaux de réponses.
 *
 * Corrige les tableaux générés par le core PHP de LimeSurvey
 * (5point, 10point, yesnouncertain, multiflexi, texts) qui omettent
 * des attributs ARIA critiques :
 *
 * - RGAA 5.5 : ajoute `scope="row"` sur les `<th>` de tbody et
 *   `scope="col"` sur les `<th>` de thead s'ils n'en ont pas.
 * - RGAA 5.6 : pose `headers="<rowId> <colId>"` sur les `<td>` des
 *   tableaux à double entrée. Génère des id stables si le core n'en
 *   a pas posé.
 */

export function fixTableAccessibility() {
    const tables = document.querySelectorAll('.ls-answers table, .ls-table-wrapper table, .fr-table table');

    tables.forEach(function (table) {
        const tbodyRows = table.querySelectorAll('tbody tr');
        tbodyRows.forEach(function (tr) {
            const th = tr.querySelector('th');
            if (th && !th.hasAttribute('scope')) {
                th.setAttribute('scope', 'row');
            }
        });

        const theadThs = table.querySelectorAll('thead th');
        theadThs.forEach(function (th) {
            if (!th.hasAttribute('scope')) {
                th.setAttribute('scope', 'col');
            }
        });

        const hasColHeaders = table.querySelectorAll('thead th[id]').length > 0;
        const hasRowHeaders = table.querySelectorAll('tbody th[id]').length > 0;

        if (hasColHeaders && hasRowHeaders) {
            const colHeaderIds = [];
            const headerRow = table.querySelector('thead tr:last-child');
            if (headerRow) {
                let thIndex = 0;
                headerRow.querySelectorAll('th').forEach(function (th) {
                    if (th.id) {
                        colHeaderIds[thIndex] = th.id;
                    }
                    thIndex++;
                });
            }

            tbodyRows.forEach(function (tr) {
                const rowTh = tr.querySelector('th[id]');
                if (!rowTh) return;

                const rowHeaderId = rowTh.id;
                let cellIndex = 0;

                tr.querySelectorAll('td, th').forEach(function (cell) {
                    if (cell.tagName === 'TH') {
                        cellIndex++;
                        return;
                    }
                    if (!cell.hasAttribute('headers') && colHeaderIds[cellIndex]) {
                        cell.setAttribute('headers', rowHeaderId + ' ' + colHeaderIds[cellIndex]);
                    }
                    cellIndex++;
                });
            });
        }

        let needsIds = false;
        const allTheadThs = table.querySelectorAll('thead th');
        const allTbodyThs = table.querySelectorAll('tbody th');

        allTheadThs.forEach(function (th) {
            if (!th.id && th.textContent.trim()) needsIds = true;
        });
        allTbodyThs.forEach(function (th) {
            if (!th.id && th.textContent.trim()) needsIds = true;
        });

        if (needsIds) {
            const tableId = table.id || 'tbl-' + Math.random().toString(36).substr(2, 6);

            const colIds = [];
            allTheadThs.forEach(function (th, i) {
                if (!th.id && th.textContent.trim()) {
                    th.id = tableId + '-col-' + i;
                }
                colIds[i] = th.id || null;
            });

            tbodyRows.forEach(function (tr) {
                const th = tr.querySelector('th');
                if (!th) return;

                if (!th.id && th.textContent.trim()) {
                    const rowName = tr.id || 'row-' + Math.random().toString(36).substr(2, 6);
                    th.id = tableId + '-' + rowName;
                }

                if (!th.id) return;

                let cellIndex = 0;
                tr.querySelectorAll('td, th').forEach(function (cell) {
                    if (cell.tagName === 'TH') {
                        cellIndex++;
                        return;
                    }
                    if (!cell.hasAttribute('headers') && colIds[cellIndex]) {
                        cell.setAttribute('headers', th.id + ' ' + colIds[cellIndex]);
                    }
                    cellIndex++;
                });
            });
        }
    });
}
