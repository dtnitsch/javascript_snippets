
// doesn't quite work for multiple table - need to test this
function sl(id, list, x){
    const sorted = {}
    let col_matches = []
    let body_template = ""
    let previous_col = ""
    const sort_icons = { 'asc': '<span class="sort_asc">&#8593;</span>', 'desc': '<span class="sort_desc">&#8595;</span>' };
   
    sort_types = {
        "string": function(a, b) { return ([a[1],a[0]] > [b[1],b[0]] ? 1 : -1); }
        ,"numeric": function(a, b) { return (parseFloat(a[1]) > parseFloat(b[1]) ? 1 : -1); }
    }

    // id doesn't exist
    tbl = document.getElementById(id);
    if (!tbl) {
        return
    }

    // must have the sl class
    if (!document.getElementById(id).classList.contains('sl')) {
        return
    }

    // Make first column sortable if no thead
    if (tbl.getElementsByTagName('thead').length === 0) {
            let head = document.createElement('thead');
            head.appendChild(tbl.rows[0]);
            tbl.insertBefore(head,tbl.firstChild);
    }

    const thead = tbl.querySelector('thead')
    const tbody = tbl.querySelector('tbody')
    const ths = thead.querySelectorAll('th')

    // Set the template
    let body = tbody.innerHTML.replace(/\s\s+/g, ' ');
    body_template = body.trim()
    // Set the column matches
    col_matches = set_column_matches(body_template)
    
    // Iterate TH columns
    for (let [thi,th] of ths.entries()) {
        let timesClickedColumn = 0

        if (th.dataset["col"] === undefined) {
            continue
        }

        th.addEventListener("click", function () {
            
            // sorted["cols"][th.dataset["col"]] = {}
            col = th.dataset["col"]
            
            // See if there is a sort type:  string, numeric, or some custom one
            col_type = th.dataset["colType"]
            if (col_type === undefined || sort_types[col_type] === undefined) {
                col_type = "string"
            }
            
            // initial load
            if (sorted[col] === undefined) {
                load_data(col, col_type)
            }

            // Remove up/down arrows and re-draw then later
            function clear_headers() {
                for(let i = 0, len = ths.length; i < ths.length; i++) {
                    if (typeof ths[i].dataset == "undefined" || typeof ths[i].dataset["col"] == "undefined") { continue; }
                    ths[i].innerHTML = ths[i].innerHTML.replace(/\<span.*?\<\/span\>/,'');
                }
            }

            // Reverse if we are on the same
            if (col == previous_col) {
                sorted[col]['idx'].reverse()
                sorted[col]['order'] = (sorted[col]['order'] == "asc" ? "desc" : "asc")
            } else {
                if (sorted[col]['order'] == "desc") {
                    sorted[col]['idx'].reverse()
                    sorted[col]['order'] = "asc"
                }
            }

            // build a single HTML string and dump it in
            function tbody_results() {
                let res = ""
                let tmp = body_template;
                let len = sorted[col]['idx'].length
                for (let i = 0; i < len; i++) {
                    let tmp = body_template;
                    let idx = sorted[col]['idx'][i]
                    for (let j = 0; j < col_matches.length; j++) {
                        // Example: [ "{{age}}", "age" ]
                        let cm = col_matches[j]
                        let val = list[idx][cm[1]] || ""
                        tmp = tmp.replace(cm[0], val)
                    }
                    res += tmp
                }
                return res
            }
            tbody.style.display = "";
            // Remove the up/down arrows per th
            clear_headers()
            ths[thi].innerHTML += " <span>"+ sort_icons[sorted[col]["order"]] +"</span>";

            tb = tbody_results()
            tbody.innerHTML = tb

            previous_col = col
        })
    }
    
    function load_data(col, col_type) {
        sortable = []
        let len = list.length
        for (let i = 0; i < len; i++) {
            sortable.push([i, (typeof list[i][col] != "undefined" ? String(list[i][col]) : "")]);
        }
        sortable = sortable.sort(sort_types[col_type]);

        sorted[col] = {}
        sorted[col]["idx"] = [];
        sorted[col]["order"] = "asc";
        let len2 = sortable.length
        for (let i = 0; i < len2; i++) {
            sorted[col]['idx'].push(sortable[i][0])
        }
    }

    function set_column_matches(template) {
        const regex = /\{\{(\w+)\}\}/gm;
        const str = template;
        let m;
        let matches = [];

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.last_idx) {
                regex.last_idx++;
            }
            matches.push(m)
        }
        return matches
    }

}